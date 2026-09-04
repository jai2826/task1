import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  InputBase,
  IconButton,
  CircularProgress,
  Divider,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../context/AuthContext';
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

const CommentSection = ({ postId, comments = [], onCommentAdded, onOpenAuth }) => {
  const { user, isAuthenticated } = useAuth();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }

    if (!text.trim() || submitting) return;

    const trimmedText = text.trim();
    setText('');
    setSubmitting(true);

    // Optimistic comment object
    const optimisticComment = {
      _id: `temp-${Date.now()}`,
      userId: user.id,
      username: user.username,
      text: trimmedText,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await api.post(`/posts/${postId}/comment`, { text: trimmedText });
      if (res.data.success) {
        onCommentAdded(res.data.comment);
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert(err.response?.data?.message || 'Failed to post comment');
      // Revert if error
      setText(trimmedText);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
      {/* Existing Comments List */}
      {comments.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mb: 2 }}>
          {comments.map((comment, index) => (
            <Box
              key={comment._id || index}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.2,
              }}
            >
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  bgcolor: '#3b82f6',
                }}
              >
                {comment.username ? comment.username.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Box
                sx={{
                  flex: 1,
                  bgcolor: '#f8fafc',
                  px: 1.5,
                  py: 1,
                  borderRadius: 2.5,
                  border: '1px solid rgba(0, 0, 0, 0.04)',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    mb: 0.3,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: '#1e293b' }}
                  >
                    @{comment.username}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: '#94a3b8', fontSize: '0.7rem' }}
                  >
                    {formatTimeAgo(comment.createdAt)}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: '#334155', wordBreak: 'break-word', fontSize: '0.875rem' }}
                >
                  {comment.text}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Add Comment Input */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: '#f1f5f9',
          borderRadius: 20,
          px: 1.5,
          py: 0.4,
        }}
      >
        <InputBase
          placeholder={isAuthenticated ? "Write a comment..." : "Log in to comment..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          fullWidth
          sx={{
            fontSize: '0.875rem',
            color: '#1e293b',
            '& input::placeholder': {
              color: '#94a3b8',
              opacity: 1,
            },
          }}
          disabled={submitting}
        />
        <IconButton
          type="submit"
          disabled={!text.trim() || submitting}
          size="small"
          sx={{
            color: text.trim() ? 'primary.main' : '#94a3b8',
            p: 0.5,
          }}
        >
          {submitting ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <SendIcon fontSize="small" />
          )}
        </IconButton>
      </Box>
    </Box>
  );
};

export default CommentSection;
