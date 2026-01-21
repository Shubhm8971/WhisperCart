import nltk
nltk.download('punkt')

from nltk.tokenize import TreebankWordTokenizer
from nltk.tokenize.punkt import PunktParameters, PunktSentenceTokenizer
from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import sqlite3
import json
from rapidfuzz import fuzz

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# =========================
# Database Configuration
# =========================
DATABASE_PATH = 'whispercart.db'

def init_database():
    """Initialize the database and create tables if they don't exist."""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS queries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            raw_text TEXT NOT NULL,
            extracted_json TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def save_query(raw_text, extracted_json):
    """Save a query and its extracted JSON to the database."""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO queries (raw_text, extracted_json)
        VALUES (?, ?)
    ''', (raw_text, json.dumps(extracted_json)))
    
    conn.commit()
    conn.close()

def get_recent_queries(limit=10):
    """Get the most recent queries from the database."""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, raw_text, extracted_json, created_at
        FROM queries
        ORDER BY created_at DESC
        LIMIT ?
    ''', (limit,))
    
    rows = cursor.fetchall()
    conn.close()
    
    queries = []
    for row in rows:
        queries.append({
            'id': row[0],
            'raw_text': row[1],
            'extracted_json': json.loads(row[2]),
            'created_at': row[3]
        })
    
    return queries

# =========================
# Keywords (extend as needed)
# =========================
PRODUCT_KEYWORDS = [
    # Compound product names (longer first to get priority)
    "sony xperia phone", "sony tv", "sony television", "gaming laptop", "macbook pro", "iphone pro", "samsung galaxy", "nike air max", "adidas ultraboost",
    "wireless headphones", "bluetooth speaker", "smart watch", "gaming mouse", "mechanical keyboard", "wireless charger", "power bank", "usb cable",
    "laptop bag", "backpack", "handbag", "purse", "wallet", "belt", "sunglasses", "reading glasses",
    "running shoes", "basketball shoes", "dress shoes", "sandals", "boots", "sneakers", "flip flops", "high heels",
    "t-shirt", "polo shirt", "dress shirt", "hoodie", "sweater", "jacket", "coat", "blazer", "suit", "dress", "skirt", "pants", "jeans", "shorts",
    "smartphone", "tablet", "laptop", "desktop", "monitor", "keyboard", "mouse", "webcam", "microphone", "headphones", "earbuds", "speaker",
    "tv", "television", "smart tv", "projector", "soundbar", "home theater", "camera", "dslr", "action camera", "drone",
    "refrigerator", "microwave", "oven", "dishwasher", "washing machine", "dryer", "vacuum cleaner", "air purifier", "fan", "heater",
    "bed", "mattress", "pillow", "blanket", "sofa", "chair", "table", "desk", "lamp", "mirror", "curtains", "rug",
    "car", "bicycle", "motorcycle", "scooter", "helmet", "tire", "battery", "oil", "gas", "insurance",
    "book", "magazine", "newspaper", "notebook", "pen", "pencil", "marker", "highlighter", "eraser", "stapler",
    "toy", "game", "puzzle", "doll", "action figure", "board game", "video game", "console", "controller",
    "medicine", "vitamin", "supplement", "bandage", "thermometer", "scale", "toothbrush", "toothpaste", "shampoo", "soap",
    "food", "snack", "drink", "coffee", "tea", "water", "juice", "soda", "beer", "wine", "chocolate", "candy",
    "flower", "plant", "seed", "pot", "soil", "fertilizer", "garden tool", "lawn mower", "hose", "sprinkler",
    "tool", "hammer", "screwdriver", "wrench", "drill", "saw", "level", "tape measure", "ladder", "rope",
    "jewelry", "ring", "necklace", "bracelet", "earrings", "watch", "chain", "pendant", "brooch", "cufflinks"
]
BRAND_KEYWORDS = [
    # Tech brands
    "apple", "samsung", "sony", "sony xperia", "google", "microsoft", "dell", "hp", "lenovo", "asus", "acer", "lg", "huawei", "xiaomi", "oneplus", "nokia", "motorola",
    # Audio brands
    "jbl", "bose", "sony", "sennheiser", "audio-technica", "beats", "skullcandy", "jabra", "plantronics", "logitech",
    # Fashion brands
    "nike", "adidas", "puma", "reebok", "converse", "vans", "new balance", "under armour", "lululemon", "zara", "h&m", "uniqlo", "gap", "levi's", "calvin klein", "tommy hilfiger",
    # Luxury brands
    "gucci", "louis vuitton", "chanel", "prada", "versace", "armani", "dior", "hermes", "burberry", "ralph lauren",
    # Home & furniture
    "ikea", "wayfair", "west elm", "crate & barrel", "pottery barn", "target", "walmart", "home depot", "lowes",
    # Automotive
    "toyota", "honda", "ford", "bmw", "mercedes", "audi", "volkswagen", "nissan", "hyundai", "kia", "tesla",
    # Sports & outdoor
    "patagonia", "north face", "columbia", "timberland", "merrell", "keen", "salomon", "arc'teryx", "marmot",
    # Beauty & personal care
    "l'oreal", "maybelline", "revlon", "covergirl", "neutrogena", "olay", "dove", "pantene", "head & shoulders",
    # Food & beverage
    "coca-cola", "pepsi", "starbucks", "dunkin", "mcdonald's", "kfc", "subway", "domino's", "pizza hut"
]

