import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import api from '../api/client';

const EditPostModal = ({ open, onClose, post, onPostUpdated }) => {
  const [text, setText] = useState(post?.text || '');
  const [currentImageUrl, setCurrentImageUrl] = useState(post?.imageUrl || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  // Sync state whenever post changes or modal opens
  React.useEffect(() => {
    if (open && post) {
      setText(post.text || '');
      setCurrentImageUrl(post.imageUrl || '');
      setSelectedFile(null);
      setPreviewUrl('');
      setRemoveImage(false);
      setError('');
    }
  }, [open, post]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (PNG, JPG, WebP, GIF)');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setRemoveImage(false);
      setError('');
    }
  };

  const handleRemoveExistingImage = () => {
    setRemoveImage(true);
    setCurrentImageUrl('');
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedText = text.trim();
    const hasImage = Boolean(selectedFile || (!removeImage && currentImageUrl));

    if (!trimmedText && !hasImage) {
      setError('A post must contain at least text or an image. Both cannot be empty.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('text', trimmedText);

      if (selectedFile) {
        formData.append('image', selectedFile);
      } else if (removeImage) {
        formData.append('removeImage', 'true');
      }

      const res = await api.put(`/posts/${post._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        onPostUpdated(res.data.post);
        onClose();
      }
    } catch (err) {
      console.error('Failed to update post:', err);
      setError(err.response?.data?.message || 'Failed to update post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          fontWeight: 700,
          color: '#0f172a',
        }}
      >
        Edit Post
        <IconButton
          onClick={onClose}
          disabled={loading}
          size="small"
          sx={{ color: '#64748b' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Text Field */}
        <TextField
          multiline
          rows={3}
          fullWidth
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          variant="outlined"
          disabled={loading}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: '#f8fafc',
            },
          }}
        />

        {/* Current Image or New Selected Image Preview */}
        {previewUrl ? (
          <Box sx={{ position: 'relative', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
            <Box
              component="img"
              src={previewUrl}
              alt="New post media preview"
              sx={{
                width: '100%',
                maxHeight: 280,
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <IconButton
              onClick={handleRemoveSelectedFile}
              disabled={loading}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                color: '#ffffff',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
              }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : !removeImage && currentImageUrl ? (
          <Box sx={{ position: 'relative', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
            <Box
              component="img"
              src={currentImageUrl}
              alt="Current post media"
              sx={{
                width: '100%',
                maxHeight: 280,
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <IconButton
              onClick={handleRemoveExistingImage}
              disabled={loading}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(239, 68, 68, 0.85)',
                color: '#ffffff',
                '&:hover': { bgcolor: '#ef4444' },
              }}
              size="small"
              title="Remove photo"
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : null}

        {/* Media Upload Trigger */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddPhotoAlternateOutlinedIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {previewUrl || (!removeImage && currentImageUrl) ? 'Replace Photo' : 'Add Photo'}
          </Button>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ color: '#64748b', fontWeight: 600, textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            borderRadius: 2,
            px: 3,
            fontWeight: 700,
            textTransform: 'none',
            bgcolor: 'primary.main',
          }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPostModal;
