const dealEngine = require('./utils/dealNegotiationEngine');

async function test() {
  console.log('=== DEAL NEGOTIATION ENGINE TEST ===\n');
  
  const product = {
    id: 'CROCS001',
    title: 'Crocs Unisex Classic Clog',
    price: 2499,
    originalPrice: 3299,
    rating: 4.2,
    reviews: 1500
  };
  
  console.log('Product:', product.title, '@', '₹' + product.price);
  console.log('\n--- GENERATING NEGOTIATION OFFERS ---\n');
  
  const offers = await dealEngine.generateOffers(product);
  
  Object.entries(offers).forEach(([strategy, details]) => {
    console.log(strategy.toUpperCase() + ':');
    console.log('  Offer:', details.offer);
    console.log('  Message:', details.message);
    console.log('  Probability:', details.probability);
    console.log('  Why:', details.whyItWorks);
    console.log();
  });
  
  console.log('\n--- NEGOTIATION MESSAGE ---\n');
  const msg = await dealEngine.generateNegotiationMessage(product, 'moderate');
  console.log('Message to Seller:', msg.body);
  console.log('Follow-up:', msg.followUp);
  
  console.log('\n✅ DEAL NEGOTIATION ENGINE WORKING!');
}

test().catch(e => console.error('Error:', e.message));
