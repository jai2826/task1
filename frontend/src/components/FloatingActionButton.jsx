import React from 'react';
import { Fab, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const FloatingActionButton = ({ onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      const card = document.getElementById('create-post-card');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = card.querySelector('textarea');
        if (input) input.focus();
      }
    }
  };

  return (
    <Tooltip title="Create new post" placement="left">
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: { xs: 24, sm: 32 },
          right: { xs: 24, sm: 32 },
          width: 56,
          height: 56,
          bgcolor: 'primary.main',
          boxShadow: '0 4px 14px rgba(24, 119, 242, 0.4)',
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        }}
      >
        <AddIcon sx={{ fontSize: 28 }} />
      </Fab>
    </Tooltip>
  );
};

export default FloatingActionButton;
