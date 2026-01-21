# Fly.io Deployment Guide for WhisperCart

## Overview
Fly.io is a modern container deployment platform that runs Docker containers globally. It has a free tier with $5/month credit (usually enough for small backends).

## Prerequisites
- ✅ GitHub account with WhisperCart repo
- ✅ Fly.io account (free signup at fly.io)
- ✅ Docker configured (Fly.io CLI uses Docker)
- ✅ Express.js backend in `/backend/server.js`

## Installation & Setup

### 1. Install Fly.io CLI
```bash
# macOS
brew install flyctl

# Windows (PowerShell as Admin)
scoop install flyctl

# Or download from: https://fly.io/docs/getting-started/installing-flyctl/
```

### 2. Authenticate with Fly.io
```bash
flyctl auth login
# Opens browser to login/register
# Returns auth token
```

### 3. Configure App
```bash
cd C:\Users\Shubh Mittal\OneDrive\Desktop\WhisperCart
flyctl launch
```

When prompted:
- App name: `whispercart-api` (or your choice)
- Region: `del` (Delhi - closest to India)
- Postgres: `n` (we use MongoDB)
- Redis: `n`

This creates/updates `fly.toml`

### 4. Set Environment Variables
```bash
flyctl secrets set \
  MONGODB_URI="your_mongodb_atlas_uri" \
  JWT_SECRET="your_jwt_secret" \
  DEEPGRAM_API_KEY="your_deepgram_key" \
  OPENAI_API_KEY="your_openai_key" \
  RAINFOREST_API_KEY="your_rainforest_key"
```

### 5. Deploy
```bash
flyctl deploy
```

Wait for build & deploy (usually 2-3 minutes)

### 6. Get Your URL
```bash
flyctl info
# Shows: App instance: https://whispercart-api.fly.dev
```

## Verify Deployment

Test endpoints in browser or curl:
```bash
# Health check
curl https://whispercart-api.fly.dev/

# Search
curl "https://whispercart-api.fly.dev/search?q=laptop&budget=50000"

# Negotiate (requires POST)
curl -X POST https://whispercart-api.fly.dev/negotiate \
  -H "Content-Type: application/json" \
  -d '{
    "product": {"name": "Sony Headphones", "price": "5000"},
    "budget": 4000,
    "messages": []
  }'
```

## Important Notes

### Port Handling
- Backend runs on port 3002 internally
- Fly.io exposes it as `https://[app-name].fly.dev`
- No port number needed in URL

### Free Tier Limits
- $5/month free credit
- 3 shared-cpu-1x 256MB VMs
- Auto-scaling: min 1 instance
- Sufficient for small-to-medium apps

### Paid (if needed)
- $0.0000114/second per shared CPU (≈$0.40/month)
- $0.0000000463/MB/second (≈$1.50/month per 256MB)
- Typical small app: $5-10/month

## Common Commands

```bash
# View logs
flyctl logs

# SSH into container
flyctl ssh console

# View all deployments
flyctl deployments list

# Rollback to previous deployment
flyctl releases list
flyctl releases rollback

# Scale up/down
flyctl scale count 2  # 2 instances

# Monitor metrics
flyctl monitor

# Restart app
flyctl restart
```

## Troubleshooting

### Build Fails
- Check `Dockerfile` is correct
- Verify `backend/package.json` has all dependencies
- View full logs: `flyctl logs --follow`

### Endpoints Return 404
- Ensure all routes are in `backend/routes/`
- Check `backend/server.js` is loading routes correctly
- Verify `PORT` environment variable isn't hardcoded

### Database Connection Fails
- Check `MONGODB_URI` is set: `flyctl secrets list`
- Verify MongoDB Atlas whitelist includes Fly.io IP ranges
- View errors: `flyctl logs`

### High Latency
- Check region in `fly.toml` (currently: `del` = Delhi)
- Add closer region: `flyctl regions add sin` (Singapore)

## Update Mobile App

Once deployed, update `WhisperCart/constants/api.ts`:
```typescript
const API_URL = 'https://whispercart-api.fly.dev';
```

Then rebuild mobile app with:
```bash
eas build --platform ios
eas build --platform android
```

## Next Steps

- [ ] Complete `flyctl launch` setup
- [ ] Set all environment variables
- [ ] Deploy with `flyctl deploy`
- [ ] Test API endpoints
- [ ] Update mobile app URL
- [ ] Monitor logs for first week
- [ ] Set up uptime monitoring (UptimeRobot)

## File Reference
```
WhisperCart/
├── Dockerfile           # Docker build instructions
├── fly.toml            # Fly.io configuration
├── backend/
│   ├── server.js       # Express entry point
│   ├── package.json    # Dependencies
│   └── routes/         # API routes
└── WhisperCart/        # Mobile app
    └── constants/api.ts # API URL config
```

## Support
- Fly.io docs: https://fly.io/docs/
- Discord: https://discord.gg/flyio
- GitHub Issues: https://github.com/Shubhm8971/WhisperCart/issues
