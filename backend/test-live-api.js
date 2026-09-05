/**
 * Automated Live API Test Suite for TaskPlanet Social Feed Backend
 * Tests the live Render deployment: https://task1-ay9p.onrender.com
 */

const BASE_URL = process.env.API_BASE_URL || 'https://task1-ay9p.onrender.com/api';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runLiveTests() {
  console.log('====================================================');
  console.log(`  Live API Test Suite against: ${BASE_URL}`);
  console.log('====================================================\n');

  const startTime = Date.now();

  try {
    // 1. Health Check
    console.log('--- 1. Server Health Check ---');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, `GET /api/health returned HTTP 200 (Status: ${healthData.status})`);
    assert(healthData.status === 'ok', 'Health status is "ok"');
    assert(typeof healthData.uptime === 'number', `Server uptime: ${Math.round(healthData.uptime)}s`);

    // 2. Fetch Feed Posts
    console.log('\n--- 2. Public Posts Feed (GET /api/posts) ---');
    const feedRes = await fetch(`${BASE_URL}/posts?limit=5`);
    const feedData = await feedRes.json();
    assert(feedRes.status === 200, `GET /api/posts returned HTTP 200`);
    assert(Array.isArray(feedData.posts), `Returned posts array (${feedData.posts?.length} posts received)`);
    assert(typeof feedData.pagination?.totalPosts === 'number', `Total posts in database: ${feedData.pagination?.totalPosts}`);

    // 3. Filter: Most Liked
    console.log('\n--- 3. Filter: Most Liked Posts (GET /api/posts?sort=mostLiked) ---');
    const likedRes = await fetch(`${BASE_URL}/posts?sort=mostLiked&limit=3`);
    const likedData = await likedRes.json();
    assert(likedRes.status === 200, 'GET /api/posts?sort=mostLiked returned HTTP 200');
    assert(likedData.posts?.length > 0, `Returned ${likedData.posts?.length} most-liked posts`);
    if (likedData.posts?.length >= 2) {
      assert(
        (likedData.posts[0].likeCount || 0) >= (likedData.posts[1].likeCount || 0),
        `Posts properly sorted by likes (${likedData.posts[0].likeCount} >= ${likedData.posts[1].likeCount})`
      );
    }

    // 4. Filter: Most Commented
    console.log('\n--- 4. Filter: Most Commented Posts (GET /api/posts?sort=mostCommented) ---');
    const commRes = await fetch(`${BASE_URL}/posts?sort=mostCommented&limit=3`);
    const commData = await commRes.json();
    assert(commRes.status === 200, 'GET /api/posts?sort=mostCommented returned HTTP 200');
    assert(commData.posts?.length > 0, `Returned ${commData.posts?.length} most-commented posts`);
    if (commData.posts?.length >= 2) {
      assert(
        (commData.posts[0].commentCount || 0) >= (commData.posts[1].commentCount || 0),
        `Posts properly sorted by comments (${commData.posts[0].commentCount} >= ${commData.posts[1].commentCount})`
      );
    }

    // 5. Search Posts
    console.log('\n--- 5. Search Posts Query (GET /api/posts?search=workflow) ---');
    const searchRes = await fetch(`${BASE_URL}/posts?search=workflow`);
    const searchData = await searchRes.json();
    assert(searchRes.status === 200, 'GET /api/posts?search=workflow returned HTTP 200');
    assert(Array.isArray(searchData.posts), `Search returned ${searchData.posts?.length} matches`);

    // 6. Pagination
    console.log('\n--- 6. Pagination (GET /api/posts?page=2&limit=3) ---');
    const pageRes = await fetch(`${BASE_URL}/posts?page=2&limit=3`);
    const pageData = await pageRes.json();
    assert(pageRes.status === 200, 'GET /api/posts?page=2&limit=3 returned HTTP 200');
    assert(pageData.pagination?.currentPage === 2, 'Current page is 2');

    // 7. Auth Flow: Login with Seed Account (Sophia Chen)
    console.log('\n--- 7. User Authentication Flow (POST /api/auth/login) ---');
    const demoEmail = 'sophia.codes@example.com';
    const demoPassword = 'test1234@';

    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: demoEmail,
        password: demoPassword,
      }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, `Login returned HTTP 200 OK`);
    assert(loginData.token, 'Login returned valid JWT token');
    assert(loginData.user?.email === demoEmail, `Authenticated user: ${loginData.user?.username}`);

    const token = loginData.token;

    // 8. Auth Flow: Get Profile (GET /api/auth/me)
    console.log('\n--- 8. Authenticated Profile (GET /api/auth/me) ---');
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, 'GET /api/auth/me returned HTTP 200');
    assert(meData.user?.email === demoEmail, `Retrieved profile for ${meData.user?.email}`);

    // 9. Create Post (POST /api/posts)
    console.log('\n--- 9. Create Post (POST /api/posts) ---');
    const postRes = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        text: `Automated live API verification post #${Date.now()}`,
      }),
    });
    const postData = await postRes.json();
    assert(postRes.status === 201, 'POST /api/posts returned HTTP 201 Created');
    assert(postData.post?._id, `Post created with ID: ${postData.post?._id}`);

    const newPostId = postData.post?._id;

    // 10. Like the Post (POST /api/posts/:id/like)
    console.log('\n--- 10. Toggle Like (POST /api/posts/:id/like) ---');
    const likeRes = await fetch(`${BASE_URL}/posts/${newPostId}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const likeData = await likeRes.json();
    assert(likeRes.status === 200, 'POST /posts/:id/like returned HTTP 200');
    assert(likeData.liked === true, 'Post successfully liked (liked: true)');
    assert(likeData.likeCount === 1, `Like count updated to 1`);

    // 11. Add a Comment (POST /api/posts/:id/comment)
    console.log('\n--- 11. Add Comment (POST /api/posts/:id/comment) ---');
    const commentRes = await fetch(`${BASE_URL}/posts/${newPostId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        text: 'Automated test comment verifying live API response!',
      }),
    });
    const commentData = await commentRes.json();
    assert(commentRes.status === 201, 'POST /posts/:id/comment returned HTTP 201 Created');
    assert(commentData.commentCount === 1, 'Comment count updated to 1');
    assert(commentData.comment?.text.includes('Automated test comment'), 'Comment text verified');

    // 12. Cleanup Test Post (DELETE /api/posts/:id)
    console.log('\n--- 12. Cleanup Test Post (DELETE /api/posts/:id) ---');
    const delRes = await fetch(`${BASE_URL}/posts/${newPostId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const delData = await delRes.json();
    assert(delRes.status === 200, 'DELETE /posts/:id returned HTTP 200 (Cleaned up test post)');
    assert(delData.success === true, 'Post successfully deleted');

  } catch (err) {
    console.error('Test execution failed with error:', err);
    failed++;
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n====================================================');
  console.log(`  Tests Completed in ${duration}s`);
  console.log(`  Passed: ${passed} | Failed: ${failed}`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runLiveTests();
