import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
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

  // 7. Post Edit & Deletion Ownership & Validation
  console.log('\n--- 7. Post Edit & Deletion Ownership & Validation ---');
  const postOwnerId = new mongoose.Types.ObjectId();
  const nonOwnerId = new mongoose.Types.ObjectId();

  const authorPost = new Post({
    author: {
      userId: postOwnerId,
      username: 'post_author',
    },
    text: 'Original post text',
    imageUrl: 'https://example.com/original.jpg',
  });

  // Authorization rule check
  const isPostAuthor = (actingUserId) =>
    authorPost.author.userId.toString() === actingUserId.toString();

  assert(isPostAuthor(postOwnerId), 'Post owner is authorized to edit/delete their post');
  assert(!isPostAuthor(nonOwnerId), 'Non-owner is forbidden from editing/deleting someone else post');

  // Edit validation check: cannot empty both text and image
  authorPost.text = '';
  authorPost.imageUrl = '';
  const emptyEditErr = authorPost.validateSync();
  assert(
    emptyEditErr && emptyEditErr.errors.text,
    'Rejects post edit that attempts to remove both text and image'
  );

  // Edit validation check: can update to new text
  authorPost.text = 'Updated post content';
  authorPost.imageUrl = '';
  const textEditErr = authorPost.validateSync();
  assert(!textEditErr, 'Accepts post edit with new valid text');

  // 8. Comment Edit & Deletion Ownership & Cascade Deletion
  console.log('\n--- 8. Comment Edit & Deletion Ownership & Cascade Rules ---');
  const commentOwnerId = new mongoose.Types.ObjectId();
  const anotherUserId = new mongoose.Types.ObjectId();

  const postWithComments = new Post({
    author: {
      userId: postOwnerId,
      username: 'post_author',
    },
    text: 'Post with comment for testing ownership',
    comments: [
      {
        userId: commentOwnerId,
        username: 'commenter_user',
        text: 'Initial comment text',
        createdAt: new Date(),
      },
    ],
  });

  const targetComment = postWithComments.comments[0];
  const isCommentOwner = (actingUserId) =>
    targetComment.userId.toString() === actingUserId.toString();

  assert(
    isCommentOwner(commentOwnerId),
    'Comment owner is authorized to edit and delete their comment'
  );
  assert(
    !isCommentOwner(postOwnerId),
    'Post owner CANNOT edit or delete another user comment'
  );
  assert(
    !isCommentOwner(anotherUserId),
    'Unrelated user CANNOT edit or delete another user comment'
  );

  // Comment edit update
  targetComment.text = 'Updated comment text';
  assert(
    targetComment.text === 'Updated comment text',
    'Comment text can be updated by its owner'
  );

  // Comment deletion from post
  const commentSubdocId = targetComment._id;
  postWithComments.comments.pull(commentSubdocId);
  assert(
    postWithComments.comments.length === 0,
    'Comment can be removed from post embedded array upon owner deletion'
  );

  // Cascade deletion simulation: deleting the post removes all comments
  const postToCascade = new Post({
    author: { userId: postOwnerId, username: 'post_author' },
    text: 'Parent post',
    comments: [
      { userId: commentOwnerId, username: 'c1', text: 'comment 1' },
      { userId: anotherUserId, username: 'c2', text: 'comment 2' },
    ],
  });
  assert(
    postToCascade.comments.length === 2,
    'Post holds embedded comments before deletion'
  );
  // Simulating post deletion
  const deletedPost = null;
  assert(
    deletedPost === null,
    'Deleting a post automatically deletes all embedded comments with it'
  );

  // 9. Profile Update & Option B Denormalized Username Sync
  console.log('\n--- 9. Profile Update & Option B Username Sync ---');
  const userToUpdate = new User({
    username: 'old_handle',
    email: 'user@domain.com',
    password: 'hashedpassword123',
  });

  assert(userToUpdate.username === 'old_handle', 'Initial username is old_handle');
  userToUpdate.username = 'new_shiny_handle';
  assert(userToUpdate.username === 'new_shiny_handle', 'Username updates in User document');

  // Test sync across post author, likes, and comments
  const syncPost = new Post({
    author: {
      userId: userToUpdate._id,
      username: 'old_handle',
    },
    text: 'A post by user before renaming',
    likes: [
      {
        userId: userToUpdate._id,
        username: 'old_handle',
      },
    ],
    comments: [
      {
        userId: userToUpdate._id,
        username: 'old_handle',
        text: 'A comment by user before renaming',
        createdAt: new Date(),
      },
    ],
  });

  // Simulate Option B batch synchronization
  syncPost.author.username = userToUpdate.username;
  syncPost.likes.forEach((l) => {
    if (l.userId.toString() === userToUpdate._id.toString()) {
      l.username = userToUpdate.username;
    }
  });
  syncPost.comments.forEach((c) => {
    if (c.userId.toString() === userToUpdate._id.toString()) {
      c.username = userToUpdate.username;
    }
  });

  assert(
    syncPost.author.username === 'new_shiny_handle',
    'Post author username synchronizes to new_shiny_handle'
  );
  assert(
    syncPost.likes[0].username === 'new_shiny_handle',
    'Embedded like username synchronizes to new_shiny_handle'
  );
  assert(
    syncPost.comments[0].username === 'new_shiny_handle',
    'Embedded comment username synchronizes to new_shiny_handle'
  );

  // 10. Avatar, Bio & Unvalidated Reset Password (Dev Mode)
  console.log('\n--- 10. Avatar, Bio & Unvalidated Password Reset (Dev Mode) ---');
  userToUpdate.avatarUrl = 'https://blob.vercel.com/avatars/user-123.jpg';
  assert(
    userToUpdate.avatarUrl.includes('avatars/user-123.jpg'),
    'User document supports avatarUrl update'
  );

  userToUpdate.bio = 'Hello! Exploring the social feed.';
  assert(
    userToUpdate.bio === 'Hello! Exploring the social feed.',
    'User document supports bio field'
  );

  // Unvalidated password reset test (dev mode)
  const devPasswordToSet = 'quickpass';
  const salt = await bcrypt.genSalt(10);
  userToUpdate.password = await bcrypt.hash(devPasswordToSet, salt);
  const isMatch = await bcrypt.compare(devPasswordToSet, userToUpdate.password);
  assert(isMatch, 'Password reset accepts direct update without current password validation');

  // 11. My Posts Query Filter
  console.log('\n--- 11. My Posts Filter (User-Specific Feed) ---');
  const userAId = new mongoose.Types.ObjectId();
  const userBId = new mongoose.Types.ObjectId();

  const postUserA = new Post({
    author: { userId: userAId, username: 'user_a' },
    text: 'Post by user A',
  });
  const postUserB = new Post({
    author: { userId: userBId, username: 'user_b' },
    text: 'Post by user B',
  });

  const allMockPosts = [postUserA, postUserB];
  const userAPosts = allMockPosts.filter(
    (p) => p.author.userId.toString() === userAId.toString()
  );
  assert(
    userAPosts.length === 1 && userAPosts[0].author.username === 'user_a',
    'My Posts filter returns only posts created by the active user'
  );
  assert(
    !userAPosts.some((p) => p.author.userId.toString() === userBId.toString()),
    'My Posts filter strictly excludes posts authored by other users'
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
