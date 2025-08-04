# Wellness Session Manager

A full-stack application for managing wellness sessions (yoga/meditation flows) with user authentication and session management.

## Features

- User registration and authentication
- Session creation and editing
- Auto-save functionality (5s inactivity or 30s interval)
- Session publishing and draft management
- Responsive design
- Real-time feedback for saves

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- React Hot Toast for notifications
- Axios for API calls

### Backend
- Node.js with Express and TypeScript
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- Express Validator for input validation
- Helmet and CORS for security

### Key Features
- **Auto-save**: Sessions auto-save every 30 seconds or after 5 seconds of inactivity
- **Real-time feedback**: Visual indicators for save status
- **Responsive design**: Works on desktop and mobile devices
- **Session management**: Create, edit, draft, and publish sessions
- **Search functionality**: Filter sessions by tags
- **Authentication**: Secure user registration and login

## Project Structure

```
├── frontend/          # React application
├── backend/           # Node.js API server
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (free tier available)

### Quick Setup (Windows)
1. Set up MongoDB Atlas (see MONGODB_ATLAS_SETUP.md)
2. Update `.env` file with your Atlas connection string
3. Double-click `install.bat` to install all dependencies
4. Double-click `start-app.bat` to start the application

### Manual Setup

#### Step 1: MongoDB Atlas Setup
1. Create account at https://www.mongodb.com/atlas
2. Create a new cluster (free tier)
3. Get your connection string
4. Update `backend/.env` with your MongoDB Atlas URI

#### Step 2: Backend Setup
```bash
cd backend
npm install
# For development (runs TypeScript directly)
npm run dev

# For production (compile first, then run)
npm run build
npm start
```

#### Step 3: Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

### Important Notes
1. **MongoDB Atlas Required**: Set up a free MongoDB Atlas cluster and update the .env file
2. **Environment Variables**: Update `backend/.env` with your Atlas connection string
3. **Auto-save**: The session editor automatically saves changes every 30 seconds or after 5 seconds of inactivity
4. **CORS**: Frontend and backend are configured to work together on localhost
5. **Data Persistence**: All user data and sessions are stored in MongoDB Atlas

### MongoDB Atlas Setup
- **Create Account**: Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free account
- **Create Cluster**: Use the free tier to create a new cluster
- **Get Connection String**: Click "Connect" → "Connect your application" and copy the connection string
- **Update .env**: Replace the MONGODB_URI in `backend/.env` with your Atlas connection string
- **Whitelist IP**: Add your IP address in Atlas "Network Access" settings

## API Endpoints

- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- GET `/api/sessions` - Get all public sessions
- GET `/api/my-sessions` - Get user's sessions
- POST `/api/my-sessions` - Create new session
- PUT `/api/my-sessions/:id` - Update session
- DELETE `/api/my-sessions/:id` - Delete session
- PUT `/api/my-sessions/:id/publish` - Publish session
