import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Post from './src/models/Post.js';
import { uploadImageBuffer, isConfigured } from './src/config/blobStorage.js';

dotenv.config();

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('   Mini Social Post Application - Test Suite');
  console.log('====================================================\n');

  // 1. Schema & Collection Constraints
  console.log('--- 1. Database Collections & Model Constraints ---');
  assert(User.collection.collectionName === 'users', 'User collection name is strictly "users"');
  assert(Post.collection.collectionName === 'posts', 'Post collection name is strictly "posts"');

  const models = Object.keys(mongoose.models);
  assert(
    models.length === 2 && models.includes('User') && models.includes('Post'),
    'Exactly two Mongoose models registered (users and posts)'
  );

  // 2. User Model Validation
  console.log('\n--- 2. User Model Validation ---');
  try {
    const invalidUser = new User({ username: 'ab', email: 'bad-email', password: '123' });
    const err = invalidUser.validateSync();
    assert(err.errors.username, 'Rejects username shorter than 3 characters');
    assert(err.errors.email, 'Rejects invalid email format');
    assert(err.errors.password, 'Rejects password shorter than 6 characters');
  } catch (e) {
    console.error(e);
  }

  try {
    const validUser = new User({
      username: 'johndoe',
      email: 'john@example.com',
      password: 'securepassword123',
    });
    const err = validUser.validateSync();
    assert(!err, 'Accepts valid user credentials');
  } catch (e) {
    console.error(e);
  }

  // 3. Post Model Validation & Constraints
  console.log('\n--- 3. Post Model Validation (Text-only, Image-only, Both) ---');
  const dummyAuthor = {
    userId: new mongoose.Types.ObjectId(),
    username: 'testuser',
  };

  // 3a. Reject empty post (both text and image empty)
  const emptyPost = new Post({
    author: dummyAuthor,
    text: '',
    imageUrl: '',
  });
  const emptyErr = emptyPost.validateSync();
  assert(
    emptyErr && emptyErr.errors.text,
    'Rejects empty post (neither text nor image provided)'
  );

  // 3b. Accept text-only post
  const textOnlyPost = new Post({
    author: dummyAuthor,
    text: 'This is a text-only post for testing!',
    imageUrl: '',
  });
  const textOnlyErr = textOnlyPost.validateSync();
  assert(!textOnlyErr, 'Accepts text-only post');

  // 3c. Accept image-only post
  const imageOnlyPost = new Post({
    author: dummyAuthor,
    text: '',
    imageUrl: 'https://public.blob.vercel-storage.com/social_posts/sample.jpg',
  });
  const imageOnlyErr = imageOnlyPost.validateSync();
  assert(!imageOnlyErr, 'Accepts image-only post');

  // 3d. Accept post with both text and image
  const bothPost = new Post({
    author: dummyAuthor,
    text: 'A post with both text and photo!',
    imageUrl: 'https://public.blob.vercel-storage.com/social_posts/sample.jpg',
  });
  const bothErr = bothPost.validateSync();
  assert(!bothErr, 'Accepts post with both text and image');

  // 4. Embedded Likes & Comments Constraints
  console.log('\n--- 4. Embedded Likes & Comments Constraints ---');
  const interactivePost = new Post({
    author: dummyAuthor,
    text: 'Testing likes and comments embedded structure',
  });

  const likerId = new mongoose.Types.ObjectId();
  interactivePost.likes.push({
    userId: likerId,
    username: 'liker_one',
  });

  assert(interactivePost.likes.length === 1, 'Likes are embedded directly in post');
  assert(
    interactivePost.likes[0].username === 'liker_one',
    'Likes store username of acting user, not just counter'
  );

  interactivePost.comments.push({
    userId: likerId,
    username: 'liker_one',
    text: 'Great first post!',
    createdAt: new Date(),
  });

  assert(interactivePost.comments.length === 1, 'Comments are embedded directly in post');
  assert(
    interactivePost.comments[0].text === 'Great first post!' &&
      interactivePost.comments[0].username === 'liker_one',
    'Comments store username, text, and timestamp'
  );

  // 5. Vercel Blob Upload & Fallback Service
  console.log('\n--- 5. Image Upload & Vercel Blob Storage Service ---');
  try {
    const fakeBuffer = Buffer.from('mock image binary content');
    const uploadedUrl = await uploadImageBuffer(fakeBuffer, 'image/png');
    assert(
      typeof uploadedUrl === 'string' && uploadedUrl.length > 0,
      'Image upload service returns valid URL (Vercel Blob or local data URI fallback)'
    );
  } catch (err) {
    console.error('Image upload test failed:', err);
    failedTests++;
  }

  // 6. JWT Authentication Helper
  console.log('\n--- 6. JWT Authentication Signing & Verification ---');
  const secret = process.env.JWT_SECRET || 'fallback_jwt_secret_dev_only';
  const token = jwt.sign(
    { id: '12345', username: 'alex', email: 'alex@example.com' },
    secret,
    { expiresIn: '1h' }
  );
  assert(typeof token === 'string' && token.split('.').length === 3, 'Generates valid JWT token');

  const decoded = jwt.verify(token, secret);
  assert(
    decoded.id === '12345' && decoded.username === 'alex',
    'Successfully verifies and decodes JWT payload'
  );

  // Summary
  console.log('\n====================================================');
  console.log(`Test Results: ${passedTests} passed, ${failedTests} failed`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
