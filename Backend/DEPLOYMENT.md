# 🚀 Deployment Guide - Masai Hackathon Backend

## Prerequisites
- MongoDB database (MongoDB Atlas recommended)
- GitHub repository connected to Render

## Environment Variables Required

### In Render Dashboard:
1. **MONGO_URI** (Required)
   - Your MongoDB connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`

2. **DB_NAME** (Optional)
   - Default: `hackathon_db`
   - Your database name

3. **NODE_ENV**
   - Value: `production`

4. **CORS_ORIGIN**
   - Your frontend domain
   - For development: `*`
   - For production: `https://yourdomain.com`

5. **PORT**
   - Render will set this automatically

## Deployment Steps

### 1. Connect GitHub Repository
- Go to Render Dashboard
- Click "New Web Service"
- Connect your GitHub repository: `RANJAN-ritesh/Masai-Hackathon`
- Select the `Backend` folder as the root directory

### 2. Configure Build Settings
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment**: `Node`

### 3. Set Environment Variables
- Add all required environment variables in Render dashboard
- **MONGO_URI** is mandatory - get this from MongoDB Atlas

### 4. Deploy
- Click "Create Web Service"
- Render will automatically build and deploy

## Health Check Endpoints

- **Root**: `/` - Basic health check
- **Health**: `/health` - Detailed server status
- **API Routes**:
  - `/users/*` - User management
  - `/team/*` - Team management
  - `/team-request/*` - Team requests
  - `/problemStatementRoutes/*` - Problem statements

## Security Features

✅ **Password Hashing** - bcrypt with 12 salt rounds  
✅ **Rate Limiting** - 100 requests per 15 minutes per IP  
✅ **Input Validation** - Middleware validation for all inputs  
✅ **CORS Protection** - Configurable origin restrictions  
✅ **Environment Variables** - No hardcoded secrets  

## Monitoring

- Check `/health` endpoint for server status
- Monitor Render logs for any errors
- Database connection status in logs

## Troubleshooting

### Common Issues:
1. **MongoDB Connection Failed**
   - Check MONGO_URI environment variable
   - Verify MongoDB Atlas network access

2. **Build Failed**
   - Check TypeScript compilation
   - Verify all dependencies are in package.json

3. **Runtime Errors**
   - Check Render logs
   - Verify environment variables are set correctly

## Support

For deployment issues, check:
1. Render deployment logs
2. Environment variable configuration
3. MongoDB connection string format 