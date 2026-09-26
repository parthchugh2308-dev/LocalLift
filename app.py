from flask import Flask, render_template, request, jsonify
import sqlite3, os, math, hashlib

app = Flask(__name__)
app.secret_key = 'locallift_secret_hyperlocal_2025'
if os.environ.get('VERCEL'):
    DB = '/tmp/LocalLift_DB.sqlite'
else:
    DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'LocalLift_DB.sqlite')

def get_db():
    if not os.path.exists(DB):
        import init_db
        init_db.init_db()
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

def hash_pw(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

# ─── PAGE ROUTES ────────────────────────────────────────────
@app.route('/')
def home():
    return render_template('customer.html')

@app.route('/vendor')
def vendor_page():
    return render_template('vendor.html')

@app.route('/manifest.json')
def manifest():
    return app.send_static_file('manifest.json')

@app.route('/sw.js')
def service_worker():
    return app.send_static_file('sw.js')

# ─── AUTH APIS ──────────────────────────────────────────────
@app.route('/api/auth/register', methods=['POST'])
def register():
    d = request.json or {}
    conn = get_db()
    try:
        cur = conn.execute(
            "INSERT INTO Users (name, email, phone, password_hash, user_type) VALUES (?,?,?,?,?)",
            (d.get('name', 'User'), d.get('email',''), d.get('phone',''), hash_pw(d.get('password','password123')), d.get('user_type','customer'))
        )
        conn.commit()
        uid = cur.lastrowid
        user = dict(conn.execute("SELECT * FROM Users WHERE user_id=?", (uid,)).fetchone())
        user.pop('password_hash', None)
        conn.close()
        return jsonify({'success': True, **user})
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'success': False, 'error': 'Email already registered'}), 400

@app.route('/api/auth/login', methods=['POST'])
def login():
    d = request.json or {}
    conn = get_db()
    user = conn.execute("SELECT * FROM Users WHERE email=? AND password_hash=?",
                        (d.get('email',''), hash_pw(d.get('password','')))).fetchone()
    conn.close()
    if user:
        u = dict(user); u.pop('password_hash', None)
        return jsonify({'success': True, **u})
    return jsonify({'success': False, 'error': 'Invalid credentials'}), 401

@app.route('/api/auth/phone-login', methods=['POST'])
def phone_login():
    d = request.json or {}
    phone = d.get('phone', '9876543210')
    conn = get_db()
    user = conn.execute("SELECT * FROM Users WHERE phone=?", (phone,)).fetchone()
    if not user:
        cur = conn.execute("INSERT INTO Users (name, phone, user_type) VALUES (?,?,?)",
                           (f'User {phone[-4:]}', phone, 'customer'))
        conn.commit()
        user = conn.execute("SELECT * FROM Users WHERE user_id=?", (cur.lastrowid,)).fetchone()
    u = dict(user); u.pop('password_hash', None)
    conn.close()
    return jsonify({'success': True, **u})

# ─── VENDORS & HYPERLOCAL MAP APIS ─────────────────────────
@app.route('/api/vendors', methods=['GET'])
def get_vendors():
    conn = get_db()
    vendors = conn.execute("SELECT * FROM Vendors").fetchall()
    result = []
    for v in vendors:
        vd = dict(v)
        vd['offers'] = [dict(o) for o in conn.execute(
            "SELECT * FROM Offers WHERE vendor_id=? AND status='active'", (v['vendor_id'],)).fetchall()]
        vd['review_count'] = conn.execute(
            "SELECT COUNT(*) FROM Reviews WHERE vendor_id=?", (v['vendor_id'],)).fetchone()[0]
        result.append(vd)
    conn.close()
    return jsonify(result)

