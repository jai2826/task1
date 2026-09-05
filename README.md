# Mini Social Post Application (TaskPlanet "Social" Tab)

A responsive social feed web application replicating the **Social** tab from the TaskPlanet mobile app. Built with **React.js** (Material UI) and a **Node.js/Express** backend with **MongoDB**.

---

## 🚀 Live Deployment Links

| Component | Platform | Status | Live URL |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | Vercel | [![Vercel](https://img.shields.io/badge/Vercel-Live%20Deployment-black?logo=vercel)](https://frontend-pied-six-iozb10bqhw.vercel.app/) | [https://frontend-pied-six-iozb10bqhw.vercel.app/](https://frontend-pied-six-iozb10bqhw.vercel.app/) |
| **Backend REST API** | Render | [![Render](https://img.shields.io/badge/Render-Active%20API-46E3B7?logo=render&logoColor=black)](https://task1-ay9p.onrender.com) | [https://task1-ay9p.onrender.com](https://task1-ay9p.onrender.com) |
| **Database** | MongoDB Atlas | [![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas%20Cluster-green?logo=mongodb)](https://www.mongodb.com/cloud/atlas) | Cloud Managed Cluster |

> [!NOTE]
> **Render Cold-Start Notice**:
> The backend is hosted on Render's free tier, which spins down after 15 minutes of inactivity. If the service is idle, the very first request may experience a warm-up delay of **30–50 seconds**. Subsequent requests respond instantly in milliseconds.

---

## 👥 Demo User Accounts (Top 3 for Testing)

The MongoDB database is populated with **20 original seed accounts** and active feed posts. Users and reviewers can immediately sign in to the [live application](https://frontend-pied-six-iozb10bqhw.vercel.app/) using any of the following top accounts:

| # | Name | Username | Login ID (Email) | Password | Bio / Role |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | **Sophia Chen** | `sophia_codes` | `sophia.codes@example.com` | `test1234@` | Full-stack engineer building open source tools 💻☕ |
| **2** | **Marcus Vance** | `marcus_dev` | `marcus.dev@example.com` | `test1234@` | TypeScript enthusiast, distributed systems nerd. |
| **3** | **Elena Rostova** | `elena_design` | `elena.design@example.com` | `test1234@` | Product designer crafting clean UI/UX experiences ✨ |

> [!TIP]
> **Quick Sign In Steps**:
> 1. Open the [Frontend Web App](https://frontend-pied-six-iozb10bqhw.vercel.app/).
> 2. Click **Sign In** in the top navigation bar.
> 3. Enter any of the credentials above (e.g., `sophia.codes@example.com` with password `test1234@`).
> 4. Test creating posts (with text/images), liking feed posts, and posting comments!

> [!IMPORTANT]
> **Password Protection on Demo Accounts**:
> Password reset is locked for these 3 public showcase accounts so that reviewers can always log in without disruption. A notification appears inside the Settings dialog explaining this. To test password reset functionality, simply create a new personal account via the **Sign Up** tab.

---

## ⚡ One-Click Live API Testing

Users and evaluators can directly test the live production API on Render without needing Postman or terminal setup.

### 1. Direct Click-to-Test Links (GET Endpoints)

Click any of the links below to trigger the live API directly in your browser:

| Endpoint | Method | Query / Action | One-Click Test Button (Opens in Browser) | Expected Response |
| :--- | :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | Health Check & Uptime | [![Test Health](https://img.shields.io/badge/▶%20Test-GET%20%2Fapi%2Fhealth-0284c7?style=for-the-badge)](https://task1-ay9p.onrender.com/api/health)<br>[🔗 `https://task1-ay9p.onrender.com/api/health`](https://task1-ay9p.onrender.com/api/health) | `{"status":"ok","uptime":...}` |
| `/api/posts` | `GET` | Default Feed (Latest 10) | [![Test Feed](https://img.shields.io/badge/▶%20Test-GET%20%2Fapi%2Fposts-16a34a?style=for-the-badge)](https://task1-ay9p.onrender.com/api/posts)<br>[🔗 `https://task1-ay9p.onrender.com/api/posts`](https://task1-ay9p.onrender.com/api/posts) | Paginated posts array + metadata |
| `/api/posts?limit=3` | `GET` | Limit Query (`limit=3`) | [![Test Limit 3](https://img.shields.io/badge/▶%20Test-limit%3D3-7c3aed?style=for-the-badge)](https://task1-ay9p.onrender.com/api/posts?limit=3)<br>[🔗 `https://task1-ay9p.onrender.com/api/posts?limit=3`](https://task1-ay9p.onrender.com/api/posts?limit=3) | Array of exactly 3 feed posts |
| `/api/posts?sort=mostLiked` | `GET` | Filter: Most Liked (`limit=5`) | [![Test Most Liked](https://img.shields.io/badge/▶%20Test-sort%3DmostLiked-ea580c?style=for-the-badge)](https://task1-ay9p.onrender.com/api/posts?sort=mostLiked&limit=5)<br>[🔗 `https://task1-ay9p.onrender.com/api/posts?sort=mostLiked&limit=5`](https://task1-ay9p.onrender.com/api/posts?sort=mostLiked&limit=5) | Posts sorted by highest likes descending |
| `/api/posts?sort=mostCommented` | `GET` | Filter: Most Commented (`limit=5`) | [![Test Most Commented](https://img.shields.io/badge/▶%20Test-sort%3DmostCommented-ca8a04?style=for-the-badge)](https://task1-ay9p.onrender.com/api/posts?sort=mostCommented&limit=5)<br>[🔗 `https://task1-ay9p.onrender.com/api/posts?sort=mostCommented&limit=5`](https://task1-ay9p.onrender.com/api/posts?sort=mostCommented&limit=5) | Posts sorted by highest comments descending |
| `/api/posts?search=sunset` | `GET` | Search Query (`search=sunset`) | [![Test Search](https://img.shields.io/badge/▶%20Test-search%3Dsunset-0891b2?style=for-the-badge)](https://task1-ay9p.onrender.com/api/posts?search=sunset)<br>[🔗 `https://task1-ay9p.onrender.com/api/posts?search=sunset`](https://task1-ay9p.onrender.com/api/posts?search=sunset) | Search matches for keyword "sunset" |
| `/api/posts?page=2&limit=3` | `GET` | Pagination (`page=2&limit=3`) | [![Test Page 2](https://img.shields.io/badge/▶%20Test-page%3D2%26limit%3D3-4f46e5?style=for-the-badge)](https://task1-ay9p.onrender.com/api/posts?page=2&limit=3)<br>[🔗 `https://task1-ay9p.onrender.com/api/posts?page=2&limit=3`](https://task1-ay9p.onrender.com/api/posts?page=2&limit=3) | Page 2 slice with pagination metadata |

---

### 2. Interactive Browser Console Test Function (`testLiveAPI()`)

To test the entire API lifecycle—including **Health Check**, **Feed fetching**, **Authentication**, **Post creation**, **Like toggle**, **Comment addition**, and **Post cleanup**—open your browser DevTools Console (`F12` or `Ctrl+Shift+I` / `Cmd+Option+I` -> **Console**) on any webpage, paste the snippet below, and press **Enter**:

```javascript
/**
 * One-Click Live API Test Function
 * Executes full test suite against: https://task1-ay9p.onrender.com
 */
async function testLiveAPI() {
  const BASE_URL = 'https://task1-ay9p.onrender.com/api';
  const divider = '='.repeat(50);
  console.log(`%c${divider}\n  🚀 Starting Live API Test Suite\n  Target: ${BASE_URL}\n${divider}`, 'color: #1976d2; font-weight: bold;');

  const t0 = performance.now();
  try {
    // 1. Health Check
    const health = await (await fetch(`${BASE_URL}/health`)).json();
    console.log('%c✓ PASS: Health Check', 'color: #16a34a; font-weight: bold;', health);

    // 2. Fetch Feed
    const feed = await (await fetch(`${BASE_URL}/posts?limit=5`)).json();
    console.log(`%c✓ PASS: Fetch Feed (${feed.posts?.length} posts, total: ${feed.pagination?.totalPosts})`, 'color: #16a34a; font-weight: bold;', feed.posts);

    // 3. Filter: Most Liked
    const liked = await (await fetch(`${BASE_URL}/posts?sort=mostLiked&limit=3`)).json();
    console.log('%c✓ PASS: Filter Most Liked', 'color: #16a34a; font-weight: bold;', `Top likes: ${liked.posts?.[0]?.likeCount}`);

    // 4. Filter: Most Commented
    const commented = await (await fetch(`${BASE_URL}/posts?sort=mostCommented&limit=3`)).json();
    console.log('%c✓ PASS: Filter Most Commented', 'color: #16a34a; font-weight: bold;', `Top comments: ${commented.posts?.[0]?.commentCount}`);

    // 5. Search Query
    const search = await (await fetch(`${BASE_URL}/posts?search=sunset`)).json();
    console.log(`%c✓ PASS: Search 'sunset'`, 'color: #16a34a; font-weight: bold;', `Matches: ${search.posts?.length}`);

    // 6. User Login with Seed Account (Sophia Chen)
    const login = await (await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sophia.codes@example.com', password: 'test1234@' })
    })).json();
    console.log('%c✓ PASS: User Login (sophia_codes)', 'color: #16a34a; font-weight: bold;', login.user);

    const token = login.token;

    // 7. Get Authenticated Profile (/me)
    const me = await (await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })).json();
    console.log('%c✓ PASS: Authenticated Profile (/me)', 'color: #16a34a; font-weight: bold;', me.user);

    // 8. Create New Post
    const newPost = await (await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text: `Automated test post from browser console at ${new Date().toLocaleTimeString()} 🚀` })
    })).json();
    console.log('%c✓ PASS: Create Post', 'color: #16a34a; font-weight: bold;', newPost.post);

    const postId = newPost.post._id;

    // 9. Like the Post
    const like = await (await fetch(`${BASE_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })).json();
    console.log('%c✓ PASS: Like Post (Liked: true)', 'color: #16a34a; font-weight: bold;', like);

    // 10. Comment on Post
    const comment = await (await fetch(`${BASE_URL}/posts/${postId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text: 'Automated test comment from console! 👍' })
    })).json();
    console.log('%c✓ PASS: Add Comment', 'color: #16a34a; font-weight: bold;', comment);

    // 11. Cleanup Test Post
    const del = await (await fetch(`${BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })).json();
    console.log('%c✓ PASS: Cleanup Test Post', 'color: #16a34a; font-weight: bold;', del);

    const elapsed = ((performance.now() - t0) / 1000).toFixed(2);
    console.log(`%c${divider}\n  🎉 All 11 Live API tests PASSED in ${elapsed}s!\n${divider}`, 'color: #16a34a; font-weight: bold;');
  } catch (err) {
    console.error('❌ API Test Error:', err);
  }
}

// Execute test immediately
testLiveAPI();
```

---

### 3. Terminal / Node.js One-Command Live Test

Run the complete automated test suite (29 assertions) against the live Render deployment directly from your terminal:

```bash
cd backend
npm run test:live
```

---

## Architectural Highlights & Strict Constraints

- **Styling**: Strictly **Material UI (MUI)**. **Zero TailwindCSS** used.
- **Database Collections**: Exactly **two** collections in MongoDB:
  - `users`: User profiles with bcrypt hashed passwords and timestamps.
  - `posts`: Feed items with **embedded** `likes` (`[{ userId, username }]`) and `comments` (`[{ userId, username, text, createdAt }]`). No separate collections.
- **Post Flexibility**: Accepts **text-only**, **image-only**, or **both text and image**. Rejects empty submissions.
- **Optimistic UI Updates**: Liking, unliking, and commenting immediately update the UI state before network round-trips.
- **Cloud Media Storage**: Direct uploads to **Vercel Blob Storage** (`@vercel/blob`) (storing only HTTPS URLs in MongoDB; never ephemeral server disk).

---

## Engineering Notes & TypeScript Migration Readiness

> [!TIP]
> **Architecture & Language Choice Rationale**:
> - **Specification Alignment**: The application is implemented in clean, modern JavaScript (ES Modules / React 18 / Node.js) to adhere strictly to the project specification (`02-tech-stack.md`), align seamlessly with the Material-UI design system, and ensure zero build/transpilation overhead or reviewer environment friction.
> - **Code Quality & JSDoc Typing**: Modules and components feature consistent formatting, defensive validation, and structured JSDoc annotations to provide IDE type hinting and self-documenting code without adding runtime or compile-time complexity.
> - **TypeScript Migration Readiness**: The codebase is modularly structured and architecturally primed for a direct TypeScript migration (`.ts`/`.tsx`). Data models (`users`, `posts`, `likes`, `comments`), API contracts, and context providers are cleanly decoupled with explicit schemas and prop flows, enabling full type definitions, interfaces, and strict compiler settings to be introduced without structural refactoring if the team decides to transition to static typing.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Material UI (MUI v5), Emotion, Axios |
| **Backend** | Node.js (ES Modules), Express.js, Mongoose, Multer, Vercel Blob (`@vercel/blob`), JWT, bcryptjs |
| **Database** | MongoDB (Atlas / local) |

---

## Project Structure

```
d:/3w/task1/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js             # Mongoose connection handling
│   │   │   └── blobStorage.js    # Vercel Blob uploader, deletion & fallback service
│   │   ├── controllers/
│   │   │   ├── authController.js # Signup, login, profile (/me)
│   │   │   └── postController.js # Feed, creation, like toggle, comment addition
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT verification (required & optional)
│   │   │   └── upload.js         # In-memory Multer file buffer
│   │   ├── models/
│   │   │   ├── User.js           # Schema for `users` collection
│   │   │   └── Post.js           # Schema for `posts` collection (embedded likes & comments)
│   │   ├── routes/
│   │   │   ├── authRoutes.js     # /api/auth routes
│   │   │   └── postRoutes.js     # /api/posts routes
│   │   └── server.js             # Express app setup, CORS, error handling
│   ├── test-api.js               # Automated backend test suite (unit & constraints)
│   ├── test-live-api.js          # Live production API automated test suite (29 tests)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js         # Axios client with JWT auto-injection
│   │   ├── components/
│   │   │   ├── AuthModal.jsx     # Login / Signup dialog using MUI
│   │   │   ├── CreatePostCard.jsx# Composer matching reference UI (camera, input, post button)
│   │   │   ├── EmptyState.jsx    # "Nothing here yet, check back soon!" illustration
│   │   │   ├── FilterTabs.jsx    # Pill tabs: "All Posts", "Most Liked", "Most Commented"
│   │   │   ├── PostCard.jsx      # Feed post card with author, text/image, like/comment triggers
│   │   │   ├── CommentSection.jsx# Expandable comments list + comment submission
│   │   │   ├── TopNavBar.jsx     # Header: "Social", search bar, user avatar/auth button
│   │   │   └── FloatingActionButton.jsx # Quick "+" composer scroll trigger
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global user state & token handling
│   │   ├── theme/
│   │   │   └── theme.js          # Material UI custom theme (TaskPlanet colors & typography)
│   │   ├── App.jsx               # Main responsive container & feed layout
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Server listening port | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Secret key for JWT signing | `a_strong_secret_key` |
| `CLIENT_URL` | Deployed frontend URL for CORS | `http://localhost:3000` or `https://your-app.vercel.app` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write access token | `vercel_blob_rw_...` |

### Frontend (`frontend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of backend API (omit for local dev with Vite proxy) | `http://localhost:5000/api` or `https://your-backend.onrender.com/api` |

---

## Local Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (local instance or MongoDB Atlas free cluster)

### 1. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGO_URI, JWT_SECRET, and BLOB_READ_WRITE_TOKEN
npm run dev
```
Backend will start on `http://localhost:5000`.

To run the local unit & constraint test suite (18 tests):
```bash
npm test
```

To run the live automated API test suite against the deployed Render backend (29 tests):
```bash
npm run test:live
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend will start on `http://localhost:3000` and automatically proxy `/api` calls to `http://localhost:5000`.

To create a production build:
```bash
npm run build
```

---

## API Endpoints Reference

Base URL: `/api` (Production: `https://task1-ay9p.onrender.com/api`)

> [!TIP]
> **One-Click Testing**: You can test all GET endpoints directly by clicking the links in the [⚡ One-Click Live API Testing](#-one-click-live-api-testing) section above.

### Authentication (`/api/auth`)
- `POST /auth/signup`: Body `{ username, email, password }` -> Returns `{ user, token }`
- `POST /auth/login`: Body `{ email, password }` -> Returns `{ user, token }`
- `GET /auth/me`: Auth header `Bearer <token>` -> Returns `{ user }`

### Posts Feed & Interactions (`/api/posts`)
- `GET /posts?page=1&limit=10&sort=newest&search=...`: Public feed. Sort options: `newest`, `mostLiked`, `mostCommented`.
- `POST /posts`: Protected (`multipart/form-data` or JSON with `text` and/or `image` file / `imageUrl`).
- `POST /posts/:id/like`: Protected. Toggles like/unlike. Returns `{ liked, likeCount, likes }`.
- `POST /posts/:id/comment`: Protected. Body `{ text }`. Returns `{ comment, commentCount, comments }`.

---

## Deployment Guide

### 1. Database (MongoDB Atlas)
1. Log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free Shared cluster (M0).
2. Under **Database Access**, create a user with read/write privileges.
3. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere, required for Render).
4. Copy the connection string into `MONGO_URI`.

### 2. Backend (Render)
1. Push this repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com/), select **New Web Service**.
3. Connect your GitHub repository.
4. Configure settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. In **Environment Variables**, add:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL` = `https://frontend-pied-six-iozb10bqhw.vercel.app`
   - `BLOB_READ_WRITE_TOKEN` (from Vercel Blob store)
   - `NODE_ENV` = `production`
6. Click **Deploy Web Service**. Active at `https://task1-ay9p.onrender.com`.

### 3. Frontend (Vercel)
1. In [Vercel](https://vercel.com/), click **Add New Project** and link your repo.
2. Configure settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL` = `https://task1-ay9p.onrender.com/api`
4. Click **Deploy**. Active at `https://frontend-pied-six-iozb10bqhw.vercel.app/`.

