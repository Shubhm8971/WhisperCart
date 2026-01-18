const config = require('../config');

/**
 * Appends affiliate tags to URLs based on the store.
 */
function wrapAffiliateLink(url, store) {
    if (!url || url === '#' || url === 'https://example.com') {
        // For mocks or missing links, keep as is or return a demo link
        return url;
    }

    try {
        const urlObj = new URL(url);

        switch (store.toLowerCase()) {
            case 'amazon':
                // Amazon Associates Tag
                const tag = config.amazonPartnerTag || 'whispercart-20';
                urlObj.searchParams.set('tag', tag);
                break;

            case 'flipkart':
                // Flipkart Affiliate ID
                const flipkartAffid = config.flipkartAffiliateId || 'whisper01'; // Default to mock if not set
                urlObj.searchParams.set('affid', flipkartAffid);
                break;

            case 'meesho':
                // Meesho Partner ID
                const meeshoPartner = config.meeshoAffiliateId || 'wc_meesho'; // Default to mock if not set
                urlObj.searchParams.set('partner', meeshoPartner);
                break;
        }

        return urlObj.toString();
    } catch (e) {
        console.warn(`Failed to wrap link for ${store}:`, e.message);
        return url;
    }
}

module.exports = {
    wrapAffiliateLink
};
