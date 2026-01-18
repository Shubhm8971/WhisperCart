const nodeFetch = require('node-fetch');
const config = require('../config');
const affiliateService = require('./affiliateService');

/**
 * Consolidated Search across Amazon (Live) and Flipkart/Meesho (Mocks)
 */
async function searchProducts(keywords) {
    console.log('[v6.1] Multi-Store Search with Affiliate Engine:', keywords);

    const results = {
        amazon: [],
        flipkart: [],
        meesho: []
    };

    // 1. AMAZON SEARCH (RAINFOREST)
    try {
        if (config.rainforestApiKey) {
            results.amazon = await searchAmazon(keywords);
        }
    } catch (e) {
        console.warn('Amazon Search failed:', e.message);
    }

    // 2. FLIPKART SEARCH (Simulated)
    try {
        // In a real scenario, check for config.flipkartApiKey before calling
        if (config.flipkartApiKey) {
            results.flipkart = await searchFlipkart(keywords);
        } else {
            console.warn('Flipkart API Key not configured. Using simulated results.');
            results.flipkart = generateSimulatedResults(keywords, 'Flipkart');
        }
    } catch (e) {
        console.warn('Flipkart Search failed:', e.message);
    }

    // 3. MEESHO SEARCH (Simulated)
    try {
        // In a real scenario, check for config.meeshoApiKey before calling
        if (config.meeshoApiKey) {
            results.meesho = await searchMeesho(keywords);
        } else {
            console.warn('Meesho API Key not configured. Using simulated results.');
            results.meesho = generateSimulatedResults(keywords, 'Meesho');
        }
    } catch (e) {
        console.warn('Meesho Search failed:', e.message);
    }

    // Combine and return with store branding and affiliate links
    const consolidated = [
        ...results.amazon.map(item => ({
            ...item,
            store: 'Amazon',
            color: '#FF9900',
            link: affiliateService.wrapAffiliateLink(item.link, 'Amazon'),
            tier: getNegotiatorTier(item.title, item.price.value, 'Amazon')
        })),
        ...results.flipkart.map(item => ({
            ...item,
            store: 'Flipkart',
            color: '#2874F0',
            link: affiliateService.wrapAffiliateLink(item.link, 'Flipkart'),
            tier: getNegotiatorTier(item.title, item.price.value, 'Flipkart')
        })),
        ...results.meesho.map(item => ({
            ...item,
            store: 'Meesho',
            color: '#F43397',
            link: affiliateService.wrapAffiliateLink(item.link, 'Meesho'),
            tier: getNegotiatorTier(item.title, item.price.value, 'Meesho')
        }))
    ];

    return consolidated.slice(0, 15);
}

function getNegotiatorTier(title, price, store) {
    const lowerTitle = title.toLowerCase();
    const isUSD = store === 'Amazon';

    // 1. Keyword Overrides (High-end tech/luxury)
    if (lowerTitle.includes('macbook') || lowerTitle.includes('iphone') || lowerTitle.includes('rolex')) {
        if (isUSD && price > 200) return 'elite'; // Elite for MacBook even if price is low in mock
        if (!isUSD && price > 1000) return 'elite'; // Elite for MacBook even if price is low in mock
        return 'gold';
    }

    if (lowerTitle.includes('pro')) {
        if (isUSD && price > 500) return 'elite';
        return 'gold';
    }

    // 2. Price Thresholds
    if (isUSD) {
        if (price > 1200) return 'elite';
        if (price > 300) return 'gold';
        return 'silver';
    } else {
        if (price > 60000) return 'elite';
        if (price > 12000) return 'gold';
        return 'silver';
    }
}

/**
 * Live Amazon Search via Rainforest
 */
async function searchAmazon(keywords) {
    const params = {
        api_key: config.rainforestApiKey,
        type: 'search',
        amazon_domain: 'amazon.com',
        search_term: keywords
    };

    const queryString = new URLSearchParams(params).toString();
    const url = `https://api.rainforestapi.com/request?${queryString}`;

    const response = await nodeFetch(url);
    const data = await response.json();

    if (!data.search_results) return [];

    return data.search_results.map(item => ({
        asin: item.asin,
        title: item.title,
        image: item.image,
        price: {
            raw: item.price ? item.price.raw : 'N/A',
            value: item.price ? item.price.value : 0
        },
        link: item.link,
        rating: item.rating || (4 + Math.random()).toFixed(1),
        reviewsCount: item.ratings_total || Math.floor(100 + Math.random() * 1000)
    }));
}

/**
 * Simulated Flipkart Search
 * In a real scenario, this would make an API call to Flipkart's Affiliate API.
 */
async function searchFlipkart(keywords) {
    console.log('[Simulated] Searching Flipkart for:', keywords);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay

    return generateSimulatedResults(keywords, 'Flipkart');
}

/**
 * Simulated Meesho Search
 * In a real scenario, this would make an API call to Meesho's Affiliate API.
 */
async function searchMeesho(keywords) {
    console.log('[Simulated] Searching Meesho for:', keywords);
    await new Promise(resolve => setTimeout(resolve, 1800)); // Simulate API delay

    return generateSimulatedResults(keywords, 'Meesho');
}

/**
 * Generates realistic simulated data for Flipkart/Meesho (for when API keys are not configured)
 */
function generateSimulatedResults(keywords, store) {
    const priceRange = store === 'Meesho' ? [200, 1500] : [500, 5000];
    const results = [];
    const baseUrl = store === 'Flipkart' ? 'https://www.flipkart.com/search' : 'https://www.meesho.com/search';

    for (let i = 1; i <= 3; i++) {
        const price = Math.floor(Math.random() * (priceRange[1] - priceRange[0])) + priceRange[0];
        const productUrl = `${baseUrl}?q=${encodeURIComponent(keywords)}&pid=${Date.now()}${i}`;

        results.push({
            asin: `${store.charAt(0)}${Date.now()}${i}`,
            title: `${store} Special: ${keywords} ${i}`,
            image: `https://loremflickr.com/320/240/${encodeURIComponent(keywords)}?lock=${i}`,
            price: {
                raw: `₹${price}`,
                value: price
            },
            link: productUrl,
            rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1),
            reviewsCount: Math.floor(Math.random() * 5000),
            isMock: true
        });
    }
    return results;
}

module.exports = {
    searchProducts
};
