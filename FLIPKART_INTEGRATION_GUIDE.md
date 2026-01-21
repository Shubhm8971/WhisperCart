# Flipkart Integration Setup Guide

## Problem Solved
Your Flipkart integration wasn't working because:
1. Flipkart doesn't have a public free API
2. Requires partnership/affiliate program approval
3. Custom API access is restricted

## Solution: Use Rainforest API
Rainforest API is a service that crawls multiple e-commerce platforms (Amazon, Flipkart, eBay, etc.) and provides unified API access with affiliate link support.

---

## Setup Steps

### 1. Get Rainforest API Key (FREE for testing)
- Go to: https://www.rainforestapi.com
- Click "Sign Up" → Create free account
- You get **100 free requests/month** to test
- Get your API key from dashboard

### 2. Set Environment Variables
Create/update your `.env` file in the `backend/` folder:

```bash
# Rainforest API
RAINFOREST_API_KEY=your_actual_api_key_here

# Flipkart Affiliate
FLIPKART_AFFILIATE_ID=your_flipkart_affiliate_id

# Other existing variables
DEEPGRAM_API_KEY=...
OPENAI_API_KEY=...
MONGODB_URI=...
```

### 3. Test the Integration

Run this command in your `backend/` folder:

```bash
curl "http://localhost:3002/search?product=crocs&budget=2000&store=flipkart"
```

You should get real Flipkart results if API key is set, or mock data if not.

---

## Alternative Solutions (If Rainforest doesn't work for you)

### Option 2: Use Affiliate Networks
- **CueLinks** (https://www.cuelinks.com/) - Indian affiliate platform supporting Flipkart
- **Optimise** (https://www.optimise.in/) - Another Indian option

### Option 3: Direct Flipkart Affiliate Program
1. Apply at: https://www.flipkartseller.com/
2. Get approved (takes 3-5 days)
3. Use their affiliate links in your product URLs
4. They provide basic API access to approved partners

### Option 4: Meesho API (Easier)
Meesho has a public affiliate API that's easier to integrate:
- Get API key from: https://meesho.app/
- Better for lower-price products in India
- Simpler authentication

---

## Implementation Details

### How It Works
1. **User searches** for "crocs under ₹2000"
2. **Your app calls** `/search?product=crocs&budget=2000&store=flipkart`
3. **Backend calls** Rainforest API with your API key
4. **Rainforest crawls** Flipkart's search results
5. **Results returned** with affiliate links embedded
6. **When user clicks** → Flipkart affiliate commission earned

### Revenue Flow
```
User clicks product → Flipkart affiliate link → User buys
                                                   ↓
                                          Affiliate commission
                                             (your account)
```

### Pricing
- **Rainforest API**: $49-99/month for commercial use (3,000-10,000 requests)
- **CueLinks**: Commission-based (no upfront cost)
- **Flipkart Direct**: 1-10% commission (varies by category)

---

## Quick Test Without API Key

The code has **fallback mock data**, so it works even without credentials:

```bash
# This works immediately (mock data)
curl "http://localhost:3002/search?product=shoes&budget=3000"

# This works with API key (real Flipkart data)
curl "http://localhost:3002/search?product=shoes&budget=3000&store=flipkart"
```

---

## Cost vs Revenue Calculator

### Example Scenario
- **Monthly searches**: 1,000
- **Click-through rate**: 30% = 300 clicks
- **Conversion rate**: 5% = 15 sales
- **Average order value**: ₹2,000
- **Affiliate commission**: 4% = ₹120 per sale

**Monthly revenue**: 15 × ₹120 = **₹1,800/month**

With 10,000 monthly users: **₹18,000+/month**

---

## Next Steps

1. ✅ **This week**: Get Rainforest API key (5 min) → Test
2. **Next week**: Deploy to production with real API
3. **Following week**: Apply for direct Flipkart partnership
4. **Month 2**: Add Meesho & CueLinks for more inventory

Your infrastructure is ready. You just need the API credentials!
