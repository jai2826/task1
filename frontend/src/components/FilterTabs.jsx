import React from 'react';
import { Box, Button } from '@mui/material';

const FilterTabs = ({ currentSort, onSortChange }) => {
  const tabs = [
    { label: 'All Posts', value: 'newest' },
    { label: 'Most Liked', value: 'mostLiked' },
    { label: 'Most Commented', value: 'mostCommented' },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.2,
        overflowX: 'auto',
        py: 1,
        '&::-webkit-scrollbar': { display: 'none' }, // hide scrollbar for clean app look
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}
    >
      {tabs.map((tab) => {
        const isActive = currentSort === tab.value;
        return (
          <Button
            key={tab.value}
            onClick={() => onSortChange(tab.value)}
            sx={{
              borderRadius: 20,
              px: 2.2,
              py: 0.6,
              fontSize: '0.875rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              backgroundColor: isActive ? 'primary.main' : '#ffffff',
              color: isActive ? '#ffffff' : '#4b5563',
              border: isActive ? '1px solid transparent' : '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: isActive ? '0 2px 6px rgba(24, 119, 242, 0.25)' : 'none',
              '&:hover': {
                backgroundColor: isActive ? 'primary.dark' : '#f9fafb',
              },
            }}
          >
            {tab.label}
          </Button>
        );
      })}
    </Box>
  );
};

export default FilterTabs;
