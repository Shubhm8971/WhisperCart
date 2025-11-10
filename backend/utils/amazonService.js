const config = require('../config');

let client; // Declare client outside to be accessible after initialization

async function initializeAmazonClient() {
    if (client) {
        return; // Already initialized
    }

    // Dynamically import the ES Module
    const { ProductAdvertisingAPIClient } = await import('amazon-paapi');

    const commonParameters = {
        AccessKey: config.amazonAccessKey,
        SecretKey: config.amazonSecretKey,
        PartnerTag: config.amazonPartnerTag,
        PartnerType: 'Associates',
        Marketplace: config.amazonMarketplace,
    };

    client = new ProductAdvertisingAPIClient(commonParameters);
}

async function searchAmazonProducts(keywords) {
    if (!client) {
        await initializeAmazonClient(); // Ensure client is initialized before use
    }

    const searchRequest = {
        Keywords: keywords,
        SearchIndex: 'All',
        ItemPage: 1,
        Resources: [
            'Images.Primary.Large',
            'ItemInfo.Title',
            'Offers.Listings.Price',
            'ItemInfo.ByLineInfo',
            'ItemInfo.Features',
            'ItemInfo.ProductInfo',
            'Offers.Listings.Condition',
            'Offers.Listings.DeliveryInfo.IsFreeShippingEligible',
            'Offers.Listings.IsPrimeEligible',
            'Offers.Listings.IsBuyBoxWinner',
            'Offers.Listings.Availability.Type',
            'Offers.Listings.Availability.Message',
            'Offers.Listings.Promotions',
            'Offers.Listings.SavingBasis',
            'Offers.Listings.ViolatesMAP',
            'ParentASIN',
            'BrowseNodeInfo.BrowseNodes',
            'BrowseNodeInfo.WebsiteSalesRank',
            'CustomerReviews.Count',
            'CustomerReviews.StarRating',
            'EditorialReviews.Content',
            'Images.Variants.Large',
            'ItemInfo.Classifications',
            'ItemInfo.ContentInfo',
            'ItemInfo.ManufactureInfo',
            'ItemInfo.ProductInfo',
            'ItemInfo.TechnicalInfo',
            'ItemInfo.TradeInInfo',
            'Offers.Listings.Collectibles.Condition',
            'Offers.Listings.Refurbished.Condition',
            'Offers.Listings.Used.Condition',
            'Offers.Summaries.HighestPrice',
            'Offers.Summaries.LowestPrice',
            'Offers.Summaries.OfferCount',
            'RentalOffers.Listings.Condition',
            'RentalOffers.Listings.Price',
            'RentalOffers.Listings.Availability.Type',
            'RentalOffers.Listings.Availability.Message',
            'RentalOffers.Listings.DeliveryInfo.IsFreeShippingEligible',
            'RentalOffers.Listings.IsPrimeEligible',
            'Offers.Listings.IsBuyBoxWinner',
            'RentalOffers.Listings.Promotions',
            'Offers.Listings.SavingBasis',
            'Offers.Listings.ViolatesMAP',
            'Variations.Info',
            'Variations.Parent',
            'BrowseNodeInfo.WebsiteSalesRank',
            'CustomerReviews.Count',
            'CustomerReviews.StarRating',
            'EditorialReviews.Content',
            'Images.Variants.Large',
            'ItemInfo.Classifications',
            'ItemInfo.ContentInfo',
            'ItemInfo.ManufactureInfo',
            'ItemInfo.ProductInfo',
            'ItemInfo.TechnicalInfo',
            'ItemInfo.TradeInInfo',
            'Offers.Listings.Collectibles.Condition',
            'Offers.Listings.Refurbished.Condition',
            'Offers.Listings.Used.Condition',
            'Offers.Summaries.HighestPrice',
            'Offers.Summaries.LowestPrice',
            'Offers.Summaries.OfferCount',
            'RentalOffers.Listings.Condition',
            'RentalOffers.Listings.Price',
            'RentalOffers.Listings.Availability.Type',
            'RentalOffers.Listings.Availability.Message',
            'RentalOffers.Listings.DeliveryInfo.IsFreeShippingEligible',
            'RentalOffers.Listings.IsPrimeEligible',
            'Offers.Listings.IsBuyBoxWinner',
            'Offers.Listings.Promotions',
            'Offers.Listings.SavingBasis',
            'Offers.Listings.ViolatesMAP',
            'Variations.Info',
            'Variations.Parent',
        ],
    };

    try {
        const response = await client.searchItems(searchRequest);
        return response.SearchResult.Items || [];
    } catch (error) {
        console.error('Error searching Amazon products:', error);
        if (error.response) {
            console.error('Amazon API Error Response Data:', error.response.data);
        }
        throw new Error('Failed to search Amazon products.');
    }
}

module.exports = {
    initializeAmazonClient,
    searchAmazonProducts,
};