# Root/base colors
ROOT_COLORS = [
    "black", "white", "red", "blue", "green", "yellow", "pink", "gray"
]

# Shade → root color mapping (auto-extends COLOR_KEYWORDS)
SHADE_TO_ROOT = {
    "navy blue": "blue", "light blue": "blue", "sky blue": "blue", "dark blue": "blue",
    "forest green": "green", "lime green": "green", "dark green": "green", "light green": "green",
    "dark red": "red", "maroon": "red", "crimson": "red",
    "off white": "white", "cream": "white",
    "light gray": "gray", "dark gray": "gray", "grey": "gray",
    "hot pink": "pink", "light pink": "pink", "dark pink": "pink",
    "mustard yellow": "yellow", "golden yellow": "yellow"
}

# Auto-extend COLOR_KEYWORDS with roots + all shades
COLOR_KEYWORDS = sorted(set(ROOT_COLORS + list(SHADE_TO_ROOT.keys())))

# =========================
# Config
# =========================
FUZZY_THRESHOLD               = 70  # Lowered for better matching
BRAND_PROXIMITY               = 3
COLOR_PROXIMITY               = 3
QUANTITY_PROXIMITY            = 3
BUDGET_PROXIMITY              = 5

FUZZY_PRODUCT_MERGE_WINDOW    = 6
FUZZY_PRODUCT_MERGE_THRESHOLD = 85   # stricter than before

# =========================
# Tokenizers
# =========================
punkt_param = PunktParameters()
sentence_splitter = PunktSentenceTokenizer(punkt_param)
word_tokenizer = TreebankWordTokenizer()

def my_word_tokenize(text):
    sentences = sentence_splitter.tokenize(text)
    tokens = []
    for sent in sentences:
        tokens.extend(word_tokenizer.tokenize(sent))
    return tokens

def parse_budget_value(budget_str):
    val = budget_str.lstrip("₹$").replace(',', '')
    try:
        val = int(val)
    except:
        return None
    return val if val > 10 else None

def normalize_product_name(prod):
    prod = prod.lower()
    if prod.endswith('s') and prod[:-1] in PRODUCT_KEYWORDS:
        return prod[:-1]
    return prod

def normalize_brand_name(brand):
    return brand.lower()

def normalize_color_name(color):
    color = color.lower().strip()
    # British spelling → American
    color = color.replace("colour", "color")
    # If "color"/"colour" appears as suffix → remove it
    if color.endswith(" color"):
        color = color.rsplit(" color", 1)[0].strip()
    # Map shades → root (including grey → gray)
    color = SHADE_TO_ROOT.get(color, color)
    return color

def find_matches_multiword(tokens, phrases, type_):
    matches = []
    n = len(tokens)
    for phrase in phrases:
        phrase_tokens = phrase.lower().split()
        length = len(phrase_tokens)
        for i in range(n - length + 1):
            window = tokens[i:i+length]
            window_str = " ".join([t.lower() for t in window])
            score = fuzz.ratio(window_str, phrase.lower())
            if score >= FUZZY_THRESHOLD:
                matches.append({
                    "term": " ".join(window),
                    "matched_with": phrase,
                    "start_pos": i,
                    "end_pos": i + length - 1,
                    "score": score,
                    "type": type_,
                })
    return matches

def dedupe_matches_by_window(matches):
    best = {}
    for m in matches:
        key = (m["start_pos"], m["end_pos"], m["type"])
        prev = best.get(key)
        def choice_tuple(x):
            exact = 1 if x["term"].lower() == x["matched_with"].lower() else 0
            length = len(x["matched_with"])
            return (exact, length, x["score"])
        if prev is None or choice_tuple(m) > choice_tuple(prev):
            best[key] = m
    return list(best.values())

