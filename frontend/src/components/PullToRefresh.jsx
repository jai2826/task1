import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, CircularProgress } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const PULL_THRESHOLD = 65; // Distance in px needed to trigger refresh
const MAX_PULL = 110; // Max visual pull down distance in px
const RESISTANCE = 0.45; // Dampening factor

const PullToRefresh = ({ onRefresh, children, disabled = false }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);
  const containerRef = useRef(null);

  const isAtTop = () => {
    return window.scrollY <= 2;
  };

  const handleTouchStart = (e) => {
    if (disabled || isRefreshing) return;
    // Don't intercept clicks on inputs, buttons, links, or interactive elements
    if (e.target && (e.target.closest('input') || e.target.closest('textarea') || e.target.closest('button') || e.target.closest('a'))) {
      return;
    }
    if (isAtTop()) {
      startY.current = e.touches ? e.touches[0].clientY : e.clientY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling.current || isRefreshing || disabled) return;

    const currentY = e.touches ? e.touches[0].clientY : e.clientY;
    const diffY = currentY - startY.current;

    if (diffY > 0 && isAtTop()) {
      // Prevent browser default pull-to-refresh or text selection while dragging
      if (e.cancelable) {
        e.preventDefault();
      }
      const dampedDistance = Math.min(MAX_PULL, diffY * RESISTANCE);
      setPullDistance(dampedDistance);
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance >= PULL_THRESHOLD && !isRefreshing && onRefresh) {
      setIsRefreshing(true);
      setPullDistance(50); // Hold at refreshing indicator height

      try {
        await onRefresh();
      } catch (err) {
        console.error('Pull to refresh error:', err);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  // Listen to window mouseup and mousemove for smooth PC mouse dragging
  useEffect(() => {
    const onWindowMouseMove = (e) => {
      if (isPulling.current && !e.touches) {
        handleTouchMove(e);
      }
    };
    const onWindowMouseUp = () => {
      if (isPulling.current) {
        handleTouchEnd();
      }
    };

    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onWindowMouseUp);
    };
  }, [pullDistance, isRefreshing, disabled, onRefresh]);

  // Add passive: false touch listener to container to allow e.preventDefault()
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchMove = (e) => handleTouchMove(e);
    el.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, [isRefreshing, disabled, pullDistance]);

  const progress = Math.min(100, (pullDistance / PULL_THRESHOLD) * 100);
  const willTrigger = pullDistance >= PULL_THRESHOLD;

  return (
    <Box
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      sx={{
        position: 'relative',
        width: '100%',
        touchAction: 'pan-x pan-y',
      }}
    >
      {/* Pull Indicator Badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: `translateX(-50%) translateY(${Math.max(0, pullDistance - 45)}px)`,
          opacity: pullDistance > 10 || isRefreshing ? 1 : 0,
          transition: isPulling.current ? 'none' : 'transform 0.25s ease, opacity 0.2s ease',
          pointerEvents: 'none',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            boxShadow: '0 3px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(0, 0, 0, 0.06)',
          }}
        >
          {isRefreshing ? (
            <CircularProgress size={22} thickness={4} color="primary" />
          ) : (
            <ArrowDownwardIcon
              sx={{
                fontSize: '1.2rem',
                color: willTrigger ? 'primary.main' : '#64748b',
                transform: `rotate(${willTrigger ? 180 : (progress / 100) * 180}deg)`,
                transition: 'transform 0.15s ease, color 0.15s ease',
              }}
            />
          )}
        </Box>
      </Box>

      {/* Content Container shifted by pull distance */}
      <Box
        sx={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling.current ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default PullToRefresh;
