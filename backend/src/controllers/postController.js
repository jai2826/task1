import Post from '../models/Post.js';
import User from '../models/User.js';
import { uploadImageBuffer, deleteImage } from '../config/blobStorage.js';

// Helper to format post for response matching spec
const formatPost = (post, currentUserId) => {
  const postObj = post.toObject ? post.toObject() : post;
  const likedByCurrentUser = currentUserId
    ? (postObj.likes || []).some(
        (like) => like.userId.toString() === currentUserId.toString()
      )
    : false;

  const authorUserId = postObj.author?.userId?._id || postObj.author?.userId;
  const authorAvatarUrl = postObj.author?.userId?.avatarUrl || postObj.author?.avatarUrl || '';

  const formattedComments = (postObj.comments || []).map((c) => {
    const commentObj = c.toObject ? c.toObject() : c;
    const commentUserId = commentObj.userId?._id || commentObj.userId;
    const commentAvatarUrl =
      commentObj.userId?.avatarUrl || commentObj.avatarUrl || '';

    return {
      _id: commentObj._id,
      userId: commentUserId,
      username: commentObj.username,
      avatarUrl: commentAvatarUrl,
      text: commentObj.text,
      createdAt: commentObj.createdAt,
    };
  });

  return {
    _id: postObj._id,
    author: {
      userId: authorUserId,
      username: postObj.author?.username || 'Unknown',
      avatarUrl: authorAvatarUrl,
    },
    text: postObj.text || '',
    imageUrl: postObj.imageUrl || '',
    likes: postObj.likes || [],
    likeCount: postObj.likes ? postObj.likes.length : 0,
    likedByCurrentUser,
    comments: formattedComments,
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

      await Post.populate(posts, [
        { path: 'author.userId', select: 'avatarUrl' },
        { path: 'comments.userId', select: 'avatarUrl' },
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
      Post.find(matchFilter)
        .populate('author.userId', 'avatarUrl')
        .populate('comments.userId', 'avatarUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
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
        avatarUrl: req.user.avatarUrl || '',
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

    const commenterUser = await User.findById(req.user.id);
    const commentAvatarUrl = commenterUser?.avatarUrl || req.user.avatarUrl || '';

    const newComment = {
      userId: req.user.id,
      username: req.user.username,
      avatarUrl: commentAvatarUrl,
      text: text.trim(),
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    const savedComment = post.comments[post.comments.length - 1];

    return res.status(201).json({
      success: true,
      comment: {
        _id: savedComment._id,
        userId: savedComment.userId,
        username: savedComment.username,
        avatarUrl: commentAvatarUrl,
        text: savedComment.text,
        createdAt: savedComment.createdAt,
      },
      commentCount: post.comments.length,
      comments: formatPost(post, req.user.id).comments,
    });
  } catch (error) {
    console.error('addComment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error adding comment',
    });
  }
};

// @desc    Update a post (only author)
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Authorization: Only the author can update
    if (post.author.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this post',
      });
    }

    let text = req.body.text !== undefined ? req.body.text.trim() : post.text;
    let imageUrl = post.imageUrl;

    // Handle image removal flag
    if (req.body.removeImage === 'true' || req.body.removeImage === true) {
      if (post.imageUrl) {
        await deleteImage(post.imageUrl);
      }
      imageUrl = '';
    }

    // Handle new image upload
    if (req.file) {
      // Clean up previous image if it existed
      if (post.imageUrl) {
        await deleteImage(post.imageUrl);
      }
      imageUrl = await uploadImageBuffer(
        req.file.buffer,
        req.file.mimetype,
        'social_posts',
        req.file.originalname
      );
    } else if (req.body.imageUrl !== undefined && req.body.removeImage !== 'true' && req.body.removeImage !== true) {
      imageUrl = req.body.imageUrl.trim();
    }

    // Validate that at least text or imageUrl remains
    if (!text && !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'A post must contain at least text or an image. Empty posts are not allowed.',
      });
    }

    post.text = text;
    post.imageUrl = imageUrl;
    await post.save();

    return res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post: formatPost(post, req.user.id),
    });
  } catch (error) {
    console.error('updatePost error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating post',
    });
  }
};

// @desc    Delete a post (only author)
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Authorization: Only author can delete
    if (post.author.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post',
      });
    }

    // Delete image from blob storage if present
    if (post.imageUrl) {
      await deleteImage(post.imageUrl);
    }

    await Post.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      postId: req.params.id,
    });
  } catch (error) {
    console.error('deletePost error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting post',
    });
  }
};

// @desc    Update a comment (only comment owner)
// @route   PUT /api/posts/:postId/comments/:commentId
// @access  Private
const updateComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text cannot be empty',
      });
    }

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Authorization: Strictly the comment owner (post owner has NO right to edit another's comment)
    if (comment.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this comment',
      });
    }

    comment.text = text.trim();
    await post.save();

    return res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      comment,
      comments: post.comments,
    });
  } catch (error) {
    console.error('updateComment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating comment',
    });
  }
};

// @desc    Delete a comment (only comment owner)
// @route   DELETE /api/posts/:postId/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Authorization: Strictly the comment owner (post owner has NO right to delete another's comment)
    if (comment.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this comment',
      });
    }

    post.comments.pull(req.params.commentId);
    await post.save();

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      commentCount: post.comments.length,
      comments: post.comments,
    });
  } catch (error) {
    console.error('deleteComment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting comment',
    });
  }
};

export {
  getPosts,
  createPost,
  toggleLike,
  addComment,
  updatePost,
  deletePost,
  updateComment,
  deleteComment,
};
