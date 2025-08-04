# MongoDB Atlas Configuration Sample

## Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/atlas
2. Sign up for a free account
3. Create a new cluster (use the free tier)

## Step 2: Get Connection String
1. In your Atlas dashboard, click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string

## Step 3: Update .env file
Replace the MONGODB_URI in your .env file with your Atlas connection string:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.<random-string>.mongodb.net/wellness-sessions?retryWrites=true&w=majority
```

## Example:
```
MONGODB_URI=mongodb+srv://wellnessuser:MyPassword123@cluster0.abc123.mongodb.net/wellness-sessions?retryWrites=true&w=majority
```

## Step 4: Whitelist IP Address
1. In Atlas dashboard, go to "Network Access"
2. Add your current IP address or use 0.0.0.0/0 for development (allow access from anywhere)

## Step 5: Create Database User
1. Go to "Database Access" in Atlas dashboard
2. Create a new database user with read/write permissions
3. Use these credentials in your connection string

## Security Notes:
- Never commit your .env file to version control
- Use strong passwords for database users
- In production, whitelist only specific IP addresses
- Consider using MongoDB Atlas connection with VPC peering for production
