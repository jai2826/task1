import mongoose from 'mongoose';

const LikeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const CommentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PostSchema = new mongoose.Schema(
  {
    author: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
      avatarUrl: {
        type: String,
        default: '',
      },
    },
    text: {
      type: String,
      trim: true,
      default: '',
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    likes: [LikeSchema],
    comments: [CommentSchema],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'posts',
  }
);

// Custom validation: At least one of text or imageUrl must be present
PostSchema.path('text').validate(function (value) {
  const hasText = Boolean(value && value.trim().length > 0);
  const hasImage = Boolean(this.imageUrl && this.imageUrl.trim().length > 0);
  return hasText || hasImage;
}, 'Post must contain at least text or an image. Both cannot be empty.');

// Index for newest feed queries
PostSchema.index({ createdAt: -1 });

export default mongoose.model('Post', PostSchema);
