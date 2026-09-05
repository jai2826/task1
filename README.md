# Mini Social Post Application (Social Feed)

A responsive social feed web application. Built with **React.js** (Material UI) and a **Node.js/Express** backend with **MongoDB**.

---

## 🚀 Live Deployment Links

| Component | Platform | Status | Live URL |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | Vercel | <a href="https://frontend-pied-six-iozb10bqhw.vercel.app/" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Vercel-Live%20Deployment-black?logo=vercel" alt="Vercel" /></a> | <a href="https://frontend-pied-six-iozb10bqhw.vercel.app/" target="_blank" rel="noopener noreferrer">https://frontend-pied-six-iozb10bqhw.vercel.app/</a> |
| **Backend REST API** | Render | <a href="https://task1-ay9p.onrender.com/api/health" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Render-Active%20API-46E3B7?logo=render&logoColor=black" alt="Render" /></a> | <a href="https://task1-ay9p.onrender.com/api/health" target="_blank" rel="noopener noreferrer">https://task1-ay9p.onrender.com/api/health</a> |
| **Database** | MongoDB Atlas | <a href="https://www.mongodb.com/cloud/atlas" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/MongoDB-Atlas%20Cluster-green?logo=mongodb" alt="MongoDB Atlas" /></a> | Cloud Managed Cluster |

> [!NOTE]
> **Render Cold-Start Notice**:
> The backend is hosted on Render's free tier, which spins down after 15 minutes of inactivity. If the service is idle, the very first request may experience a warm-up delay of **30–50 seconds**. Subsequent requests respond instantly in milliseconds.

---

## 👥 Demo User Accounts (Top 3 for Testing)

The MongoDB database is populated with **20 original seed accounts** and active feed posts. Users and reviewers can immediately sign in to the <a href="https://frontend-pied-six-iozb10bqhw.vercel.app/" target="_blank" rel="noopener noreferrer">live application</a> using any of the following top accounts:

| # | Name | Username | Login ID (Email) | Password | Bio / Role |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | **Sophia Chen** | `sophia_codes` | `sophia.codes@example.com` | `test1234@` | Full-stack engineer building open source tools 💻☕ |
| **2** | **Marcus Vance** | `marcus_dev` | `marcus.dev@example.com` | `test1234@` | TypeScript enthusiast, distributed systems nerd. |
| **3** | **Elena Rostova** | `elena_design` | `elena.design@example.com` | `test1234@` | Product designer crafting clean UI/UX experiences ✨ |

> [!TIP]
> **Quick Sign In Steps**:
> 1. Open the <a href="https://frontend-pied-six-iozb10bqhw.vercel.app/" target="_blank" rel="noopener noreferrer">Frontend Web App</a>.
> 2. Click **Sign In** in the top navigation bar.
> 3. Enter any of the credentials above (e.g., `sophia.codes@example.com` with password `test1234@`).
> 4. Test creating posts (with text/images), liking feed posts, and posting comments!

> [!IMPORTANT]
> **Password Protection on Demo Accounts**:
> Password reset is locked for these 3 public showcase accounts so that reviewers can always log in without disruption. A notification appears inside the Settings dialog explaining this. To test password reset functionality, simply create a new personal account via the **Sign Up** tab.

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
│   ├── test-api.js               # Local unit & schema constraint tests (39 automated tests)
│   ├── test-live-api.js          # Automated test suite validating auth, CRUD, and pagination against the live API
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
│   │   │   └── TopNavBar.jsx     # Header: "Social", search bar, user avatar/auth button
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global user state & token handling
│   │   ├── theme/
│   │   │   └── theme.js          # Material UI custom theme (colors & typography)
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

### 3. Running Automated Tests

Run automated test suites from the `backend/` directory:

- **Local Unit & Constraints Test Suite**:
  ```bash
  cd backend
  npm test
  ```
  Runs 39 automated tests verifying Mongoose schemas, model validation rules, embedded likes and comments constraints, image upload handling, and user authentication.

- **Live API Test Suite**:
  ```bash
  cd backend
  npm run test:live
  ```
  Automated test suite validating auth, CRUD, and pagination against the live API (asserts server health check, user login, JWT tokens, feed filtering, post creation, like toggles, comments, and cleanup).

---

## API Endpoints Reference

Base URL: `/api`

### Authentication (`/api/auth`)
- `POST /auth/signup`: Body `{ username, email, password }` -> Returns `{ user, token }`
- `POST /auth/login`: Body `{ email, password }` -> Returns `{ user, token }`
- `GET /auth/me`: Auth header `Bearer <token>` -> Returns `{ user }`

### Posts Feed & Interactions (`/api/posts`)
- `GET /posts?page=1&limit=10&sort=newest&search=...`: Public feed. Sort options: `newest`, `mostLiked`, `mostCommented`, `myPosts` (authenticated user's posts).
- `POST /posts`: Protected (`multipart/form-data` or JSON with `text` and/or `image` file / `imageUrl`).
- `POST /posts/:id/like`: Protected. Toggles like/unlike. Returns `{ liked, likeCount, likes }`.
- `POST /posts/:id/comment`: Protected. Body `{ text }`. Returns `{ comment, commentCount, comments }`.

---

## Deployment Guide

### 1. Database (MongoDB Atlas)
1. Log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free Shared cluster (M0).
2. Under **Database Access**, create a user with read/write privileges.
3. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere, required for cloud hosting).
4. Copy the connection string into `MONGO_URI` (e.g., `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/mini-social?retryWrites=true&w=majority`).

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
   - `MONGO_URI` = `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/mini-social?retryWrites=true&w=majority`
   - `JWT_SECRET` = `your_strong_jwt_secret_key`
   - `CLIENT_URL` = `https://your-frontend.vercel.app`
   - `BLOB_READ_WRITE_TOKEN` = `vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxx`
   - `NODE_ENV` = `production`
6. Click **Deploy Web Service**. Your service will be live at `https://your-backend.onrender.com`.

### 3. Frontend (Vercel)
1. In [Vercel](https://vercel.com/), click **Add New Project** and link your repo.
2. Configure settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
4. Click **Deploy**. Your frontend will be live at `https://your-frontend.vercel.app/`.

