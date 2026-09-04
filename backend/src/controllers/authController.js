import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { uploadImageBuffer, deleteImage } from '../config/blobStorage.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_dev_only';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check for existing email
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Check for existing username
    const existingUsername = await User.findOne({ username: username.trim() });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl || '',
        bio: user.bio || '',
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during signup',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl || '',
        bio: user.bio || '',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl || '',
        bio: user.bio || '',
      },
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user profile',
    });
  }
};

// @desc    Update current user profile / settings
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { username, email, resetPassword, newPassword, bio, removeAvatar } = req.body;
    let usernameChanged = false;
    let newUsername = user.username;

    // 1. Reset Password without any validation (dev mode per user request)
    const passwordToSet = resetPassword || newPassword;
    if (passwordToSet) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(passwordToSet, salt);
    }

    // 2. Avatar image upload or removal
    if (req.file) {
      if (user.avatarUrl) {
        await deleteImage(user.avatarUrl);
      }
      user.avatarUrl = await uploadImageBuffer(
        req.file.buffer,
        req.file.mimetype,
        'avatars',
        req.file.originalname
      );
    } else if (removeAvatar === 'true' || removeAvatar === true) {
      if (user.avatarUrl) {
        await deleteImage(user.avatarUrl);
      }
      user.avatarUrl = '';
    }

    // 3. Bio update
    if (bio !== undefined) {
      user.bio = bio.trim();
    }

    // 4. Email update if provided and changed
    if (email && email.toLowerCase().trim() !== user.email) {
      const normalizedEmail = email.toLowerCase().trim();
      const existingEmail = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists',
        });
      }
      user.email = normalizedEmail;
    }

    // 5. Username update if provided and changed
    if (username && username.trim() !== user.username) {
      const trimmedUsername = username.trim();
      if (trimmedUsername.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Username must be at least 3 characters long',
        });
      }

      const existingUsername = await User.findOne({
        username: trimmedUsername,
        _id: { $ne: user._id },
      });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken',
        });
      }

      usernameChanged = true;
      newUsername = trimmedUsername;
      user.username = trimmedUsername;
    }

    await user.save();

    // Generate fresh JWT token with updated username/email
    const token = generateToken(user);
    const userId = user._id;

    // Send HTTP 200 response immediately so UI never blocks
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl || '',
        bio: user.bio || '',
      },
    });

    // Non-blocking background sync across posts, likes, and comments (Option B)
    if (usernameChanged || req.file || removeAvatar) {
      setImmediate(async () => {
        try {
          const syncTasks = [];

          if (usernameChanged) {
            syncTasks.push(
              Post.updateMany(
                { 'author.userId': userId },
                { $set: { 'author.username': newUsername } }
              ),
              Post.updateMany(
                { 'likes.userId': userId },
                { $set: { 'likes.$[elem].username': newUsername } },
                { arrayFilters: [{ 'elem.userId': userId }] }
              ),
              Post.updateMany(
                { 'comments.userId': userId },
                { $set: { 'comments.$[elem].username': newUsername } },
                { arrayFilters: [{ 'elem.userId': userId }] }
              )
            );
          }

          if (req.file || removeAvatar) {
            syncTasks.push(
              Post.updateMany(
                { 'author.userId': userId },
                { $set: { 'author.avatarUrl': user.avatarUrl } }
              ),
              Post.updateMany(
                { 'comments.userId': userId },
                { $set: { 'comments.$[elem].avatarUrl': user.avatarUrl } },
                { arrayFilters: [{ 'elem.userId': userId }] }
              )
            );
          }

          await Promise.all(syncTasks);
        } catch (syncErr) {
          console.error('Background profile synchronization error:', syncErr);
        }
      });
    }
  } catch (error) {
    console.error('updateProfile error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating profile',
    });
  }
};

export {
  signup,
  login,
  getMe,
  updateProfile,
};
