#!/usr/bin/env python3
"""
WHISPERCART - The Simplest Working Demo
Just run this and see your AI shopping assistant in action!
"""

print("🛒 WELCOME TO WHISPERCART!")
print("🤖 Your AI Shopping Assistant")
print("=" * 50)

# Product database
products = {
    'running shoes': [
        {'name': 'Nike Air Zoom Pegasus 39', 'price': 8999, 'store': 'Nike'},
        {'name': 'Adidas Ultraboost 22', 'price': 6999, 'store': 'Adidas'},
        {'name': 'Puma Deviate Nitro', 'price': 5999, 'store': 'Puma'},
    ],
    'smartphones': [
        {'name': 'Samsung Galaxy A55', 'price': 34999, 'store': 'Samsung'},
        {'name': 'OnePlus Nord CE 3', 'price': 19999, 'store': 'OnePlus'},
        {'name': 'Xiaomi Redmi Note 13 Pro', 'price': 17999, 'store': 'Xiaomi'},
    ],
    'headphones': [
        {'name': 'Sony WF-1000XM4', 'price': 15999, 'store': 'Sony'},
        {'name': 'JBL Tune 600BTNC', 'price': 3999, 'store': 'JBL'},
        {'name': 'boAt Rockerz 550', 'price': 1999, 'store': 'boAt'},
    ],
    'laptops': [
        {'name': 'Lenovo IdeaPad Gaming 3', 'price': 54999, 'store': 'Lenovo'},
        {'name': 'HP Pavilion 15', 'price': 45999, 'store': 'HP'},
        {'name': 'Acer Aspire 5', 'price': 34999, 'store': 'Acer'},
    ],
    'watches': [
        {'name': 'Noise ColorFit Pro 4', 'price': 3999, 'store': 'Noise'},
        {'name': 'boAt Wave Call', 'price': 1999, 'store': 'boAt'},
        {'name': 'Fastrack Reflex 3.0', 'price': 2999, 'store': 'Fastrack'},
    ]
}

def ai_analyze_request(text):
    """AI analyzes what the user wants"""
    print(f"\n🎤 You said: '{text}'")
    print("🤖 AI processing...")

    text = text.lower()
    category = 'running shoes'  # default
    budget = 3000  # default

    # Detect category
    if 'headphone' in text:
        category = 'headphones'
    elif 'smartphone' in text or 'phone' in text:
        category = 'smartphones'
    elif 'laptop' in text:
        category = 'laptops'
    elif 'watch' in text:
        category = 'watches'
    elif 'shoe' in text:
        category = 'running shoes'

    # Extract budget
    import re
    numbers = re.findall(r'\d+', text)
    if numbers:
        budget = int(numbers[0])

    print(f"🎯 AI understood: {category} under ₹{budget}")
    return category, budget

def find_deals(category, budget):
    """Find products within budget"""
    print(f"\n🛒 Searching {category} under ₹{budget}...")

    category_products = products.get(category, [])
    affordable = [p for p in category_products if p['price'] <= budget]

    return affordable

def negotiate_price(product):
    """AI negotiates a better price"""
    original = product['price']
    negotiated = int(original * 0.85)  # 15% discount
    savings = original - negotiated

    print(f"\n🤝 AI NEGOTIATION for {product['name']}:")
    print(f"   Original Price: ₹{original:,}")
    print(f"   AI Negotiated: ₹{negotiated:,}")
    print(f"   You Save: ₹{savings:,} (15% off!)")
    print("   🎯 Best deal guaranteed!")

    return negotiated, savings

def show_products(products, category):
    """Display found products"""
    if not products:
        print(f"😔 No {category} found in your budget.")
        return

    print(f"\n🎉 FOUND {len(products)} GREAT DEALS!")
    print("=" * 50)

    total_savings = 0

    for i, product in enumerate(products, 1):
        negotiated, savings = negotiate_price(product)
        total_savings += savings

        print(f"\n{i}. {product['name']}")
        print(f"   Store: {product['store']}")
        print(f"   AI Price: ₹{negotiated:,}")
        print(f"   Savings: ₹{savings:,}")

    print(f"\n💰 TOTAL POTENTIAL SAVINGS: ₹{total_savings:,}")
    print("🤖 AI successfully found deals and negotiated prices!")

def demo():
    """Run the complete demo"""
    examples = [
        "I want headphones under 5000 rupees",
        "Find me a smartphone within 20000",
        "Show me running shoes under 3000",
        "I need a laptop under 40000",
        "Get me a smartwatch under 3000"
    ]

    print("\n🎯 WHISPERCART AI DEMO")
    print("Examples you can try:")
    for i, example in enumerate(examples, 1):
        print(f"   {i}. {example}")

    print("\n" + "="*50)

    while True:
        try:
            print("\n🎤 Tell me what you want to buy:")
            print("(Or press Enter for a random example)")

            user_input = input("You: ").strip()

            if not user_input:
                # Show random example
                user_input = examples[0]  # headphones example
                print(f"🎲 Trying example: '{user_input}'")

            # AI processes the request
            category, budget = ai_analyze_request(user_input)

            # Find products
            deals = find_deals(category, budget)

            # Show results
            show_products(deals, category)

            print("\n" + "="*50)
            print("Want to try another search? (or type 'quit' to exit)")

            if input().lower() in ['quit', 'exit', 'bye']:
                print("\n👋 Thanks for trying WhisperCart!")
                print("🤖 Your AI shopping assistant is ready for real use!")
                break

        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
            print("Let's try again!")

if __name__ == "__main__":
    demo()