def closest_indices_within_threshold(pos, positions, threshold):
    """Return all indices whose distance equals the minimal distance and is within threshold."""
    if not positions:
        return []
    dists = [abs(pos - p) for p in positions]
    min_d = min(dists)
    if min_d > threshold:
        return []
    return [i for i, d in enumerate(dists) if d == min_d]

def longest_name(names):
    if not names:
        return ""
    def key_fn(s):
        return (len(s.split()), len(s))
    return sorted(set(names), key=key_fn, reverse=True)[0]

# ✅ Product merge: fuzzy + positional; allow simple plural collapse
def should_merge_products(name_a, name_b, min_pos_dist):
    if min_pos_dist > FUZZY_PRODUCT_MERGE_WINDOW:
        return False
    a, b = name_a.lower(), name_b.lower()
    sim = fuzz.ratio(a, b)
    if sim >= FUZZY_PRODUCT_MERGE_THRESHOLD:
        return True
    if a.rstrip("s") == b.rstrip("s"):
        return True
    return False

def spans_equal(m1, m2):
    return m1["start_pos"] == m2["start_pos"] and m1["end_pos"] == m2["end_pos"]

def filter_brand_overlaps_with_products(brand_matches, product_matches):
    """Drop any brand match that exactly overlaps a product match with identical text (e.g., 'Sony Xperia')."""
    filtered = []
    for b in brand_matches:
        drop = False
        for p in product_matches:
            if spans_equal(b, p) and b["matched_with"].lower() == p["matched_with"].lower():
                drop = True
                break
        if not drop:
            filtered.append(b)
    return filtered

def remove_overlapping_matches(matches):
    """Remove overlapping matches, keeping the longest/best match for each overlap."""
    if not matches:
        return []
    
    # Sort by start position, then by length (descending), then by score (descending)
    matches = sorted(matches, key=lambda m: (m["start_pos"], -len(m["matched_with"]), -m["score"]))
    
    filtered = []
    for match in matches:
        # Check if this match overlaps with any already accepted match
        overlaps = False
        for accepted in filtered:
            # Check for overlap: one starts before the other ends
            if (match["start_pos"] <= accepted["end_pos"] and 
                match["end_pos"] >= accepted["start_pos"]):
                overlaps = True
                break
        
        if not overlaps:
            filtered.append(match)
    
    return filtered

