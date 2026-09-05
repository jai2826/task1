import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LockResetIcon from '@mui/icons-material/LockReset';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const PROTECTED_DEMO_ACCOUNTS = [
  'sophia.codes@example.com',
  'marcus.dev@example.com',
  'elena.design@example.com',
  'sophia_codes',
  'marcus_dev',
  'elena_design',
];

const SettingsModal = ({ open, onClose, onProfileUpdated }) => {
  const { user, updateUser } = useAuth();

  const isProtectedDemoAccount = Boolean(
    user && (
      PROTECTED_DEMO_ACCOUNTS.includes(user.email?.toLowerCase()) ||
      PROTECTED_DEMO_ACCOUNTS.includes(user.username?.toLowerCase())
    )
  );

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [resetPassword, setResetPassword] = useState('');

  // Avatar states
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Sync state whenever modal opens or user updates
  useEffect(() => {
    if (open && user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setBio(user.bio || '');
      setResetPassword('');
      setAvatarFile(null);
      setAvatarPreview(user.avatarUrl || '');
      setRemoveAvatar(false);
      setError('');
    }
  }, [open, user]);

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPEG, PNG, WebP, GIF)');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setRemoveAvatar(false);
      setError('');
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview('');
    setRemoveAvatar(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername || trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (!trimmedEmail) {
      setError('Email cannot be empty');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', trimmedUsername);
      formData.append('email', trimmedEmail);
      formData.append('bio', bio.trim());

      // Password reset without validation (dev mode, disabled on demo accounts)
      if (resetPassword) {
        if (isProtectedDemoAccount) {
          setError('Password changes are disabled for this demo account. Please create a new account to test password changes.');
          setLoading(false);
          return;
        }
        formData.append('resetPassword', resetPassword);
      }

      // Avatar handling
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      } else if (removeAvatar) {
        formData.append('removeAvatar', 'true');
      }

      const res = await api.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        // Update user state and token in AuthContext
        updateUser(res.data.user, res.data.token);

        if (onProfileUpdated) {
          onProfileUpdated(res.data.user);
        }

        onClose();
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          p: 0.5,
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
        Account Settings
        <IconButton
          onClick={onClose}
          disabled={loading}
          size="small"
          sx={{ color: '#64748b' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2, pb: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* 1. Avatar Image Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2.5 }}>
          <Box sx={{ position: 'relative', mb: 1.5 }}>
            <Avatar
              src={avatarPreview || undefined}
              sx={{
                width: 72,
                height: 72,
                fontSize: '1.75rem',
                fontWeight: 700,
                bgcolor: '#3b82f6',
                background: avatarPreview ? undefined : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              {username ? username.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleAvatarFileChange}
            />
            <IconButton
              size="small"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                bgcolor: 'primary.main',
                color: '#ffffff',
                border: '2px solid #ffffff',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
              title="Upload avatar photo"
            >
              <PhotoCameraIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              sx={{ textTransform: 'none', fontSize: '0.75rem', borderRadius: 1.5 }}
            >
              {avatarPreview ? 'Change Photo' : 'Upload Photo'}
            </Button>
            {avatarPreview && (
              <Button
                size="small"
                color="error"
                onClick={handleRemoveAvatar}
                disabled={loading}
                startIcon={<DeleteOutlineIcon sx={{ fontSize: 14 }} />}
                sx={{ textTransform: 'none', fontSize: '0.75rem', borderRadius: 1.5 }}
              >
                Remove
              </Button>
            )}
          </Box>
        </Box>

        {/* 2. Profile Details Section */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <PersonOutlineIcon fontSize="small" sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Profile Details
            </Typography>
          </Box>

          <TextField
            label="Username"
            fullWidth
            size="small"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            helperText="Changing username automatically updates past posts, likes, and comments"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
            }}
          />

          <TextField
            label="Email Address"
            type="email"
            fullWidth
            size="small"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
            }}
          />

          <TextField
            label="Bio (About you)"
            multiline
            rows={2}
            fullWidth
            size="small"
            placeholder="A short sentence about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={loading}
            inputProps={{ maxLength: 160 }}
            helperText={`${bio.length}/160 characters`}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
            }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 3. Reset Password Section */}
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LockResetIcon fontSize="small" sx={{ color: isProtectedDemoAccount ? '#94a3b8' : 'primary.main' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Reset Password
            </Typography>
          </Box>

          {isProtectedDemoAccount ? (
            <Alert
              severity="warning"
              icon={<InfoOutlinedIcon fontSize="small" />}
              sx={{
                mb: 1.5,
                borderRadius: 1.5,
                fontSize: '0.8rem',
                py: 0.6,
                '& .MuiAlert-message': { p: 0.2 },
              }}
            >
              <strong>Demo Account Protected:</strong> You cannot change the password of this shared demo account (<code>{user?.username}</code>). Please create a new account to test password changes and settings.
            </Alert>
          ) : (
            <Alert
              severity="info"
              icon={<InfoOutlinedIcon fontSize="small" />}
              sx={{
                mb: 1.5,
                borderRadius: 1.5,
                fontSize: '0.78rem',
                py: 0.3,
                '& .MuiAlert-message': { p: 0.3 },
              }}
            >
              <strong>Development Mode:</strong> Password reset operates directly without validation (no current password or minimum length checks required). Strict validation can be added for production.
            </Alert>
          )}

          <TextField
            label="New Password"
            type="password"
            fullWidth
            size="small"
            placeholder={isProtectedDemoAccount ? "Password reset is locked for this demo account" : "Enter any new password to reset directly"}
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
            disabled={loading || isProtectedDemoAccount}
            helperText={isProtectedDemoAccount ? "Password change disabled to ensure shared access remains active for all users." : "Leave empty if you do not wish to change your password"}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 1.8 }}>
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
            borderRadius: 1.5,
            px: 2.5,
            fontWeight: 700,
            textTransform: 'none',
          }}
        >
          {loading ? <CircularProgress size={18} color="inherit" /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsModal;
