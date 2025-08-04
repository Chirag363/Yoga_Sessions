@echo off
echo Setting up MongoDB Atlas connection...
echo.
echo Please follow these steps:
echo.
echo 1. Go to https://www.mongodb.com/atlas
echo 2. Create a free account and cluster
echo 3. Get your connection string
echo 4. Open backend\.env file
echo 5. Replace the MONGODB_URI with your Atlas connection string
echo.
echo Example:
echo MONGODB_URI=mongodb+srv://username:password@cluster0.abc123.mongodb.net/wellness-sessions?retryWrites=true^&w=majority
echo.
echo After updating the .env file, run start-app.bat
echo.
pause
