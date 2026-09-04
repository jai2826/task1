import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  IconButton,
  Button,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useAuth } from '../context/AuthContext';
import CommentSection from './CommentSection';
import api from '../api/client';

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

const PostCard = ({ post, onOpenAuth }) => {
  const { user, isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(post.likedByCurrentUser || false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  // Sync state if post prop changes
  React.useEffect(() => {
    setLiked(post.likedByCurrentUser || false);
    setLikeCount(post.likeCount || 0);
    setComments(post.comments || []);
    setCommentCount(post.commentCount || 0);
  }, [post]);

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }

    if (likeLoading) return;

    // Optimistic Update
    const prevLiked = liked;
    const prevCount = likeCount;

    const newLiked = !prevLiked;
    const newCount = newLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

    setLiked(newLiked);
    setLikeCount(newCount);
    setLikeLoading(true);

    try {
      const res = await api.post(`/posts/${post._id}/like`);
      if (res.data.success) {
        setLiked(res.data.liked);
        setLikeCount(res.data.likeCount);
      }
    } catch (err) {
      console.error('Like toggle failed:', err);
      // Revert on error
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments((prev) => [...prev, newComment]);
    setCommentCount((prev) => prev + 1);
  };

  const authorInitial = post.author?.username
    ? post.author.username.charAt(0).toUpperCase()
    : 'U';

  return (
    <Card
      sx={{
        backgroundColor: '#ffffff',
        borderRadius: 2, // reduced by 50%
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: 2 } }}>
        {/* Author Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: '#3b82f6',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              width: 40,
              height: 40,
              fontWeight: 700,
              fontSize: '1rem',
            }}
          >
            {authorInitial}
          </Avatar>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}
            >
              @{post.author?.username || 'Anonymous'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              {formatTimeAgo(post.createdAt)}
            </Typography>
          </Box>
        </Box>

        {/* Post Text */}
        {post.text && (
          <Typography
            variant="body1"
            sx={{
              color: '#334155',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              mb: post.imageUrl ? 1.5 : 1,
              fontSize: '0.98rem',
              lineHeight: 1.5,
            }}
          >
            {post.text}
          </Typography>
        )}

        {/* Post Image */}
        {post.imageUrl && (
          <Box
            sx={{
              borderRadius: 1.5, // reduced by 50%
              overflow: 'hidden',
              mb: 1.5,
              backgroundColor: '#f1f5f9',
              border: '1px solid rgba(0, 0, 0, 0.04)',
              maxHeight: 450,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              component="img"
              src={post.imageUrl}
              alt="Post media"
              loading="lazy"
              sx={{
                width: '100%',
                maxHeight: 450,
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </Box>
        )}

        {/* Engagement Row (Like & Comment) */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            pt: 0.5,
          }}
        >
          {/* Like Button */}
          <Button
            size="small"
            onClick={handleToggleLike}
            startIcon={
              liked ? (
                <FavoriteIcon sx={{ color: '#ef4444' }} />
              ) : (
                <FavoriteBorderIcon sx={{ color: '#64748b' }} />
              )
            }
            sx={{
              borderRadius: 10, // reduced by 50%
              px: 1.5,
              py: 0.5,
              color: liked ? '#ef4444' : '#64748b',
              fontWeight: 600,
              fontSize: '0.875rem',
              bgcolor: liked ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
              '&:hover': {
                bgcolor: liked ? 'rgba(239, 68, 68, 0.14)' : '#f1f5f9',
              },
            }}
          >
            {likeCount}
          </Button>

          {/* Comment Button */}
          <Button
            size="small"
            onClick={() => setShowComments((prev) => !prev)}
            startIcon={<ChatBubbleOutlineIcon sx={{ color: '#64748b' }} />}
            sx={{
              borderRadius: 10, // reduced by 50%
              px: 1.5,
              py: 0.5,
              color: '#64748b',
              fontWeight: 600,
              fontSize: '0.875rem',
              bgcolor: showComments ? '#f1f5f9' : 'transparent',
              '&:hover': {
                bgcolor: '#f1f5f9',
              },
            }}
          >
            {commentCount}
          </Button>
        </Box>

        {/* Comment Section Drawer */}
        {showComments && (
          <CommentSection
            postId={post._id}
            comments={comments}
            onCommentAdded={handleCommentAdded}
            onOpenAuth={onOpenAuth}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;
