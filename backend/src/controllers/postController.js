import Post from '../models/Post.js';
import { uploadImageBuffer } from '../config/blobStorage.js';

// Helper to format post for response matching spec
const formatPost = (post, currentUserId) => {
  const postObj = post.toObject ? post.toObject() : post;
  const likedByCurrentUser = currentUserId
    ? (postObj.likes || []).some(
        (like) => like.userId.toString() === currentUserId.toString()
      )
    : false;

  return {
    _id: postObj._id,
    author: {
      userId: postObj.author?.userId,
      username: postObj.author?.username || 'Unknown',
    },
    text: postObj.text || '',
    imageUrl: postObj.imageUrl || '',
    likes: postObj.likes || [],
    likeCount: postObj.likes ? postObj.likes.length : 0,
    likedByCurrentUser,
    comments: postObj.comments || [],
    commentCount: postObj.comments ? postObj.comments.length : 0,
    createdAt: postObj.createdAt,
  };
};

// @desc    Get paginated feed of posts
// @route   GET /api/posts
// @access  Public (optional auth for likedByCurrentUser)
const getPosts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;
    const sort = req.query.sort || 'newest';
    const search = req.query.search ? req.query.search.trim() : '';

    const currentUserId = req.user ? req.user.id : null;

    // Search filter
    const matchFilter = {};
    if (search) {
      matchFilter.$or = [
        { text: { $regex: search, $options: 'i' } },
        { 'author.username': { $regex: search, $options: 'i' } },
      ];
    }

    if (sort === 'mostLiked' || sort === 'mostCommented') {
      // Aggregation for array-size sorting
      const sortField = sort === 'mostLiked' ? 'likeCount' : 'commentCount';
      const arrayField = sort === 'mostLiked' ? '$likes' : '$comments';

      const pipeline = [
        { $match: matchFilter },
        {
          $addFields: {
            likeCount: { $size: { $ifNull: ['$likes', []] } },
            commentCount: { $size: { $ifNull: ['$comments', []] } },
          },
        },
        { $sort: { [sortField]: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ];

      const [posts, totalCountResult] = await Promise.all([
        Post.aggregate(pipeline),
        Post.countDocuments(matchFilter),
      ]);

      const totalPages = Math.ceil(totalCountResult / limit);
      const formattedPosts = posts.map((p) => formatPost(p, currentUserId));

      return res.status(200).json({
        success: true,
        posts: formattedPosts,
        pagination: {
          totalPosts: totalCountResult,
          currentPage: page,
          totalPages,
          hasMore: page < totalPages,
          limit,
        },
      });
    }

    // Default: newest first
    const [posts, totalPosts] = await Promise.all([
      Post.find(matchFilter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Post.countDocuments(matchFilter),
    ]);

    const totalPages = Math.ceil(totalPosts / limit);
    const formattedPosts = posts.map((p) => formatPost(p, currentUserId));

    return res.status(200).json({
      success: true,
      posts: formattedPosts,
      pagination: {
        totalPosts,
        currentPage: page,
        totalPages,
        hasMore: page < totalPages,
        limit,
      },
    });
  } catch (error) {
    console.error('getPosts error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching posts',
    });
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const text = req.body.text ? req.body.text.trim() : '';
    let imageUrl = req.body.imageUrl ? req.body.imageUrl.trim() : '';

    // Handle file upload if present
    if (req.file) {
      imageUrl = await uploadImageBuffer(
        req.file.buffer,
        req.file.mimetype,
        'social_posts',
        req.file.originalname
      );
    }

    // Validate that at least one of text or imageUrl is present
    if (!text && !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'A post must contain at least text or an image. Empty posts are not allowed.',
      });
    }

    const newPost = await Post.create({
      author: {
        userId: req.user.id,
        username: req.user.username,
      },
      text,
      imageUrl,
      likes: [],
      comments: [],
    });

    return res.status(201).json({
      success: true,
      post: formatPost(newPost, req.user.id),
    });
  } catch (error) {
    console.error('createPost error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating post',
    });
  }
};

// @desc    Toggle like / unlike on a post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const userIdStr = req.user.id.toString();
    const existingIndex = post.likes.findIndex(
      (like) => like.userId.toString() === userIdStr
    );

    let liked;
    if (existingIndex > -1) {
      // User already liked -> unlike
      post.likes.splice(existingIndex, 1);
      liked = false;
    } else {
      // User hasn't liked -> like
      post.likes.push({
        userId: req.user.id,
        username: req.user.username,
      });
      liked = true;
    }

    await post.save();

    return res.status(200).json({
      success: true,
      liked,
      likeCount: post.likes.length,
      likes: post.likes,
    });
  } catch (error) {
    console.error('toggleLike error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error toggling like',
    });
  }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comment
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text cannot be empty',
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const newComment = {
      userId: req.user.id,
      username: req.user.username,
      text: text.trim(),
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    const savedComment = post.comments[post.comments.length - 1];

    return res.status(201).json({
      success: true,
      comment: savedComment,
      commentCount: post.comments.length,
      comments: post.comments,
    });
  } catch (error) {
    console.error('addComment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error adding comment',
    });
  }
};

export {
  getPosts,
  createPost,
  toggleLike,
  addComment,
};
