require('dotenv').config();
const rainforestService = require('./utils/rainforestService');

async function testSearchAffiliate() {
    const keywords = "apple watch";
    console.log(`--- Testing Search with Affiliate Links for: "${keywords}" ---`);

    try {
        const results = await rainforestService.searchProducts(keywords);

        results.forEach(item => {
            console.log(`\nStore: ${item.store}`);
            console.log(`Title: ${item.title}`);
            console.log(`Price: ${item.price.raw}`);
            console.log(`Affiliate Link: ${item.link}`);

            // Basic validation
            if (item.store === 'Amazon' && item.link.includes('tag=')) {
                console.log('✅ Amazon tag found');
            } else if (item.store === 'Flipkart' && item.link.includes('affid=')) {
                console.log('✅ Flipkart affid found');
            } else if (item.store === 'Meesho' && item.link.includes('partner=')) {
                console.log('✅ Meesho partner found');
            } else if (item.link === '#' || item.link === 'https://example.com') {
                console.log('ℹ️ Mock link (expected)');
            } else {
                console.log('❌ Affiliate parameter missing');
            }
        });
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testSearchAffiliate();
