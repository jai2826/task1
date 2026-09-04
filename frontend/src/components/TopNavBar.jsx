import React, { useState } from 'react';
import {
  Box,
  Typography,
  InputBase,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../context/AuthContext';

const TopNavBar = ({ searchQuery, onSearchChange, onSearchSubmit, onOpenAuth }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (e) => {
    if (isAuthenticated) {
      setAnchorEl(e.currentTarget);
    } else {
      onOpenAuth();
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <Box
      sx={{
        pt: 2,
        pb: 1.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      {/* Title and Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.75rem', sm: '2rem' },
            color: '#111827',
            letterSpacing: '-0.03em',
          }}
        >
          Social
        </Typography>

        {/* User Account / Profile Avatar */}
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
              <Avatar
                sx={{
                  bgcolor: '#f59e0b',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%)',
                  width: 38,
                  height: 38,
                  fontWeight: 600,
                  fontSize: '0.95rem',
                }}
              >
                {user?.username ? user.username.charAt(0).toUpperCase() : <PersonIcon />}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: { borderRadius: 2, mt: 1, minWidth: 160 },
              }}
            >
              <MenuItem disabled sx={{ opacity: '1 !important' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    @{user?.username}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {user?.email}
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon sx={{ color: 'error.main' }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Log Out" />
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={onOpenAuth}
            sx={{ fontWeight: 600, borderRadius: 20 }}
          >
            Log In
          </Button>
        )}
      </Box>

      {/* Search Bar matching reference UI */}
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          onSearchSubmit();
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderRadius: 24,
          px: 2,
          py: 0.5,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        }}
      >
        <InputBase
          placeholder="Search promotions, users, posts..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          fullWidth
          sx={{
            fontSize: '0.95rem',
            color: '#374151',
            '& input::placeholder': {
              color: '#9ca3af',
              opacity: 1,
            },
          }}
        />
        <IconButton
          type="submit"
          sx={{
            bgcolor: 'primary.main',
            color: '#ffffff',
            width: 34,
            height: 34,
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
          size="small"
        >
          <SearchIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default TopNavBar;
