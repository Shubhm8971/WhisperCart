# Railway Deployment Guide for WhisperCart

## Overview
Railway is a modern deployment platform that automatically detects and deploys Node.js applications. No build configuration needed—just connect your GitHub repo and deploy.

## Prerequisites
- ✅ GitHub account (already set up: Shubhm8971/WhisperCart)
- ✅ Railway account (free tier available at railway.app)
- ✅ Express.js backend (in `/backend/server.js`)
- ✅ Environment variables configured locally

## Step-by-Step Deployment

### 1. Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub (or create account)
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose `Shubhm8971/WhisperCart`
6. Railway will auto-detect Node.js

### 2. Configure Environment Variables
Add these in Railway dashboard (Project → Variables):

```
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret_key
DEEPGRAM_API_KEY=your_deepgram_key
OPENAI_API_KEY=your_openai_key
RAINFOREST_API_KEY=your_rainforest_key
EXPO_PUBLIC_API_URL=https://your-railway-app.railway.app
```

### 3. Deploy
1. Click "Deploy" in Railway dashboard
2. Watch build logs (should complete in ~2 minutes)
3. Note the generated Railway URL: `https://[project-name].railway.app`

### 4. Verify Deployment
Test these endpoints in your browser or Postman:

```bash
# Health check
GET https://your-railway-url/

# Search endpoint
GET https://your-railway-url/search?q=laptop&budget=50000

# Negotiate endpoint (requires POST with product data)
POST https://your-railway-url/negotiate
Content-Type: application/json

{
  "product": {
    "name": "Sony Headphones",
    "price": "5000",
    "store": "Amazon"
  },
  "budget": 4000,
  "messages": []
}
```

### 5. Update Mobile App
Update `WhisperCart/constants/api.ts`:
```typescript
const API_URL = 'https://your-railway-url';
```

Then rebuild and deploy the mobile app.

## Railway Features
- **Auto-deploy**: Every GitHub push triggers automatic redeploy
- **Logs**: Real-time logs in dashboard (similar to Heroku)
- **Monitoring**: CPU, memory, request metrics built-in
- **Free tier**: 500 MB storage, enough for small backends
- **Paid**: $5/month for production workloads

## Troubleshooting

### Build Fails
- Check `railway.toml` is correct
- Ensure `backend/package.json` has all dependencies
- View build logs in Railway dashboard

### Port Issues
- Railway automatically assigns port (env var: `$PORT`)
- Our server.js uses port 3002 locally, Railway auto-maps it

### Database Connection Fails
- Verify MongoDB Atlas IP whitelist includes Railway IP
- Check `MONGODB_URI` environment variable is set correctly

## Rollback
If deployment breaks:
1. Go to Railway dashboard
2. Select "Deployments" tab
3. Click previous working deployment
4. Click "Redeploy"

## Next Steps
After successful Railway deployment:
- [ ] Test all API endpoints with production URL
- [ ] Update mobile app build with new API URL
- [ ] Monitor logs for first week
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Configure custom domain (optional)

## File Structure Reference
```
WhisperCart/
├── backend/
│   ├── server.js          # Express entry point
│   ├── package.json       # Dependencies
│   ├── routes/            # API route handlers
│   ├── models/            # MongoDB models
│   └── utils/             # Utility functions
├── railway.toml          # Railway configuration
└── package.json          # Root package.json (start script)
```

## Support
- Railway docs: https://docs.railway.app
- Issue tracker: https://github.com/Shubhm8971/WhisperCart/issues