@app.route("/extract", methods=["POST"])
def extract():
    text = request.json.get("text", "")
    tokens = my_word_tokenize(text)

    product_matches = find_matches_multiword(tokens, PRODUCT_KEYWORDS, "product")
    product_matches = remove_overlapping_matches(product_matches)
    product_matches = dedupe_matches_by_window(product_matches)
    
    brand_matches   = dedupe_matches_by_window(find_matches_multiword(tokens, BRAND_KEYWORDS,   "brand"))
    color_matches   = dedupe_matches_by_window(find_matches_multiword(tokens, COLOR_KEYWORDS,   "color"))

    # 🔒 Prevent "Sony Xperia" (brand) when "Sony Xperia" is already a product at same span
    brand_matches = filter_brand_overlaps_with_products(brand_matches, product_matches)

    quantity_matches, budget_matches = [], []
    for i, tok in enumerate(tokens):
        budget_val = parse_budget_value(tok)
        if budget_val is not None:
            budget_matches.append({
                "term": tok, "start_pos": i, "end_pos": i,
                "score": 100.0, "type": "budget", "matched_with": tok
            })
        elif re.fullmatch(r"\d+", tok):
            val = int(tok)
            if val <= 100:
                quantity_matches.append({
                    "term": tok, "start_pos": i, "end_pos": i,
                    "score": 100.0, "type": "quantity", "matched_with": tok
                })

    if not product_matches:
        response_data = {"products": [], "total_products": 0}
        # Save to database
        save_query(text, response_data)
        return jsonify(response_data)

    product_matches = sorted(product_matches, key=lambda m: m["start_pos"])
    product_positions = [m["start_pos"] for m in product_matches]

    products_output = []
    for pm in product_matches:
        norm = normalize_product_name(pm["matched_with"])
        products_output.append({
            "product": norm,
            "aliases": [norm],
            "aliases_raw": [pm["term"]],
            "quantities": [],
            "brands": [], "brands_raw": [],
            "colors": [], "colors_raw": [],
            "budgets": [],
            "match_logs": [pm],
            "positions": [pm["start_pos"]]
        })

    # -------------------------
    # Attach colors (equidistant attach supported)
    # -------------------------
    for c in color_matches:
        idxs = closest_indices_within_threshold(c["start_pos"], product_positions, COLOR_PROXIMITY)
        if not idxs:
            continue
        color_norm = normalize_color_name(c["matched_with"])
        for idx in idxs:
            if color_norm not in products_output[idx]["colors"]:
                products_output[idx]["colors"].append(color_norm)
            if c["term"] not in products_output[idx]["colors_raw"]:
                products_output[idx]["colors_raw"].append(c["term"])
            products_output[idx]["match_logs"].append(c)

    # -------------------------
    # Attach brands/quantities/budgets (equidistant attach supported)
    # -------------------------
    for b in brand_matches:
        idxs = closest_indices_within_threshold(b["start_pos"], product_positions, BRAND_PROXIMITY)
        if not idxs:
            continue
        brand_norm = normalize_brand_name(b["matched_with"])
        for idx in idxs:
            # Avoid adding a brand that is literally identical to this product alias (e.g., "sony xperia")
            if brand_norm == products_output[idx]["product"]:
                continue
            if brand_norm not in products_output[idx]["brands"]:
                products_output[idx]["brands"].append(brand_norm)
            if b["term"] not in products_output[idx]["brands_raw"]:
                products_output[idx]["brands_raw"].append(b["term"])
            products_output[idx]["match_logs"].append(b)

    for q in quantity_matches:
        idxs = closest_indices_within_threshold(q["start_pos"], product_positions, QUANTITY_PROXIMITY)
        if not idxs:
            continue
        val = int(q["matched_with"])
        for idx in idxs:
            if val not in products_output[idx]["quantities"]:
                products_output[idx]["quantities"].append(val)
            products_output[idx]["match_logs"].append(q)

    for bd in budget_matches:
        idxs = closest_indices_within_threshold(bd["start_pos"], product_positions, BUDGET_PROXIMITY)
        if not idxs:
            continue
        val = parse_budget_value(bd["matched_with"])
        if val is None:
            continue
        for idx in idxs:
            if val not in products_output[idx]["budgets"]:
                products_output[idx]["budgets"].append(val)
            products_output[idx]["match_logs"].append(bd)

    # -------------------------
    # Controlled fuzzy merging (products)
    # -------------------------
    def min_pos_dist(a, b):
        return min(abs(pa - pb) for pa in a["positions"] for pb in b["positions"])

    used = [False] * len(products_output)
    merged_products = []
    for i in range(len(products_output)):
        if used[i]:
            continue
        group = [i]
        used[i] = True
        for j in range(i + 1, len(products_output)):
            if used[j]:
                continue
            if should_merge_products(
                products_output[i]["product"],
                products_output[j]["product"],
                min_pos_dist(products_output[i], products_output[j])
            ):
                group.append(j)
                used[j] = True

        group_entries = [products_output[k] for k in group]
        best_name = longest_name([e["product"] for e in group_entries])
        merged_entry = {
            "product": best_name,
            "aliases": sorted(set(sum([e["aliases"] for e in group_entries], []))),
            "aliases_raw": sorted(set(sum([e["aliases_raw"] for e in group_entries], []))),
            "quantities": sorted(set(sum([e["quantities"] for e in group_entries], []))),
            "brands": sorted(set(sum([e["brands"] for e in group_entries], []))),
            "brands_raw": sorted(set(sum([e["brands_raw"] for e in group_entries], []))),
            "colors": sorted(set(sum([e["colors"] for e in group_entries], []))),
            "colors_raw": sorted(set(sum([e["colors_raw"] for e in group_entries], []))),
            "budgets": sorted(set(sum([e["budgets"] for e in group_entries], []))),
            "positions": sorted(set(sum([e["positions"] for e in group_entries], []))),
            "match_logs": []
        }

        seen_logs = set()
        for e in group_entries:
            for ml in e["match_logs"]:
                ml_id = (ml["type"], ml["term"], ml["start_pos"], ml["end_pos"])
                if ml_id not in seen_logs:
                    merged_entry["match_logs"].append(ml)
                    seen_logs.add(ml_id)

        merged_products.append(merged_entry)

    response_data = {"products": merged_products, "total_products": len(merged_products)}
    
    # Save to database
    save_query(text, response_data)
    
    return jsonify(response_data)

@app.route("/history", methods=["GET"])
def history():
    """Get the last 10 queries from the database."""
    try:
        queries = get_recent_queries(10)
        return jsonify({"queries": queries, "total": len(queries)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Initialize database on startup
    init_database()
    app.run(host='0.0.0.0', port=5000, debug=True)
