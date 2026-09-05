import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  CircularProgress,
  Button,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import TopNavBar from './components/TopNavBar';
import CreatePostCard from './components/CreatePostCard';
import FilterTabs from './components/FilterTabs';
import PostCard from './components/PostCard';
import EmptyState from './components/EmptyState';
import AuthModal from './components/AuthModal';
import PullToRefresh from './components/PullToRefresh';
import { useAuth } from './context/AuthContext';
import api from './api/client';

function App() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sort, setSort] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
    totalPosts: 0,
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch posts from API
  const fetchPosts = useCallback(
    async (page = 1, append = false, currentSort = sort, search = activeSearch, silent = false) => {
      if (page === 1) {
        if (!silent) setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const params = {
          page,
          limit: 10,
          sort: currentSort,
        };
        if (search) {
          params.search = search;
        }

        const res = await api.get('/posts', { params });
        if (res.data.success) {
          if (append) {
            setPosts((prev) => [...prev, ...res.data.posts]);
          } else {
            setPosts(res.data.posts);
          }
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [sort, activeSearch]
  );

  // Initial load & when user changes
  useEffect(() => {
    // If user logged out while on 'myPosts', reset to 'newest'
    if (!user && sort === 'myPosts') {
      setSort('newest');
      fetchPosts(1, false, 'newest', activeSearch);
    } else {
      fetchPosts(1, false, sort, activeSearch);
    }
  }, [user]);

  const handleSortChange = (newSort) => {
    // If guest clicks My Posts, open login modal
    if (newSort === 'myPosts' && !user) {
      setAuthModalOpen(true);
      return;
    }
    setSort(newSort);
    fetchPosts(1, false, newSort, activeSearch);
  };

  const handleSearchSubmit = () => {
    setActiveSearch(searchQuery.trim());
    fetchPosts(1, false, sort, searchQuery.trim());
  };

  const handlePostCreated = (newPost) => {
    // Switch to newest if on mostLiked/mostCommented
    if (sort !== 'newest' && sort !== 'myPosts') {
      setSort('newest');
      fetchPosts(1, false, 'newest', activeSearch);
    }
    // Prepend new post to the top of the feed
    setPosts((prev) => [newPost, ...prev.filter((p) => p._id !== newPost._id)]);
    setToastMessage('Post published successfully!');
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
    setToastMessage('Post updated successfully!');
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
    setToastMessage('Post deleted successfully!');
  };

  const handleProfileUpdated = (updatedUser) => {
    setToastMessage(`Profile updated! Hello @${updatedUser.username}`);
    fetchPosts(1, false, sort, activeSearch);
  };

  const handlePullRefresh = async () => {
    // Preserves current sort and activeSearch strictly
    await fetchPosts(1, false, sort, activeSearch, true);
  };

  const handleLoadMore = () => {
    if (pagination.hasMore && !loadingMore) {
      fetchPosts(pagination.currentPage + 1, true);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f4f6f8',
        pb: 8,
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          px: { xs: 2, sm: 3 },
        }}
      >
        {/* Top App Header & Search Bar */}
        <TopNavBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          onOpenAuth={() => setAuthModalOpen(true)}
          onProfileUpdated={handleProfileUpdated}
        />

        <PullToRefresh onRefresh={handlePullRefresh}>
          {/* Create Post Composer */}
          <Box sx={{ mt: 1, mb: 2 }}>
            <CreatePostCard
              onPostCreated={handlePostCreated}
              onOpenAuth={() => setAuthModalOpen(true)}
            />
          </Box>

          {/* Filter Pills (All Posts, Most Liked, Most Commented) */}
          <Box sx={{ mb: 2 }}>
            <FilterTabs currentSort={sort} onSortChange={handleSortChange} />
          </Box>

          {/* Search status clear indicator if filtering */}
          {activeSearch && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                px: 1,
              }}
            >
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Showing results for "<strong>{activeSearch}</strong>"
              </Typography>
              <Button
                size="small"
                onClick={() => {
                  setSearchQuery('');
                  setActiveSearch('');
                  fetchPosts(1, false, sort, '');
                }}
                sx={{ fontSize: '0.8rem' }}
              >
                Clear
              </Button>
            </Box>
          )}

          {/* Feed Posts List */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={36} color="primary" />
            </Box>
          ) : posts.length === 0 ? (
            <EmptyState
              message={
                sort === 'myPosts'
                  ? "You haven't shared any posts yet. Create your first post above!"
                  : activeSearch
                  ? `No posts found matching "${activeSearch}"`
                  : 'Nothing here yet, check back soon!'
              }
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onOpenAuth={() => setAuthModalOpen(true)}
                  onPostUpdated={handlePostUpdated}
                  onPostDeleted={handlePostDeleted}
                />
              ))}

              {/* Pagination / Load More */}
              {pagination.hasMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2, pb: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    sx={{
                      borderRadius: 20,
                      px: 4,
                      py: 0.8,
                      fontWeight: 600,
                    }}
                  >
                    {loadingMore ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      'Load More Posts'
                    )}
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </PullToRefresh>

        {/* Authentication Modal */}
        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />

        {/* Toast Notification */}
        <Snackbar
          open={Boolean(toastMessage)}
          autoHideDuration={4000}
          onClose={() => setToastMessage('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setToastMessage('')}
            severity="success"
            sx={{ width: '100%', borderRadius: 2 }}
          >
            {toastMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default App;
