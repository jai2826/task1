import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  InputBase,
  IconButton,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';
import { getAvatarGradient } from '../utils/avatar';
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

const CommentSection = ({
  postId,
  comments = [],
  onCommentAdded,
  onCommentUpdated,
  onCommentDeleted,
  onOpenAuth,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Comment State
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Comment State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCommentForDelete, setSelectedCommentForDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

    try {
      const res = await api.post(`/posts/${postId}/comment`, { text: trimmedText });
      if (res.data.success) {
        onCommentAdded(res.data.comment);
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert(err.response?.data?.message || 'Failed to post comment');
      setText(trimmedText);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (comment) => {
    setEditingCommentId(comment._id);
    setEditCommentText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const handleSaveEdit = async (commentId) => {
    if (!editCommentText.trim()) return;
    setSavingEdit(true);

    try {
      const res = await api.put(`/posts/${postId}/comments/${commentId}`, {
        text: editCommentText.trim(),
      });
      if (res.data.success) {
        if (onCommentUpdated) {
          onCommentUpdated(res.data.comment);
        }
        setEditingCommentId(null);
        setEditCommentText('');
      }
    } catch (err) {
      console.error('Failed to edit comment:', err);
      alert(err.response?.data?.message || 'Failed to edit comment');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCommentForDelete) return;
    setDeleting(true);

    try {
      const res = await api.delete(`/posts/${postId}/comments/${selectedCommentForDelete._id}`);
      if (res.data.success) {
        if (onCommentDeleted) {
          onCommentDeleted(selectedCommentForDelete._id);
        }
        setDeleteDialogOpen(false);
        setSelectedCommentForDelete(null);
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert(err.response?.data?.message || 'Failed to delete comment');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
      {/* Existing Comments List */}
      {comments.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mb: 2 }}>
          {comments.map((comment, index) => {
            const isCommentOwner = Boolean(
              user &&
              comment.userId &&
              (user._id === comment.userId || user.id === comment.userId)
            );
            const isEditing = editingCommentId === comment._id;

            return (
              <Box
                key={comment._id || index}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.2,
                }}
              >
                <Avatar
                  src={comment.avatarUrl || undefined}
                  sx={{
                    width: 28,
                    height: 28,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: getAvatarGradient(comment.username || comment.userId),
                    color: '#ffffff',
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
                    borderRadius: 1.25,
                    border: '1px solid rgba(0, 0, 0, 0.04)',
                  }}
                >
                  {/* Comment Author Header & Owner Actions */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 0.3,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
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

                    {/* Only Comment Owner can Edit or Delete */}
                    {isCommentOwner && !isEditing && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleStartEdit(comment)}
                          sx={{ p: 0.2, color: '#64748b', '&:hover': { color: 'primary.main' } }}
                          title="Edit comment"
                        >
                          <EditOutlinedIcon sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedCommentForDelete(comment);
                            setDeleteDialogOpen(true);
                          }}
                          sx={{ p: 0.2, color: '#64748b', '&:hover': { color: '#ef4444' } }}
                          title="Delete comment"
                        >
                          <DeleteOutlineIcon sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                      </Box>
                    )}
                  </Box>

                  {/* Comment Content / Inline Edit Form */}
                  {isEditing ? (
                    <Box sx={{ mt: 0.5 }}>
                      <InputBase
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        fullWidth
                        multiline
                        autoFocus
                        disabled={savingEdit}
                        sx={{
                          fontSize: '0.875rem',
                          color: '#1e293b',
                          bgcolor: '#ffffff',
                          p: 0.8,
                          borderRadius: 1,
                          border: '1px solid #cbd5e1',
                        }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.8, mt: 0.8 }}>
                        <Button
                          size="small"
                          onClick={handleCancelEdit}
                          disabled={savingEdit}
                          sx={{ textTransform: 'none', fontSize: '0.75rem', color: '#64748b', minWidth: 'auto', px: 1 }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleSaveEdit(comment._id)}
                          disabled={!editCommentText.trim() || savingEdit}
                          sx={{ textTransform: 'none', fontSize: '0.75rem', minWidth: 'auto', px: 1.5 }}
                        >
                          {savingEdit ? <CircularProgress size={14} color="inherit" /> : 'Save'}
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ color: '#334155', wordBreak: 'break-word', fontSize: '0.875rem' }}
                    >
                      {comment.text}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
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
          borderRadius: 10,
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

      {/* Delete Comment Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={deleting ? undefined : () => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#0f172a' }}>
          Delete Comment?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#475569', fontSize: '0.9rem' }}>
            Are you sure you want to permanently delete this comment?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 1.5 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
            sx={{ textTransform: 'none', color: '#64748b', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deleting}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5 }}
          >
            {deleting ? <CircularProgress size={18} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommentSection;
