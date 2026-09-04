import React, { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  InputBase,
  Box,
  Button,
  IconButton,
  Divider,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const CreatePostCard = ({ onPostCreated, onOpenAuth }) => {
  const { isAuthenticated } = useAuth();
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const canSubmit = (text.trim().length > 0 || selectedImage !== null) && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }

    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (text.trim()) {
        formData.append('text', text.trim());
      }
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const res = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setText('');
        handleRemoveImage();
        if (onPostCreated) {
          onPostCreated(res.data.post);
        }
      }
    } catch (err) {
      console.error('Error creating post:', err);
      alert(err.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      id="create-post-card"
      sx={{
        backgroundColor: '#ffffff',
        borderRadius: 4,
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: 2 } }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1.5,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1.15rem',
              color: '#111827',
            }}
          >
            Create Post
          </Typography>

          <Box
            sx={{
              display: 'inline-flex',
              bgcolor: '#e5e7eb',
              borderRadius: 20,
              p: 0.3,
            }}
          >
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: '#ffffff',
                px: 1.8,
                py: 0.3,
                borderRadius: 20,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              All Posts
            </Box>
          </Box>
        </Box>

        {/* Text Input */}
        <InputBase
          placeholder="What's on your mind?"
          multiline
          minRows={2}
          maxRows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          fullWidth
          sx={{
            fontSize: '1rem',
            color: '#1e293b',
            mb: 1,
            '& input::placeholder': {
              color: '#94a3b8',
              opacity: 1,
            },
          }}
        />

        {/* Image Preview */}
        {previewUrl && (
          <Box
            sx={{
              position: 'relative',
              width: 'fit-content',
              maxWidth: '100%',
              mb: 1.5,
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid rgba(0, 0, 0, 0.1)',
            }}
          >
            <Box
              component="img"
              src={previewUrl}
              alt="Post preview"
              sx={{
                display: 'block',
                maxHeight: 200,
                maxWidth: '100%',
                objectFit: 'cover',
                borderRadius: 2,
              }}
            />
            <IconButton
              size="small"
              onClick={handleRemoveImage}
              sx={{
                position: 'absolute',
                top: 6,
                right: 6,
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                color: '#ffffff',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.8)',
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        <Divider sx={{ my: 1.5, borderColor: 'rgba(0, 0, 0, 0.06)' }} />

        {/* Action Row */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Media Attachments */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <Tooltip title="Attach photo">
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  color: 'primary.main',
                  bgcolor: 'rgba(24, 119, 242, 0.08)',
                  '&:hover': {
                    bgcolor: 'rgba(24, 119, 242, 0.16)',
                  },
                }}
              >
                <PhotoCameraIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Submit Button */}
          <Button
            variant="contained"
            disabled={!canSubmit}
            onClick={handleSubmit}
            endIcon={
              submitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SendIcon sx={{ fontSize: '1rem !important' }} />
              )
            }
            sx={{
              borderRadius: 20,
              px: 3,
              py: 0.8,
              fontWeight: 600,
              bgcolor: canSubmit ? 'primary.main' : '#cbd5e1',
              color: canSubmit ? '#ffffff' : '#64748b',
              '&.Mui-disabled': {
                bgcolor: '#e2e8f0',
                color: '#94a3b8',
              },
            }}
          >
            Post
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CreatePostCard;
