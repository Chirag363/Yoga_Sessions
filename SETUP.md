# Setup Guide - Wellness Session Manager

## Prerequisites

1. **Node.js** (v16 or higher) - [Download from nodejs.org](https://nodejs.org/)
2. **MongoDB** - [Download from mongodb.com](https://www.mongodb.com/try/download/community)

## Installation Steps

### Option 1: Quick Setup (Windows)
1. Double-click `install.bat` to install all dependencies
2. Start MongoDB service
3. Double-click `start-app.bat` to run the application

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend
npm install
npm run build
npm run dev
```

#### Frontend Setup (in a new terminal)
```bash
cd frontend
npm install
npm start
```

## Configuration

### Environment Variables
The backend uses the following environment variables (already configured in `.env`):

- `PORT=5000` - Backend server port
- `MONGODB_URI=mongodb://localhost:27017/wellness-sessions` - MongoDB connection
- `JWT_SECRET=wellness-session-super-secret-jwt-key-2024` - JWT secret key
- `JWT_EXPIRE=7d` - JWT token expiration

### MongoDB Setup
1. Install MongoDB Community Edition
2. Start MongoDB service:
   - **Windows**: MongoDB should start automatically as a service
   - **Manual start**: Run `mongod` in terminal

## Running the Application

### Development Mode
1. Start MongoDB
2. Run backend: `cd backend && npm run dev`
3. Run frontend: `cd frontend && npm start`

### Production Mode
1. Build frontend: `cd frontend && npm run build`
2. Build backend: `cd backend && npm run build`
3. Start backend: `cd backend && npm start`
4. Serve frontend build files through a web server

## Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## Features

### User Authentication
- Register new account
- Login with email/password
- JWT-based authentication
- Protected routes

### Session Management
- Create wellness sessions
- Edit session details (title, tags, JSON URL, content)
- Auto-save every 30 seconds or 5 seconds after inactivity
- Save as draft or publish
- Delete sessions
- View public sessions

### Auto-save Features
- Visual feedback for save status
- Auto-save after 5 seconds of inactivity
- Auto-save every 30 seconds
- Manual save option

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Sessions
- `GET /api/sessions` - Get public sessions
- `GET /api/sessions/:id` - Get specific public session
- `GET /api/my-sessions` - Get user's sessions
- `POST /api/my-sessions` - Create new session
- `GET /api/my-sessions/:id` - Get user's specific session
- `PUT /api/my-sessions/:id` - Update session
- `PUT /api/my-sessions/:id/publish` - Publish session
- `DELETE /api/my-sessions/:id` - Delete session

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MongoDB URI in `.env` file

2. **Port Already in Use**
   - Change ports in environment variables
   - Kill processes using the ports

3. **Dependencies Issues**
   - Delete `node_modules` and run `npm install` again
   - Check Node.js version compatibility

4. **CORS Issues**
   - Frontend and backend are configured to work together
   - Check CORS settings in `backend/src/server.ts`

### Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload during development
2. **Error Logs**: Check browser console and terminal for error messages
3. **Database**: Use MongoDB Compass to view database contents
4. **API Testing**: Use tools like Postman to test API endpoints

## Project Structure

```
wellness-session-manager/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── services/
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
└── README.md
```
