import urllib.request, urllib.parse, json, math, time

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0 # km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 3)

CATEGORY_MAPPING = {
    'bakery': ('Bakery', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=350&fit=crop'),
    'restaurant': ('Restaurant', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=350&fit=crop'),
    'cafe': ('Cafe & Snacks', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=350&fit=crop'),
    'supermarket': ('Grocery', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&h=350&fit=crop'),
    'grocery': ('Grocery', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=350&fit=crop'),
    'pharmacy': ('Pharmacy', 'https://images.unsplash.com/photo-1586015555751-63c2998a698a?w=600&h=350&fit=crop'),
    'chemist': ('Pharmacy', 'https://images.unsplash.com/photo-1586015555751-63c2998a698a?w=600&h=350&fit=crop'),
    'clothes': ('Clothing', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=350&fit=crop'),
    'boutique': ('Clothing', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=350&fit=crop'),
    'electronics': ('Electronics', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&h=350&fit=crop'),
    'books': ('Stationery', 'https://images.unsplash.com/photo-1532012164546-f432f2e3d368?w=600&h=350&fit=crop'),
    'beauty': ('Beauty', 'https://images.unsplash.com/photo-1560066984-138daaa5f7f6?w=600&h=350&fit=crop'),
    'hairdresser': ('Beauty', 'https://images.unsplash.com/photo-1560066984-138daaa5f7f6?w=600&h=350&fit=crop'),
    'hardware': ('Hardware', 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=600&h=350&fit=crop'),
    'greengrocer': ('Fruits & Vegetables', 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&h=350&fit=crop'),
    'shoes': ('Footwear', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=350&fit=crop'),
    'florist': ('Flowers', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&h=350&fit=crop'),
    'pet': ('Pet Supplies', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=350&fit=crop'),
    'confectionery': ('Dairy & Sweets', 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&h=350&fit=crop'),
    'sweet': ('Dairy & Sweets', 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&h=350&fit=crop'),
}

def fetch_live_shops(lat, lon, radius_km=5.0):
    start = time.time()
    # 1. Reverse geocode to get locality details
    rev_url = f"https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat={lat}&lon={lon}"
    req = urllib.request.Request(rev_url, headers={'User-Agent': 'LocalLiftApp/2.0 (contact@locallift.com)'})
    
    locality = "Local Area"
    city = "Local City"
    road_names = []
    
    try:
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            addr = data.get('address', {})
            road = addr.get('road') or addr.get('neighbourhood') or addr.get('suburb')
            city = addr.get('city') or addr.get('town') or addr.get('village') or addr.get('county') or 'Local City'
            locality = road or city
            if road: road_names.append(road)
    except Exception as e:
        print("Reverse geo error:", e)

    # 2. Search for real POIs in bounding box
    delta = min(0.06, max(0.015, radius_km / 111.0 * 1.5))
    viewbox = f"{lon-delta},{lat+delta},{lon+delta},{lat-delta}"
    
    search_terms = ['bakery', 'restaurant', 'supermarket', 'pharmacy', 'clothes', 'cafe', 'electronics', 'hardware', 'beauty', 'sweets']
    discovered_shops = []
    seen_names = set()
    
    for term in search_terms[:5]:
        url = f"https://nominatim.openstreetmap.org/search?format=jsonv2&q={term}&bounded=1&viewbox={viewbox}&limit=4"
        req = urllib.request.Request(url, headers={'User-Agent': 'LocalLiftApp/2.0 (contact@locallift.com)'})
        try:
            with urllib.request.urlopen(req, timeout=3) as resp:
                items = json.loads(resp.read().decode('utf-8'))
                for item in items:
                    raw_name = item.get('name') or item.get('display_name', '').split(',')[0]
                    if not raw_name or raw_name.lower() in seen_names or len(raw_name) < 3:
                        continue
                    seen_names.add(raw_name.lower())
                    
                    plat = float(item['lat'])
                    plon = float(item['lon'])
                    dist = haversine(lat, lon, plat, plon)
                    
                    cat_type, img = CATEGORY_MAPPING.get(term, ('Grocery', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&h=350&fit=crop'))
                    
                    discovered_shops.append({
                        'business_name': raw_name,
                        'category': cat_type,
                        'address': item.get('display_name', '').split(',')[1:3] and ', '.join(item.get('display_name', '').split(',')[1:3]).strip() or f"{locality}, {city}",
                        'city': city,
                        'latitude': plat,
                        'longitude': plon,
                        'distance_km': dist,
                        'distance_m': int(dist * 1000),
                        'distance_formatted': f"{int(dist * 1000)} m away" if dist < 1.0 else f"{dist:.1f} km away",
                        'time_estimate': f"{max(1, int(dist*1000/75))} min walk" if dist < 1.0 else f"{max(2, int(dist*2.5))} min drive",
                        'image': img,
                        'is_open': 1,
                        'rating': round(4.2 + (hash(raw_name) % 8) / 10.0, 1),
                        'source': 'OpenStreetMap Live'
                    })
        except Exception as e:
            pass

    print(f"Discovered {len(discovered_shops)} real internet shops in {round(time.time() - start, 2)}s!")
    for s in sorted(discovered_shops, key=lambda x: x['distance_km'])[:6]:
        print(f" - {s['business_name']} ({s['category']}) -> {s['distance_formatted']} (at {s['latitude']}, {s['longitude']})")

if __name__ == '__main__':
    print("Testing Ludhiana...")
    fetch_live_shops(30.8900, 75.8300)
    print("\nTesting New Delhi...")
    fetch_live_shops(28.6315, 77.2167)
