# WhisperCart API Credentials Setup Guide

**Date**: January 21, 2026  
**Status**: Ready for Configuration

---

## ✅ What You Need to Get Started

The following services are already integrated into WhisperCart. You just need to add your API keys.

### 1. **HuggingFace (Negotiation AI)** ⭐ REQUIRED
**Status**: Free, No Approval Needed  
**Setup Time**: 3 minutes

```bash
# Follow these steps:
1. Go to: https://huggingface.co/join
2. Sign up with your email
3. Verify email
4. Go to Settings → Access Tokens
5. Click "New Token"
6. Name it: "WhisperCart"
7. Select "Read" permission
8. Click Create
9. Copy the token (starts with hf_)
```

**Add to `.env`:**
```env
HUGGINGFACE_API_TOKEN=hf_xxxxxxxxxxxxx
HUGGINGFACE_MODEL_ID=mistralai/Mistral-7B-Instruct-v0.2
```

**Free Tier Includes:**
- ✅ Unlimited API calls
- ✅ Mistral 7B (perfect for negotiations)
- ✅ No credit card required
- ℹ️ First model load: 30 seconds (then cached)

---

### 2. **CueLinks (Product Search)** ⭐ REQUIRED
**Status**: Free, Instant Approval  
**Setup Time**: 5 minutes  
**Commission**: 1-10%

```bash
# Follow these steps:
1. Go to: https://www.cuelinks.com/signup
2. Sign up with email
3. Create password
4. Go to Dashboard
5. Find "API Keys" section
6. Copy your API Key
```

**Add to `.env`:**
```env
CUELINKS_API_KEY=your_key_here
CUELINKS_BASE_URL=https://api.cuelinks.com/v1
```

**CueLinks Covers:**
- ✅ Flipkart
- ✅ Amazon
- ✅ Meesho
- ✅ Myntra
- ✅ 10,000+ other merchants

---

### 3. **Amazon PA-API** (Optional Fallback)
**Status**: Free to register, requires approval  
**Setup Time**: 10 minutes

```bash
# Follow these steps:
1. Go to: https://affiliate-program.amazon.com/
2. Sign in with Amazon account
3. Go to "Product Advertising API"
4. Click "Request Access"
5. Get Access Key & Secret Key
6. Get Partner Tag (format: whispercart-20)
```

**Add to `.env`:**
```env
AMAZON_ACCESS_KEY=xxxxx
AMAZON_SECRET_KEY=xxxxx
AMAZON_PARTNER_TAG=whispercart-21
```

---

### 4. **Rainforest API** (Fallback Search)
**Status**: Paid ($49/month)  
**Already Configured**: `RAINFOREST_API_KEY` in `.env`

---

## 📋 Complete `.env` Configuration

Here's what your `.env` file should look like:

```dotenv
# Database
MONGODB_URI=mongodb://localhost:27017/whispercart

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=604800

# AI & Speech APIs
ASSEMBLYAI_API_KEY=6b93cbfa92834b369d777dff123da6f1
OPENAI_API_KEY=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
DEEPGRAM_API_KEY=9741ae74bcb3b7cd9cb987f463a9ce28a90af92d

# Negotiation & LLM (HuggingFace)
HUGGINGFACE_API_TOKEN=hf_xxxxxxxxxxxxx
HUGGINGFACE_MODEL_ID=mistralai/Mistral-7B-Instruct-v0.2

# Affiliate APIs - Product Search
RAINFOREST_API_KEY=e23f1f971fd898e68948d13af762c94c
CUELINKS_API_KEY=your_cuelinks_api_key_here
CUELINKS_BASE_URL=https://api.cuelinks.com/v1

# Amazon PA-API (Optional)
AMAZON_PARTNER_TAG=whispercart-21
AMAZON_ACCESS_KEY=your_amazon_access_key
AMAZON_SECRET_KEY=your_amazon_secret_key
```

---

## 🚀 Quick Priority Order

**Do these first:**

1. ✅ **HuggingFace** (3 min) - Gets negotiation working
2. ✅ **CueLinks** (5 min) - Gets product search working
3. ⏭️ Amazon PA-API (10 min) - Adds fallback

After these, your app will be **100% functional** for launch.

---

## ✔️ Verification Commands

After adding credentials, test each service:

```bash
# Test HuggingFace (Negotiation)
cd backend
node -e "const llm = require('./utils/llmService'); llm.extractIntentWithLLM('negotiate 1000 rupees')"

# Test CueLinks (Search)
node -e "const cuelinks = require('./utils/cuelinksService'); cuelinks.searchProducts('laptop', {limit: 3})"

# Test Negotiation Endpoint
node test_negotiation.js
```

---

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| "HUGGINGFACE_API_TOKEN not set" | Copy token to `.env` and restart server |
| "401 Unauthorized" | Check token is copied correctly (no spaces) |
| "Model loading" | HuggingFace free tier takes 30s first time - retry |
| "CueLinks API error" | Check API key in dashboard, regenerate if needed |

---

## 📞 Support

All three services have free tiers with generous limits:
- **HuggingFace**: Unlimited calls
- **CueLinks**: 10K+ merchants covered
- **Amazon PA-API**: Free tier available

**Expected Monthly Cost**: $0 (with free tiers)

---

## ✅ Status Checklist

- [ ] HuggingFace token obtained
- [ ] HuggingFace added to `.env`
- [ ] CueLinks account created
- [ ] CueLinks API key added to `.env`
- [ ] Backend restarted
- [ ] Negotiation endpoint tested
- [ ] Search endpoint tested

Once all ✅, your WhisperCart is ready to deploy!
