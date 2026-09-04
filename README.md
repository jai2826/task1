# Mini Social Post Application (TaskPlanet "Social" Tab)

A responsive social feed web application replicating the **Social** tab from the TaskPlanet mobile app. Built with **React.js** (Material UI) and a **Node.js/Express** backend with **MongoDB**.

---

## Live Links (Deployment)

| Component | Platform | Live URL |
| :--- | :--- | :--- |
| **Frontend** | Vercel / Netlify | `https://your-frontend-deployment.vercel.app` *(update upon deploy)* |
| **Backend API** | Render | `https://your-backend-api.onrender.com` *(update upon deploy)* |
| **Database** | MongoDB Atlas | Managed Cluster |

> [!NOTE]
> **Render Cold-Start Delay**:
> The backend is deployed on Render's free tier, which spins down after periods of inactivity. The very first request after an idle period may experience a cold start latency of **30–50 seconds**. Subsequent requests will respond instantly.

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
│   ├── test-api.js               # Automated backend test suite (18 tests)
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
| `CLIENT_URL` | Deployed frontend URL for CORS | `http://localhost:3000` or `https://app.vercel.app` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write access token | `vercel_blob_rw_...` |

### Frontend (`frontend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of deployed API (omit for local dev with Vite proxy) | `https://your-backend.onrender.com/api` |

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
# Edit .env with your MONGO_URI and JWT_SECRET
npm run dev
```
Backend will start on `http://localhost:5000`.

To run the automated backend test suite:
```bash
npm test
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

Base URL: `/api`

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
   - `CLIENT_URL` (your deployed frontend URL)
   - `BLOB_READ_WRITE_TOKEN` (from Vercel Blob store)
   - `NODE_ENV` = `production`
6. Click **Deploy Web Service**.

### 3. Frontend (Vercel / Netlify)
1. In [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/), click **Add New Project** and link your repo.
2. Configure settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL` = `https://<your-render-backend-url>/api`
4. Click **Deploy**.