@app.route('/api/vendors/nearby', methods=['GET'])
def get_nearby():
    # User's GPS or manual location
    lat = float(request.args.get('lat', 28.6139))
    lon = float(request.args.get('lon', 77.2090))
    cat = request.args.get('category', '').strip()

    conn = get_db()
    q = "SELECT * FROM Vendors"
    params = []
    if cat:
        q += " WHERE LOWER(category) = LOWER(?)"
        params.append(cat)
        
    vendors = conn.execute(q, params).fetchall()
    result = []
    
    for v in vendors:
        vd = dict(v)
        # Calculate dynamic pinpoint coordinates around the user's current GPS location
        lat_off = vd.get('lat_offset') or 0.0015
        lon_off = vd.get('lon_offset') or 0.0015
        
        projected_lat = round(lat + lat_off, 6)
        projected_lon = round(lon + lon_off, 6)
        
        dist = haversine(lat, lon, projected_lat, projected_lon)
        
        vd['latitude'] = projected_lat
        vd['longitude'] = projected_lon
        vd['distance_km'] = dist
        
        # Attach active offers
        vd['offers'] = [dict(o) for o in conn.execute(
            "SELECT * FROM Offers WHERE vendor_id=? AND status='active'", (v['vendor_id'],)).fetchall()]
        
        # Attach product count
        vd['product_count'] = conn.execute(
            "SELECT COUNT(*) FROM Products WHERE vendor_id=?", (v['vendor_id'],)).fetchone()[0]
            
        result.append(vd)
        
    # Sort by nearest
    result.sort(key=lambda x: x['distance_km'])
    conn.close()
    return jsonify(result)

@app.route('/api/vendors/<int:vid>', methods=['GET'])
def get_vendor(vid):
    conn = get_db()
    v = conn.execute("SELECT * FROM Vendors WHERE vendor_id=?", (vid,)).fetchone()
    if not v:
        conn.close()
        return jsonify({'error': 'Vendor not found'}), 404
        
    products = [dict(p) for p in conn.execute("SELECT * FROM Products WHERE vendor_id=?", (vid,)).fetchall()]
    offers = [dict(o) for o in conn.execute("SELECT * FROM Offers WHERE vendor_id=? AND status='active'", (vid,)).fetchall()]
    reviews = [dict(r) for r in conn.execute(
        "SELECT r.*, u.name as user_name FROM Reviews r LEFT JOIN Users u ON r.user_id=u.user_id WHERE r.vendor_id=? ORDER BY r.created_at DESC",
        (vid,)).fetchall()]
        
    conn.close()
    return jsonify({
        'vendor': dict(v),
        'products': products,
        'offers': offers,
        'reviews': reviews
    })

@app.route('/api/vendors/<int:vid>/dashboard', methods=['GET'])
def vendor_dashboard(vid):
    conn = get_db()
    v = conn.execute("SELECT * FROM Vendors WHERE vendor_id=?", (vid,)).fetchone()
    if not v:
        conn.close()
        return jsonify({'error': 'Vendor not found'}), 404
        
    stats = {
        'total_products': conn.execute("SELECT COUNT(*) FROM Products WHERE vendor_id=?", (vid,)).fetchone()[0],
        'active_offers':  conn.execute("SELECT COUNT(*) FROM Offers WHERE vendor_id=? AND status='active'", (vid,)).fetchone()[0],
        'total_orders':   conn.execute("SELECT COUNT(*) FROM Orders WHERE vendor_id=?", (vid,)).fetchone()[0],
        'total_reviews':  conn.execute("SELECT COUNT(*) FROM Reviews WHERE vendor_id=?", (vid,)).fetchone()[0],
    }
    
    products = [dict(p) for p in conn.execute("SELECT * FROM Products WHERE vendor_id=?", (vid,)).fetchall()]
    offers   = [dict(o) for o in conn.execute("SELECT * FROM Offers WHERE vendor_id=?", (vid,)).fetchall()]
    orders   = [dict(o) for o in conn.execute(
        "SELECT o.*, u.name as customer_name FROM Orders o LEFT JOIN Users u ON o.user_id=u.user_id WHERE o.vendor_id=? ORDER BY o.created_at DESC",
        (vid,)).fetchall()]
        
    for order in orders:
        order['items'] = [dict(i) for i in conn.execute(
            "SELECT oi.*, p.product_name FROM Order_Items oi JOIN Products p ON oi.product_id=p.product_id WHERE oi.order_id=?",
            (order['order_id'],)).fetchall()]
            
    conn.close()
    return jsonify({'vendor': dict(v), 'stats': stats, 'products': products, 'offers': offers, 'orders': orders})

