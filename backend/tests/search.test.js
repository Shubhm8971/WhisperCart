const request = require('supertest');
const { app } = require('../server');
const amazonService = require('../utils/amazonService');

// Mock amazonService
jest.mock('../utils/amazonService');

describe('Search API with Amazon PA-API', () => {
  const mockAmazonApiResponse = [
    {
      ASIN: 'B07XXXXXXX',
      ItemInfo: {
        Title: { DisplayValue: 'Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops' },
      },
      Images: { Primary: { Large: { URL: 'amazon_url1' } } },
      Offers: { Listings: [{ Price: { DisplayAmount: '₹109.95', Amount: 10995 } }] },
      DetailPageURL: 'amazon_link1',
    },
    {
      ASIN: 'B07YYYYYYY',
      ItemInfo: {
        Title: { DisplayValue: 'Mens Casual Premium Slim Fit T-Shirts' },
      },
      Images: { Primary: { Large: { URL: 'amazon_url2' } } },
      Offers: { Listings: [{ Price: { DisplayAmount: '₹22.30', Amount: 2230 } }] },
      DetailPageURL: 'amazon_link2',
    },
    {
      ASIN: 'B07ZZZZZZZ',
      ItemInfo: {
        Title: { DisplayValue: 'Mens Cotton Jacket' },
      },
      Images: { Primary: { Large: { URL: 'amazon_url3' } } },
      Offers: { Listings: [{ Price: { DisplayAmount: '₹55.99', Amount: 5599 } }] },
      DetailPageURL: 'amazon_link3',
    },
    {
      ASIN: 'B07AAAAAAA',
      ItemInfo: {
        Title: { DisplayValue: 'Mens Casual Slim Fit' },
      },
      Images: { Primary: { Large: { URL: 'amazon_url4' } } },
      Offers: { Listings: [{ Price: { DisplayAmount: '₹15.99', Amount: 1599 } }] },
      DetailPageURL: 'amazon_link4',
    },
  ];

  beforeEach(() => {
    amazonService.searchAmazonProducts.mockClear();
  });

  it('GET /search should return filtered product results based on product name', async () => {
    amazonService.searchAmazonProducts.mockResolvedValue(mockAmazonApiResponse);

    const res = await request(app).get('/search?product=mens casual');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].title).toBe('Mens Casual Premium Slim Fit T-Shirts');
    expect(res.body[1].title).toBe('Mens Casual Slim Fit');
    
    // Check the mapped structure
    expect(res.body[0]).toHaveProperty('asin');
    expect(res.body[0].price).toHaveProperty('raw');
    expect(res.body[0].price).toHaveProperty('value');
    expect(res.body[0].price.raw).toBe('₹22.30');
    expect(amazonService.searchAmazonProducts).toHaveBeenCalledTimes(1);
    expect(amazonService.searchAmazonProducts).toHaveBeenCalledWith('mens casual');
  });

  it('GET /search should filter by budget', async () => {
    amazonService.searchAmazonProducts.mockResolvedValue(mockAmazonApiResponse);

    const res = await request(app).get('/search?product=mens&budget=20');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('Mens Casual Slim Fit');
    expect(amazonService.searchAmazonProducts).toHaveBeenCalledTimes(1);
    expect(amazonService.searchAmazonProducts).toHaveBeenCalledWith('mens');
  });

  it('GET /search should return 400 if product parameter is missing', async () => {
    const res = await request(app).get('/search');
    expect(res.statusCode).toEqual(400);
    expect(amazonService.searchAmazonProducts).not.toHaveBeenCalled();
  });

  it('GET /search should return 500 if the Amazon API call fails', async () => {
    amazonService.searchAmazonProducts.mockRejectedValue(new Error('Amazon API is down'));

    const res = await request(app).get('/search?product=any');
    expect(res.statusCode).toEqual(500);
    expect(res.body.error).toContain('Failed to search Amazon products.');
    expect(amazonService.searchAmazonProducts).toHaveBeenCalledTimes(1);
    expect(amazonService.searchAmazonProducts).toHaveBeenCalledWith('any');
  });

  it('GET /search should return an empty array if no products match', async () => {
    amazonService.searchAmazonProducts.mockResolvedValue([]); // Simulate no results from Amazon
  
    const res = await request(app).get('/search?product=nonexistent');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(0);
    expect(amazonService.searchAmazonProducts).toHaveBeenCalledTimes(1);
    expect(amazonService.searchAmazonProducts).toHaveBeenCalledWith('nonexistent');
  });
});
