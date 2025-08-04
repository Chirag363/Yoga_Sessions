# Wellness Sessions Platform - Quick Setup

A React + Node.js platform for creating and sharing wellness sessions with JSON-based content management.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Git

### Setup in 3 Steps

#### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment
npm run dev           # Starts on http://localhost:5000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env  # Configure your environment
npm start             # Starts on http://localhost:3000
```

#### 3. Database Setup
- **Local**: Start MongoDB service
- **Cloud**: Use MongoDB Atlas connection string

## 📁 Project Structure

```
Arvyax_1/
├── backend/           # Node.js API server
│   ├── models/        # Database models (User, Session)
│   ├── routes/        # API routes (auth, sessions)
│   ├── middleware/    # Authentication middleware
│   └── server.js      # Main server file
├── frontend/          # React application
│   ├── src/pages/     # Main pages (Dashboard, Editor, View)
│   ├── src/services/  # API calls
│   └── src/components/# Reusable components
└── SETUP.md          # This file
```

## 🔧 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/wellness-sessions
JWT_SECRET=your_secret_key
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🎯 How It Works

1. **Users register/login** → Get JWT token
2. **Create sessions** → JSON content with wellness exercises
3. **Auto-save drafts** → Saves every 30 seconds
4. **Publish sessions** → Makes them publicly viewable
5. **Browse public sessions** → Search by tags, view content

## 🧪 Test Your Setup

1. Visit `http://localhost:3000`
2. Register a new account
3. Create a session with some content
4. Save and publish it
5. View it in the public sessions list

## 🚀 Deploy to Production

### Using Render.com
1. Push code to GitHub
2. Create two Render services:
   - **Backend**: Node.js service from `/backend`
   - **Frontend**: Static site from `/frontend`
3. Update environment variables with production URLs

## 🔍 Common Issues

- **CORS errors**: Check `CORS_ORIGIN` matches frontend URL
- **Database connection**: Verify MongoDB is running
- **Port conflicts**: Change ports in environment files

## 📚 Key Features

- **Session Editor**: JSON editor with natural language conversion
- **Auto-save**: Automatic draft saving
- **Tag System**: Organize and search sessions
- **Responsive UI**: Works on all devices
- **Public Sharing**: Publish sessions for others

---

**Need help?** Check the troubleshooting section or create an issue on GitHub.