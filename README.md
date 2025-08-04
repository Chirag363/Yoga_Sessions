# Wellness Session Manager

A full-stack application for managing wellness sessions (yoga/meditation flows) with user authentication and session management.

## Features

- User registration and authentication
- Session creation and editing with JSON content
- Auto-save functionality (30s interval or 5s inactivity)
- Session publishing and draft management
- Tag-based organization and search
- Responsive design with real-time feedback

## Tech Stack

**Frontend:** React 18 + TypeScript, Tailwind CSS, React Router  
**Backend:** Node.js + Express + TypeScript, MongoDB + Mongoose, JWT Authentication

## Project Structure

```
Arvyax_1/
├── frontend/          # React application
│   ├── src/pages/     # Main pages (Dashboard, Editor, View)
│   ├── src/services/  # API calls
│   └── src/components/# Reusable components
├── backend/           # Node.js API server
│   ├── models/        # Database models (User, Session)
│   ├── routes/        # API routes (auth, sessions)
│   └── middleware/    # Authentication middleware
└── README.md
```

## Quick Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### Installation

1. **Backend Setup**
```bash
cd backend
npm install
# Configure .env with MongoDB URI and JWT secret
npm run dev  # Starts on http://localhost:5000
```

2. **Frontend Setup**
```bash
cd frontend
npm install
# Configure .env with API URL
npm start    # Starts on http://localhost:3000
```

### Environment Variables

**Backend (.env)**
```env
MONGODB_URI=mongodb://localhost:27017/wellness-sessions
JWT_SECRET=your_secret_key
PORT=5000
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Sessions
- `GET /api/sessions/public` - Get public sessions
- `GET /api/sessions/my` - Get user's sessions
- `GET /api/sessions/public/:id` - Get specific public session
- `GET /api/sessions/my/:id` - Get user's specific session
- `POST /api/sessions` - Create new session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session
- `POST /api/sessions/:id/publish` - Publish session

## Access Points

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/health

---

For detailed setup instructions, see