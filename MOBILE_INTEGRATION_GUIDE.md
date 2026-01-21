# WhisperCart Mobile Integration Guide

## Deal Negotiation Button Integration

Add this to your mobile app search results screen:

### React Native Example

```javascript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';

export function ProductCard({ product, onNegotiate }) {
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [offers, setOffers] = useState(null);

  const handleNegotiate = async () => {
    try {
      const response = await fetch('http://your-api/negotiate/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: {
            id: product.id,
            title: product.title,
            price: product.price,
            originalPrice: product.originalPrice,
            rating: product.rating,
            reviews: product.reviewCount
          },
          preferredStrategy: 'moderate'
        })
      });

      const data = await response.json();
      setOffers(data.offers);
      setShowNegotiation(true);
    } catch (error) {
      console.error('Negotiation error:', error);
    }
  };

  const renderOfferCard = ({ item: [strategy, details] }) => (
    <TouchableOpacity
      style={styles.offerCard}
      onPress={() => {
        onNegotiate(strategy, details);
        setShowNegotiation(false);
      }}
    >
      <Text style={styles.strategyName}>{strategy}</Text>
      <Text style={styles.offer}>{details.offer}</Text>
      <Text style={styles.message}>{details.message}</Text>
      <Text style={styles.probability}>Success: {details.probability}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.productCard}>
      {/* Product details */}
      <Text style={styles.title}>{product.title}</Text>
      <Text style={styles.price}>₹{product.price}</Text>

      {/* Negotiate Button */}
      <TouchableOpacity
        style={styles.negotiateButton}
        onPress={handleNegotiate}
      >
        <Text style={styles.buttonText}>🤖 Negotiate Price</Text>
      </TouchableOpacity>

      {/* Negotiation Modal */}
      <Modal
        visible={showNegotiation}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNegotiation(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Choose Your Negotiation Strategy</Text>

          {offers && (
            <FlatList
              data={Object.entries(offers)}
              renderItem={renderOfferCard}
              keyExtractor={([strategy]) => strategy}
              scrollEnabled={true}
            />
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowNegotiation(false)}
          >
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = {
  productCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 12,
    elevation: 2
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8
  },
  price: {
    fontSize: 18,
    color: '#2874F0',
    fontWeight: 'bold',
    marginBottom: 12
  },
  negotiateButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingHorizontal: 16
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16
  },
  offerCard: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2874F0'
  },
  strategyName: {
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'capitalize',
    marginBottom: 4
  },
  offer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 4
  },
  message: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  probability: {
    fontSize: 11,
    color: '#2874F0',
    fontWeight: 'bold'
  },
  closeButton: {
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16
  }
};
```

### Next Steps After User Selects Strategy

```javascript
const handleStrategySelected = async (strategy, details) => {
  // 1. Generate message
  const msgResponse = await fetch('http://your-api/negotiate/message', {
    method: 'POST',
    body: JSON.stringify({
      product,
      strategy
    })
  });

  const msgData = await msgResponse.json();

  // 2. Show message to user with copy button
  Alert.alert('Message Ready', msgData.message.body, [
    {
      text: 'Copy Message',
      onPress: () => {
        Clipboard.setString(msgData.message.body);
        Alert.alert('Copied!', 'Message copied to clipboard');
      }
    },
    {
      text: 'Go to Seller Chat',
      onPress: () => {
        // Open seller chat app (Flipkart, WhatsApp, etc)
        Linking.openURL(getSellerChatUrl(product));
      }
    }
  ]);

  // 3. Track the negotiation
  await fetch('http://your-api/negotiate/submit', {
    method: 'POST',
    body: JSON.stringify({
      productId: product.id,
      strategy,
      outcome: 'sent'
    })
  });
};
```

---

## UI Components You Need

### 1. Negotiate Button (Next to Price)
```
┌─────────────────────────────┐
│ Crocs Classic Clog          │
│ ₹2,499 ⭐4.2 (1,500 reviews)  │
│                             │
│ [Buy Now]  [🤖 Negotiate]   │
└─────────────────────────────┘
```

### 2. Negotiation Modal (Bottom Sheet)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Choose Your Strategy
━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─ AGGRESSIVE ─────────────────┐
│ Can you do ₹1,899?           │
│ Success: 40%                 │
│ "Direct offer shows intent"  │
└──────────────────────────────┘

┌─ MODERATE ───────────────────┐
│ Is ₹2,149 possible?          │
│ Success: 70% (RECOMMENDED)   │
│ "Reasonable & researched"    │
└──────────────────────────────┘

┌─ FRIENDLY ───────────────────┐
│ What's your best price?      │
│ Success: 81%                 │
│ "Opens dialogue"             │
└──────────────────────────────┘
```

### 3. Message Copy Screen
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Message Ready to Send
━━━━━━━━━━━━━━━━━━━━━━━━━━━

"This looks good! Would you be 
 able to offer this at ₹2,149? 
 I'm ready to purchase."

[Copy Message]  [Go to Chat]
```

---

## Success Flow Tracking

After user reports success, update negotiation stats:

```javascript
const reportNegotiationSuccess = async (productId, originalPrice, negotiatedPrice) => {
  const discount = originalPrice - negotiatedPrice;
  
  await fetch('http://your-api/negotiate/submit', {
    method: 'POST',
    body: JSON.stringify({
      productId,
      strategy: selectedStrategy,
      outcome: 'success',
      originalPrice,
      negotiatedPrice,
      discount
    })
  });

  // Show celebration
  showVictoryAnimation();
  showNotification(`Saved ₹${discount}! 🎉`);
};
```

---

## API Calls Summary

1. **Generate Offers** (When user clicks Negotiate)
   - POST `/negotiate/generate`
   - Response: 5 strategies with offers

2. **Generate Message** (When user picks strategy)
   - POST `/negotiate/message`
   - Response: Ready-to-send message

3. **Submit Attempt** (When user sends message)
   - POST `/negotiate/submit`
   - Tracks it as "sent"

4. **Track Success** (When user confirms deal)
   - POST `/negotiate/submit`
   - Updates with outcome: "success"

---

## Estimated Implementation Time

- **UI Components**: 2-3 hours
- **API Integration**: 1 hour
- **Testing**: 1 hour
- **Total**: 4-5 hours

---

## Expected Impact

Users who use negotiation feature:
- **Buy more products** (confidence from getting deals)
- **Higher AOV** (Order value increases)
- **Share app** (Feature is conversation-worthy)
- **Leave reviews** (Positive, 5-star reviews)

**Viral potential**: 🔥🔥🔥

---

This feature will make your app stand out and drive word-of-mouth growth!
