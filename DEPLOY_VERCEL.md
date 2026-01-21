# Deploy WhisperCart to Vercel

## ✅ **Deployment in 5 Minutes**

---

## **Step 1: Connect GitHub to Vercel**

1. Go to: https://vercel.com
2. Click **"Sign Up"** (use GitHub)
3. Connect your GitHub account
4. Click **"New Project"**
5. Select your **WhisperCart** repo
6. Click **"Import"**

---

## **Step 2: Add Environment Variables**

Before deploying, add your environment variables in Vercel:

1. Go to **Settings** → **Environment Variables**
2. Add each variable:

```env
MONGODB_URI=your_mongodb_atlas_uri
HUGGINGFACE_API_TOKEN=your_huggingface_token
RAINFOREST_API_KEY=your_rainforest_key
OPENAI_API_KEY=your_openai_key
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CUELINKS_API_KEY=your_cuelinks_api_key_when_received
```

3. Click **"Save"**

---

## **Step 3: Deploy**

1. Click **"Deploy"** button
2. Wait 1-2 minutes for build to complete
3. You'll get a URL like: `https://whispercart.vercel.app`

---

## **Step 4: Update Mobile App API URL**

After deployment, your API endpoints are at:
```
https://whispercart.vercel.app/api/search
https://whispercart.vercel.app/api/negotiate
https://whispercart.vercel.app/api/health
```

The mobile app will auto-detect and use Vercel URL when deployed.

---

## **Testing Your Deployment**

```bash
# Test health endpoint
curl https://whispercart.vercel.app/api/health

# Test search
curl "https://whispercart.vercel.app/api/search?q=laptop&budget=50000"

# Test negotiate
curl -X POST https://whispercart.vercel.app/api/negotiate \
  -H "Content-Type: application/json" \
  -d '{"product":{"name":"Laptop","price":50000},"budget":40000,"messages":[]}'
```

---

## **File Structure After Deployment**

```
WhisperCart/
├── api/                    (← NEW - Vercel serverless functions)
│   ├── search.js
│   ├── negotiate.js
│   └── health.js
├── backend/                (← Existing backend code)
│   ├── utils/
│   ├── routes/
│   └── config.js
├── WhisperCart/            (← Mobile app)
├── vercel.json             (← NEW - Vercel config)
└── .env                    (← Environment variables)
```

---

## **Environment Variables Explained**

| Variable | Where to Get |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas (already configured) |
| `HUGGINGFACE_API_TOKEN` | HuggingFace (already have) |
| `RAINFOREST_API_KEY` | Rainforest API (already have) |
| `OPENAI_API_KEY` | OpenAI (already have) |
| `JWT_SECRET` | Generate random string |
| `CUELINKS_API_KEY` | CueLinks (waiting for approval) |

---

## **Troubleshooting**

### **Deployment Failed?**
1. Check build logs in Vercel dashboard
2. Make sure all dependencies in `package.json` are correct
3. Verify environment variables are set

### **API Returns 500 Error?**
1. Check Vercel function logs
2. Verify MongoDB URI is correct
3. Check HuggingFace token is valid

### **Slow API Response?**
- Vercel cold start: First request takes 5-10 seconds
- Subsequent requests: < 1 second
- This is normal for serverless

---

## **Next Steps After Deployment**

1. ✅ Test all endpoints
2. ✅ Update mobile app with new API URL
3. ✅ Deploy mobile app to App Store/Play Store
4. ✅ Get CueLinks API key when approved
5. ✅ Update to use CueLinks in production

---

## **Production Checklist**

- [ ] MongoDB URI added to Vercel
- [ ] All API keys configured
- [ ] Health endpoint returning 200
- [ ] Search endpoint working
- [ ] Negotiate endpoint working
- [ ] Mobile app points to Vercel URL
- [ ] CORS enabled (already done)
- [ ] Error logging working

**You're deployed! 🚀**
