# TaskFlow - Premium Production-Ready Full Stack Todo Application

TaskFlow is a premium, state-of-the-art Single Page Application (SPA) designed to streamline task management. It features modern SaaS layouts, dark/light themes, real-time filters, interactive analytics dashboards, calendar scheduling, and drag-and-drop kanban boards.

Designed with **clean architecture** and **SOLID principles**, this application is complete, production-ready, secure, and ready for deployment to Vercel, Render, and MongoDB Atlas.

---

## 🌟 Application Features

### 🔒 Authentication & Security
- **JWT Authentication**: Secure stateless authentication using JSON Web Tokens.
- **Password Hashing**: Secure storage of credentials using `bcryptjs`.
- **Protected Routes**: Navigation guards matching auth status.
- **Persistent Sessions**: User session stays active via token validation in `localStorage`.
- **Security Middlewares**: Incorporates `helmet` (header defense), `cors` (safe resource sharing), `express-rate-limit` (brute force protection), and input sanitization to block XSS and NoSQL injection.

### 📋 Task Management (Todos)
- **Comprehensive Schema**: Title, description, priority (low/medium/high), category, due date, status, recurrence, pins, and favorites.
- **Drag-and-Drop ordering**: Drag and drop tasks in List and Kanban Board views to prioritize or change statuses. Reorders synchronize instantly to the server database.
- **Filter and Sort**: Real-time filtering by priority, status, category, and due date. Sort by newest, oldest, priority, due date, or alphabetically.
- **Live Search**: Instantly searches both title and description.
- **Soft Delete (Trash)**: Tasks can be soft-deleted into a Trash Bin where they can be restored or permanently destroyed.
- **Archive System**: Mark completed projects or inactive workflows as archived to keep the main desk clean.

### 📊 Dashboard Analytics
- **Summary Cards**: Total Active Tasks, Completed Tasks, Pending/In Progress Tasks, and Overdue Tasks counters.
- **Completion Rate Indicator**: Real-time progress visualizer mapping task execution.
- **Pie Chart**: Category breakdown mapping distribution of tasks.
- **Bar Chart**: Priority breakdown mapping task importance count.
- **Activity Log**: Recent actions feed log listing last user interactions.

---

## 🛠️ Tech Stack

### Frontend
- **React 19**
- **Vite**
- **React Router (v6)**
- **Axios**
- **Tailwind CSS v4** (CSS-first engine)
- **Framer Motion** (Subtle micro-animations & transitions)
- **Recharts** (Interactive visual graphs)
- **React Hook Form** + **Zod Validation**
- **React Hot Toast** (Alert notifications)

### Backend
- **Node.js** + **Express.js**
- **MongoDB Atlas** + **Mongoose**
- **JSON Web Tokens (JWT)** + **bcryptjs**
- **Express Validator** (Strict API inputs validation)
- **Helmet**, **CORS**, and **Express Rate Limit** (Production security stack)

---

## 📂 Project Structure

```text
ToDo/
├── backend/
│   ├── config/
│   │   └── db.js            # MongoDB database config
│   ├── controllers/
│   │   ├── activityController.js
│   │   ├── authController.js
│   │   └── todoController.js
│   ├── middlewares/
│   │   ├── auth.js          # JWT Route guard
│   │   └── errorHandler.js  # Global exception formatter
│   ├── models/
│   │   ├── ActivityLog.js
│   │   ├── Todo.js
│   │   └── User.js
│   ├── routes/
│   │   ├── activityRoutes.js
│   │   ├── authRoutes.js
│   │   └── todoRoutes.js
│   ├── utils/
│   │   └── sendEmail.js     # Mock emailing client
│   ├── validators/
│   │   ├── schemas.js       # Input parameters rules
│   │   └── validator.js     # Middleware check orchestrator
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── dist/                # Production build output
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Dialog.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   └── Skeleton.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── TodoContext.jsx
│   │   ├── layouts/
│   │   │   ├── AuthLayout.jsx
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── Archive.jsx
│   │   │   ├── CalendarView.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── TodoBoard.jsx
│   │   │   └── Trash.jsx
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── services/
│   │   │   └── api.js        # Axios instance Interceptors
│   │   ├── utils/
│   │   │   └── zodResolver.js# Custom RHF Zod connector
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css        # Stylesheet core + dark mode tokens
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js (version 18 or higher)
- Local MongoDB running on port 27017 or a MongoDB Atlas URI

### 1. Setup Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Update the variables inside `.env` if necessary. (Defaults work out of the box with a local MongoDB service on `mongodb://127.0.0.1:27017/todo-db`).
5. Start development server:
   ```bash
   npm run dev
   ```

