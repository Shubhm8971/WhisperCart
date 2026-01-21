export default async function search(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { q: query, budget, maxPrice } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    console.log(`[Search] Query: ${query}, Budget: ${budget}`);

    // Return mock results for now (Vercel doesn't have backend module deps easily)
    const mockResults = [
      {
        asin: 'mock-1',
        title: `${query} - Premium Model`,
        image: 'https://via.placeholder.com/300',
        price: { raw: `₹${Math.min(parseInt(budget || 50000), 49999)}`, value: Math.min(parseInt(budget || 50000), 49999) },
        rating: 4.5,
        reviewsCount: 234,
        store: 'Amazon',
        link: 'https://amazon.in/s?k=' + encodeURIComponent(query)
      },
      {
        asin: 'mock-2',
        title: `${query} - Budget Friendly`,
        image: 'https://via.placeholder.com/300',
        price: { raw: `₹${Math.max(parseInt(budget || 5000) * 0.7, 1999)}`, value: Math.max(parseInt(budget || 5000) * 0.7, 1999) },
        rating: 4.2,
        reviewsCount: 156,
        store: 'Flipkart',
        link: 'https://flipkart.com/search?q=' + encodeURIComponent(query)
      },
      {
        asin: 'mock-3',
        title: `${query} - Value Pack`,
        image: 'https://via.placeholder.com/300',
        price: { raw: `₹${Math.max(parseInt(budget || 5000) * 0.6, 999)}`, value: Math.max(parseInt(budget || 5000) * 0.6, 999) },
        rating: 4.0,
        reviewsCount: 89,
        store: 'Meesho',
        link: 'https://meesho.com/search?q=' + encodeURIComponent(query)
      }
    ];

    res.json({ 
      success: true, 
      source: 'Mock Data',
      count: mockResults.length,
      products: mockResults 
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
}
