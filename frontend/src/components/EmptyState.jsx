import React from 'react';
import { Box, Typography } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

const EmptyState = ({ message = 'Nothing here yet, check back soon!' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
        textAlign: 'center',
      }}
    >
      {/* Box illustration icon */}
      <Box
        sx={{
          width: 90,
          height: 90,
          borderRadius: '50%',
          bgcolor: 'rgba(24, 119, 242, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2.5,
          position: 'relative',
        }}
      >
        <Inventory2OutlinedIcon
          sx={{
            fontSize: 48,
            color: '#60a5fa',
          }}
        />
        {/* Floating dot decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: 14,
            right: 20,
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: '#93c5fd',
          }}
        />
      </Box>

      <Typography
        variant="body1"
        sx={{
          color: '#6b7280',
          fontWeight: 500,
          fontSize: '1.05rem',
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default EmptyState;