### 2. Setup Frontend
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 📡 API Documentation

### Auth APIs
- `POST /api/auth/register` - Create user. Request body: `{ username, email, password }`
- `POST /api/auth/login` - Authenticate user. Request body: `{ email, password }`
- `POST /api/auth/logout` - Clear user session records.
- `GET /api/auth/me` - Retrieve logged-in user profile details.
- `PUT /api/auth/me` - Update user details. Request body: `{ username, email, profileImage }`
- `PUT /api/auth/change-password` - Change password. Request body: `{ currentPassword, newPassword }`
- `POST /api/auth/forgot-password` - Trigger reset password token. Request body: `{ email }`
- `PUT /api/auth/reset-password/:resettoken` - Reset password. Request body: `{ password }`

### Todo APIs
- `GET /api/todos` - Retrieve user todos (supports query parameters: `search`, `status`, `priority`, `category`, `dueDate`, `sortBy`, `page`, `limit`, `tab`).
- `POST /api/todos` - Create a new todo. Request body: `{ title, description, priority, category, dueDate, recurring }`
- `PUT /api/todos/:id` - Update an existing todo. Request body: `{ title, description, priority, category, dueDate, recurring, completed, isFavorite, isPinned, isArchived, isTrashed }`
- `PATCH /api/todos/:id/status` - Update status only. Request body: `{ status: 'pending' | 'in_progress' | 'completed' }`
- `PUT /api/todos/reorder` - Update persistent index orders. Request body: `{ todoIds: [id1, id2, id3...] }`
- `DELETE /api/todos/:id` - Soft-deletes a standard todo or permanently deletes a trashed todo.
- `GET /api/todos/categories` - Fetch all unique categories.

### Activity Log APIs
- `GET /api/activities` - Fetch recent logged activities.

---

## 🌐 Deployment Guide

### Database: MongoDB Atlas Setup
1. Sign in to your [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas).
2. Create a database cluster and choose your cloud provider/region.
3. Under **Database Access**, create a user credentials log (Username/Password).
4. Under **Network Access**, whitelist connection IP addresses (use `0.0.0.0/0` to allow connections from Render).
5. Navigate to your cluster, click **Connect**, select **Drivers**, and copy your `connection string`. Replace `<password>` with your database user password.

### Backend: Render Deployment
1. Log in to [Render](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository containing the codebase.
4. Set the following configuration:
   - **Name**: `taskflow-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. In the **Environment Variables** tab, add:
   - `MONGO_URI`: (Your MongoDB Atlas connection string)
   - `JWT_SECRET`: (A secure long random string)
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render binds this dynamically, but setting it explicitly is a safe fallback)
   - `FRONTEND_URL`: (Your Vercel deployment URL)
6. Click **Deploy Web Service** and copy the live Service URL (e.g. `https://taskflow-backend.onrender.com`).

### Frontend: Vercel Deployment
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** and select **Project**.
3. Import your GitHub repository.
4. Configure the following project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: (Your Render backend Service URL, e.g. `https://taskflow-backend.onrender.com/api`)
6. Click **Deploy**. Vercel will build and launch your application.

---

## 🛠️ Git & GitHub Push Guide

To push your local application to GitHub for deployment:
1. Initialize git inside the root workspace folder:
   ```bash
   git init
   ```
2. Add files to index:
   ```bash
   git add .
   ```
3. Commit files locally:
   ```bash
   git commit -m "feat: Initial commit of full-stack premium todo dashboard"
   ```
4. Create a new repository on GitHub.
5. Link your local repo to GitHub and push (replace user details):
   ```bash
   git branch -M main
   git remote add origin https://github.com/your-username/your-repo-name.git
   git push -u origin main
   ```
