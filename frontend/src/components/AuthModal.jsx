import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ open, onClose, defaultTab = 0 }) => {
  const [tab, setTab] = useState(defaultTab);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 0) {
        // Login
        if (!email || !password) {
          throw new Error('Please fill in all fields');
        }
        await login(email, password);
      } else {
        // Signup
        if (!username || !email || !password) {
          throw new Error('Please fill in all fields');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await signup(username, email, password);
      }
      // Reset form on success
      setUsername('');
      setEmail('');
      setPassword('');
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1.5,
          p: 1,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2, pt: 1 }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 0 }}>
          {tab === 0 ? 'Welcome Back' : 'Create Account'}
        </DialogTitle>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs value={tab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Log In" sx={{ fontWeight: 600 }} />
          <Tab label="Sign Up" sx={{ fontWeight: 600 }} />
        </Tabs>
      </Box>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tab === 1 && (
            <TextField
              label="Username"
              variant="outlined"
              size="small"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g. alex_smith"
            />
          )}

          <TextField
            label="Email Address"
            type="email"
            variant="outlined"
            size="small"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            placeholder="e.g. alex@example.com"
          />

          <TextField
            label="Password"
            type="password"
            variant="outlined"
            size="small"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            placeholder="At least 6 characters"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{
              mt: 1,
              py: 1.2,
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : tab === 0 ? (
              'Log In'
            ) : (
              'Create Account'
            )}
          </Button>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            {tab === 0 ? (
              <>
                Don't have an account?{' '}
                <Box
                  component="span"
                  sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => {
                    setTab(1);
                    setError('');
                  }}
                >
                  Sign Up
                </Box>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Box
                  component="span"
                  sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => {
                    setTab(0);
                    setError('');
                  }}
                >
                  Log In
                </Box>
              </>
            )}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