# ─── PRODUCTS APIS ──────────────────────────────────────────
@app.route('/api/products', methods=['GET'])
def get_products():
    vid = request.args.get('vendor_id')
    cat = request.args.get('category', '').strip()
    conn = get_db()
    
    q = "SELECT p.*, v.business_name, v.category as vendor_category FROM Products p JOIN Vendors v ON p.vendor_id=v.vendor_id WHERE 1=1"
    params = []
    
    if vid:
        q += " AND p.vendor_id=?"
        params.append(vid)
    if cat:
        q += " AND (LOWER(p.category)=LOWER(?) OR LOWER(v.category)=LOWER(?))"
        params.extend([cat, cat])
        
    products = conn.execute(q, params).fetchall()
    conn.close()
    return jsonify([dict(p) for p in products])

@app.route('/api/products', methods=['POST'])
def add_product():
    d = request.json or {}
    conn = get_db()
    cur = conn.execute(
        "INSERT INTO Products (vendor_id, product_name, category, price, image, availability, description) VALUES (?,?,?,?,?,?,?)",
        (d.get('vendor_id', 1), d['product_name'], d.get('category','General'), d['price'], d.get('image',''), d.get('availability',1), d.get('description',''))
    )
    conn.commit()
    pid = cur.lastrowid
    conn.close()
    return jsonify({'success': True, 'product_id': pid})

