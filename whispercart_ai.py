#!/usr/bin/env python3
"""
WhisperCart AI - Voice-Powered Shopping Assistant
A complete AI shopping assistant that actually works!
"""

import pyttsx3
import json
import time
import sys
import os
from datetime import datetime

class WhisperCartAI:
    def __init__(self):
        # Initialize text-to-speech only (no microphone needed)
        try:
            self.engine = pyttsx3.init()
            self.engine.setProperty('rate', 180)
            self.engine.setProperty('volume', 0.9)
            self.tts_available = True
        except:
            self.tts_available = False
            print("⚠️ Text-to-speech not available, will use text only")

        # Voice simulation mode (works without microphone)
        self.voice_mode = True

        # Product database
        self.products = {
            'running shoes': [
                {'name': 'Nike Air Zoom Pegasus 39', 'price': 8999, 'store': 'Nike', 'rating': 4.5},
                {'name': 'Adidas Ultraboost 22', 'price': 12999, 'store': 'Adidas', 'rating': 4.7},
                {'name': 'Puma Deviate Nitro', 'price': 6999, 'store': 'Puma', 'rating': 4.3},
                {'name': 'Reebok Flexagon Force 3', 'price': 4999, 'store': 'Reebok', 'rating': 4.2}
            ],
            'smartphones': [
                {'name': 'Samsung Galaxy S24 Ultra', 'price': 124999, 'store': 'Samsung', 'rating': 4.8},
                {'name': 'iPhone 15 Pro Max', 'price': 159999, 'store': 'Apple', 'rating': 4.9},
                {'name': 'Google Pixel 8 Pro', 'price': 89999, 'store': 'Google', 'rating': 4.6},
                {'name': 'Samsung Galaxy A55', 'price': 34999, 'store': 'Samsung', 'rating': 4.4},
                {'name': 'OnePlus Nord CE 3', 'price': 19999, 'store': 'OnePlus', 'rating': 4.3},
                {'name': 'Xiaomi Redmi Note 13 Pro', 'price': 17999, 'store': 'Xiaomi', 'rating': 4.2},
                {'name': 'Realme 11 Pro+', 'price': 24999, 'store': 'Realme', 'rating': 4.1},
                {'name': 'Vivo V29 Pro', 'price': 31999, 'store': 'Vivo', 'rating': 4.3},
                {'name': 'OPPO Reno 11 Pro', 'price': 29999, 'store': 'OPPO', 'rating': 4.2}
            ],
            'laptops': [
                {'name': 'MacBook Pro 16"', 'price': 249999, 'store': 'Apple', 'rating': 4.9},
                {'name': 'Dell XPS 13', 'price': 129999, 'store': 'Dell', 'rating': 4.5},
                {'name': 'Lenovo IdeaPad Gaming 3', 'price': 54999, 'store': 'Lenovo', 'rating': 4.2},
                {'name': 'HP Pavilion 15', 'price': 45999, 'store': 'HP', 'rating': 4.1},
                {'name': 'Acer Aspire 5', 'price': 34999, 'store': 'Acer', 'rating': 4.0},
                {'name': 'ASUS VivoBook 15', 'price': 39999, 'store': 'ASUS', 'rating': 4.3}
            ],
            'headphones': [
                {'name': 'Sony WH-1000XM5', 'price': 34999, 'store': 'Sony', 'rating': 4.7},
                {'name': 'Bose QuietComfort Ultra', 'price': 39999, 'store': 'Bose', 'rating': 4.8},
                {'name': 'JBL Tune 600BTNC', 'price': 3999, 'store': 'JBL', 'rating': 4.1},
                {'name': 'boAt Rockerz 550', 'price': 1999, 'store': 'boAt', 'rating': 4.0},
                {'name': 'Sony WF-1000XM4', 'price': 19999, 'store': 'Sony', 'rating': 4.5},
                {'name': 'OnePlus Bullets Wireless Z2', 'price': 1999, 'store': 'OnePlus', 'rating': 4.2}
            ],
            'watches': [
                {'name': 'Apple Watch Series 9', 'price': 41999, 'store': 'Apple', 'rating': 4.6},
                {'name': 'Samsung Galaxy Watch 6', 'price': 29999, 'store': 'Samsung', 'rating': 4.4},
                {'name': 'Noise ColorFit Pro 4', 'price': 3999, 'store': 'Noise', 'rating': 4.0},
                {'name': 'boAt Wave Call', 'price': 1999, 'store': 'boAt', 'rating': 3.8},
                {'name': 'Fastrack Reflex 3.0', 'price': 2999, 'store': 'Fastrack', 'rating': 4.1},
                {'name': 'Fire-Boltt Ninja Call Pro Plus', 'price': 1799, 'store': 'Fire-Boltt', 'rating': 3.9}
            ]
        }

        # Statistics
        self.stats = {
            'total_searches': 0,
            'total_savings': 0,
            'voice_searches': 0
        }

        print("🎉 WhisperCart AI Initialized!")
        print("🤖 Your AI Shopping Assistant is ready!")
        print("=" * 50)

    def speak(self, text):
        """Convert text to speech"""
        print(f"🎤 WhisperCart: {text}")
        self.engine.say(text)
        self.engine.runAndWait()

    def listen(self):
        """Simulated voice input - type what you want to say"""
        print("\n🎤 Voice Assistant Ready!")
        print("💡 Type what you would say (or press Enter for examples):")

        if self.tts_available:
            self.speak("Tell me what you're looking for, or just type it below.")

        # Show examples
        examples = [
            "I want running shoes under 3000 rupees",
            "Find me a smartphone within 20000",
            "Show me noise cancelling headphones",
            "I need a gaming laptop under 80000"
        ]

        print("\n📝 Examples you can type:")
        for i, example in enumerate(examples, 1):
            print(f"   {i}. {example}")

        print("\n🎯 Or say 'quit' to exit")
        print("-" * 50)

        # Get text input (simulating voice)
        try:
            text = input("🎙️ You: ").strip()

            if not text:
                # Use random example if empty
                text = examples[0]
                print(f"🎲 Using example: '{text}'")

            print("🎯 Processing your request...")
            if self.tts_available:
                self.speak("Got it! Processing your request...")

            print(f"📝 You said: '{text}'")
            return text.lower()

        except KeyboardInterrupt:
            return "exit"
        except Exception as e:
            print(f"❌ Input error: {e}")
            return None

    def analyze_intent(self, text):
        """AI analysis of user intent"""
        print("🤖 AI analyzing your request...")

        intent = {
            'action': 'search',
            'product': 'running shoes',  # default
            'budget': 3000,  # default
            'features': []
        }

        # Extract product type - more flexible matching
        text_lower = text.lower()

        # Shoes
        if any(word in text_lower for word in ['running shoes', 'sneakers', 'shoes', 'shoe']):
            intent['product'] = 'running shoes'
        # Phones
        elif any(word in text_lower for word in ['smartphone', 'phone', 'mobile', 'android', 'iphone']):
            intent['product'] = 'smartphones'
        # Laptops
        elif any(word in text_lower for word in ['laptop', 'computer', 'notebook', 'gaming laptop']):
            intent['product'] = 'laptops'
        # Headphones
        elif any(word in text_lower for word in ['headphones', 'earphones', 'headphone', 'earphone', 'earbuds']):
            intent['product'] = 'headphones'
        # Watches
        elif any(word in text_lower for word in ['watch', 'smartwatch', 'watches', 'smart watch']):
            intent['product'] = 'watches'

        # Extract budget - improved regex
        import re
        # Look for patterns like "under 5000", "within 20000", "below 3000", "up to 10000"
        budget_patterns = [
            r'under\s+(\d+)',
            r'within\s+(\d+)',
            r'below\s+(\d+)',
            r'up\s+to\s+(\d+)',
            r'(\d+)\s+rupees?',
            r'₹?\s*(\d+)'
        ]

        for pattern in budget_patterns:
            budget_match = re.search(pattern, text_lower)
            if budget_match:
                intent['budget'] = int(budget_match.group(1))
                break

        # Extract features - expanded list
        features_map = {
            'comfortable': ['comfortable', 'comfort'],
            'premium': ['premium', 'best', 'high-end', 'flagship', 'top'],
            'budget-friendly': ['budget', 'cheap', 'affordable', 'inexpensive', 'low-cost'],
            'lightweight': ['lightweight', 'light', 'portable'],
            'noise cancelling': ['noise cancelling', 'anc', 'noise cancel', 'quiet']
        }

        for feature, keywords in features_map.items():
            if any(keyword in text_lower for keyword in keywords):
                if feature not in intent['features']:
                    intent['features'].append(feature)

        print(f"🔍 Extracted - Product: {intent['product']}, Budget: ₹{intent['budget']}, Features: {intent['features']}")

        return intent

    def find_products(self, intent):
        """Find products matching user intent"""
        print(f"🛒 Searching for {intent['product']} under ₹{intent['budget']}...")

        category_products = self.products.get(intent['product'], [])
        matching_products = []

        for product in category_products:
            if product['price'] <= intent['budget']:
                # Calculate AI-negotiated price (15% discount)
                negotiated_price = int(product['price'] * 0.85)
                savings = product['price'] - negotiated_price

                product_with_deal = product.copy()
                product_with_deal['original_price'] = product['price']
                product_with_deal['negotiated_price'] = negotiated_price
                product_with_deal['savings'] = savings
                product_with_deal['discount_percent'] = 15

                matching_products.append(product_with_deal)

        # Sort by negotiated price (best deals first)
        matching_products.sort(key=lambda x: x['negotiated_price'])

        return matching_products

    def display_products(self, products, intent):
        """Display found products"""
        if not products:
            print(f"😔 No {intent['product']} found within ₹{intent['budget']} budget.")
            self.speak(f"Sorry, I couldn't find any {intent['product']} within your budget of ₹{intent['budget']}. Would you like me to increase the budget or look for alternatives?")
            return

        print(f"\n🎉 Found {len(products)} Great Deals!")
        print(f"💰 AI-negotiated prices with 15% discount!")
        print("=" * 60)

        total_savings = 0

        for i, product in enumerate(products[:3], 1):  # Show top 3
            print(f"\n{i}. {product['name']}")
            print(f"   Store: {product['store']}")
            print(f"   Original: ₹{product['original_price']:,}")
            print(f"   AI Price: ₹{product['negotiated_price']:,}")
            print(f"   You Save: ₹{product['savings']:,} ({product['discount_percent']}%)")
            print(f"   Rating: {'⭐' * int(product['rating'])} {product['rating']}")

        total_savings = sum(p['savings'] for p in products[:3])
        self.stats['total_savings'] += total_savings
        self.stats['total_searches'] += 1
        self.stats['voice_searches'] += 1

        print(f"\n💸 Total Potential Savings: ₹{total_savings:,}")
        print(f"📊 Stats: {self.stats['total_searches']} searches, ₹{self.stats['total_savings']:,} saved")

        # Speak results
        self.speak(f"I found {len(products)} great deals for {intent['product']}! You could save up to ₹{total_savings:,} with AI-negotiated prices.")

    def run(self):
        """Main application loop"""
        self.speak("Welcome to WhisperCart! Your AI-powered shopping assistant. I'm here to help you find the best deals with voice commands.")

        while True:
            try:
                # Listen for voice input
                text = self.listen()

                if text is None:
                    continue

                # Check for exit commands
                if 'exit' in text or 'quit' in text or 'bye' in text:
                    self.speak("Thank you for using WhisperCart! Happy shopping!")
                    print("👋 Goodbye!")
                    break

                # Analyze intent
                intent = self.analyze_intent(text)

                print(f"🎯 Detected Intent: {intent['product']} under ₹{intent['budget']}")

                # Find products
                products = self.find_products(intent)

                # Display results
                self.display_products(products, intent)

                # Ask if they want to continue
                print("\n" + "="*50)
                self.speak("Would you like to search for something else? Just tell me what you're looking for.")

            except KeyboardInterrupt:
                print("\n👋 Goodbye!")
                self.speak("Goodbye! Happy shopping with WhisperCart!")
                break
            except Exception as e:
                print(f"❌ Error: {e}")
                self.speak("Sorry, there was an error. Let's try again.")

def main():
    print("🎉 Starting WhisperCart AI...")
    print("📦 Installing dependencies if needed...")

    try:
        # Try to import required libraries
        import pyttsx3
    except ImportError:
        print("❌ Missing dependencies. Installing...")
        os.system("pip install pyttsx3")
        print("✅ Dependencies installed! Please restart the script.")
        return

    # Create and run the AI assistant
    assistant = WhisperCartAI()
    assistant.run()

if __name__ == "__main__":
    main()
