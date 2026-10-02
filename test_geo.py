import urllib.request, json

lat, lon = 31.2356, 76.4984
# Reverse geocode to get locality name
rev_url = f"https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat={lat}&lon={lon}"
req = urllib.request.Request(rev_url, headers={'User-Agent': 'LocalLiftApp/2.0'})
with urllib.request.urlopen(req, timeout=5) as resp:
    rev_data = json.loads(resp.read().decode('utf-8'))
    print("Address:", rev_data.get('display_name'))
    addr = rev_data.get('address', {})
    place_name = addr.get('town') or addr.get('city') or addr.get('suburb') or addr.get('village') or addr.get('county') or 'Local'
    print("Place name:", place_name)

# Query shops with town name
search_url = f"https://nominatim.openstreetmap.org/search?format=jsonv2&q={urllib.parse.quote(place_name + ' market')}&limit=10"
req2 = urllib.request.Request(search_url, headers={'User-Agent': 'LocalLiftApp/2.0'})
with urllib.request.urlopen(req2, timeout=5) as resp2:
    search_data = json.loads(resp2.read().decode('utf-8'))
    print(f"Found {len(search_data)} locations for '{place_name} market'")
    for x in search_data[:5]:
        print(" -", x.get('display_name'), "lat:", x.get('lat'), "lon:", x.get('lon'))