@app.route('/api/products/<int:pid>/toggle', methods=['PATCH'])
def toggle_product(pid):
    conn = get_db()
    conn.execute("UPDATE Products SET availability = 1 - availability WHERE product_id=?", (pid,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/products/<int:pid>', methods=['DELETE'])
def delete_product(pid):
    conn = get_db()
    conn.execute("DELETE FROM Products WHERE product_id=?", (pid,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# ─── OFFERS APIS ────────────────────────────────────────────
@app.route('/api/offers', methods=['GET'])
def get_offers():
    vid = request.args.get('vendor_id')
    conn = get_db()
    if vid:
        offers = conn.execute("SELECT o.*, v.business_name FROM Offers o JOIN Vendors v ON o.vendor_id=v.vendor_id WHERE o.vendor_id=?", (vid,)).fetchall()
    else:
        offers = conn.execute("SELECT o.*, v.business_name FROM Offers o JOIN Vendors v ON o.vendor_id=v.vendor_id WHERE o.status='active'").fetchall()
    conn.close()
    return jsonify([dict(o) for o in offers])

@app.route('/api/offers', methods=['POST'])
def add_offer():
    d = request.json or {}
    conn = get_db()
    cur = conn.execute(
        "INSERT INTO Offers (vendor_id, title, discount, description, start_date, end_date, status) VALUES (?,?,?,?,?,?,'active')",
        (d.get('vendor_id', 1), d['title'], d['discount'], d.get('description',''), d.get('start_date','2025-01-01'), d.get('end_date','2025-12-31'))
    )
    conn.commit()
    oid = cur.lastrowid
    conn.close()
    return jsonify({'success': True, 'offer_id': oid})

# ─── ORDERS APIS ────────────────────────────────────────────
@app.route('/api/orders', methods=['GET'])
def get_orders():
    uid = request.args.get('user_id')
    conn = get_db()
    if uid:
        orders = conn.execute(
            "SELECT o.*, v.business_name FROM Orders o JOIN Vendors v ON o.vendor_id=v.vendor_id WHERE o.user_id=? ORDER BY o.created_at DESC",
            (uid,)).fetchall()
    else:
        orders = conn.execute("SELECT o.*, v.business_name FROM Orders o JOIN Vendors v ON o.vendor_id=v.vendor_id ORDER BY o.created_at DESC").fetchall()
        
    result = []
    for o in orders:
        od = dict(o)
        od['items'] = [dict(i) for i in conn.execute(
            "SELECT oi.*, p.product_name FROM Order_Items oi JOIN Products p ON oi.product_id=p.product_id WHERE oi.order_id=?",
            (o['order_id'],)).fetchall()]
        result.append(od)
        
    conn.close()
    return jsonify(result)

@app.route('/api/orders', methods=['POST'])
def place_order():
    d = request.json or {}
    conn = get_db()
    cur = conn.execute(
        "INSERT INTO Orders (user_id, vendor_id, total_amount, status, notes) VALUES (?,?,?,?,?)",
        (d.get('user_id', 1), d.get('vendor_id', 1), d.get('total_amount', 0), 'pending', d.get('notes',''))
    )
    oid = cur.lastrowid
    
    for item in d.get('items', []):
        conn.execute(
            "INSERT INTO Order_Items (order_id, product_id, quantity, price) VALUES (?,?,?,?)",
            (oid, item['product_id'], item.get('quantity', 1), item.get('price', 0))
        )
        
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'order_id': oid})

@app.route('/api/orders/<int:oid>/status', methods=['PATCH'])
def update_order_status(oid):
    d = request.json or {}
    conn = get_db()
    conn.execute("UPDATE Orders SET status=? WHERE order_id=?", (d.get('status','confirmed'), oid))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# ─── GLOBAL SEARCH API ──────────────────────────────────────
@app.route('/api/search', methods=['GET'])
def search():
    q = request.args.get('q', '').lower().strip()
    lat = float(request.args.get('lat', 28.6139))
    lon = float(request.args.get('lon', 77.2090))
    
    conn = get_db()
    
    vendors = conn.execute(
        "SELECT * FROM Vendors WHERE LOWER(business_name) LIKE ? OR LOWER(category) LIKE ? OR LOWER(description) LIKE ?",
        (f'%{q}%', f'%{q}%', f'%{q}%')).fetchall()
        
    products = conn.execute(
        "SELECT p.*, v.business_name FROM Products p JOIN Vendors v ON p.vendor_id=v.vendor_id WHERE LOWER(p.product_name) LIKE ? OR LOWER(p.category) LIKE ? OR LOWER(p.description) LIKE ?",
        (f'%{q}%', f'%{q}%', f'%{q}%')).fetchall()
        
    vendor_list = []
    for v in vendors:
        vd = dict(v)
        lat_off = vd.get('lat_offset') or 0.0015
        lon_off = vd.get('lon_offset') or 0.0015
        vd['latitude'] = round(lat + lat_off, 6)
        vd['longitude'] = round(lon + lon_off, 6)
        vd['distance_km'] = haversine(lat, lon, vd['latitude'], vd['longitude'])
        vendor_list.append(vd)
        
    vendor_list.sort(key=lambda x: x['distance_km'])
    conn.close()
    return jsonify({'vendors': vendor_list, 'products': [dict(p) for p in products]})

# ─── CATEGORIES API ─────────────────────────────────────────
@app.route('/api/categories', methods=['GET'])
def get_categories():
    conn = get_db()
    cats = conn.execute("SELECT category, COUNT(*) as vendor_count FROM Vendors GROUP BY category").fetchall()
    conn.close()
    return jsonify([dict(c) for c in cats])

if __name__ == '__main__':
    if not os.path.exists(DB):
        import init_db
        init_db.init_db()
    app.run(debug=True, port=5000, host='0.0.0.0')
