const express = require('express');
const router = express.Router();
const amazonService = require('../utils/amazonService'); // Import the new Amazon service

router.get('/', async (req, res) => {
  const { product, budget, features } = req.query;

  if (!product) {
    return res.status(400).json({ error: 'Query parameter "product" is required.' });
  }

  try {
    await amazonService.initializeAmazonClient(); // Initialize the Amazon client

    // Use the Amazon service to search for products
    const amazonItems = await amazonService.searchAmazonProducts(product);

    // Map the Amazon results to the format the frontend expects
    let results = amazonItems.map(item => {
      const priceListing = item.Offers && item.Offers.Listings && item.Offers.Listings.length > 0
        ? item.Offers.Listings[0].Price
        : null;

      return {
        asin: item.ASIN,
        title: item.ItemInfo.Title.DisplayValue,
        image: item.Images && item.Images.Primary && item.Images.Primary.Large
          ? item.Images.Primary.Large.URL
          : null,
        price: priceListing ? {
          raw: priceListing.DisplayAmount,
          value: priceListing.Amount / 100, // Amazon returns price in cents
        } : null,
        link: item.DetailPageURL,
        // Include features and description for more robust filtering
        itemFeatures: item.ItemInfo.Features && item.ItemInfo.Features.DisplayValues
          ? item.ItemInfo.Features.DisplayValues
          : [],
        editorialReview: item.EditorialReviews && item.EditorialReviews.Content
          ? item.EditorialReviews.Content
          : '',
      };
    }).filter(item => {
      // Basic filtering for items that have a price and title
      return item.title && item.price && item.price.value;
    });

    // Apply keyword filtering on the results (since Amazon API might return broader results)
    const searchTerms = product.toLowerCase().split(' ');
    results = results.filter(p => {
      const title = p.title.toLowerCase();
      return searchTerms.every(term => title.includes(term));
    });

    // Simulate budget filtering (can be refined with Amazon's API if needed)
    let filteredResults = results;
    if (budget) {
      const numericBudget = parseFloat(budget);
      if (!isNaN(numericBudget)) {
        filteredResults = filteredResults.filter(p => p.price.value <= numericBudget);
      }
    }

    // Apply feature filtering
    if (features && features.length > 0) {
      const featureTerms = features.toLowerCase().split(',').map(f => f.trim()).filter(f => f.length > 0);
      if (featureTerms.length > 0) {
        filteredResults = filteredResults.filter(p => {
          const searchableText = (p.title + ' ' + p.itemFeatures.join(' ') + ' ' + p.editorialReview).toLowerCase();
          return featureTerms.every(term => searchableText.includes(term));
        });
      }
    }

    console.log('Amazon Search Results:', filteredResults.length, 'products');
    res.json(filteredResults);

  } catch (error) {
    console.error('Error searching Amazon products:', error);
    res.status(500).json({ error: 'Failed to search Amazon products.', details: error.message });
  }
});

module.exports = router;

