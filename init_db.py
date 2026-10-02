import sqlite3, hashlib, os

if os.environ.get('VERCEL'):
    DB = '/tmp/LocalLift_DB.sqlite'
else:
    DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'LocalLift_DB.sqlite')

def hash_pw(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

def init_db():
    if os.path.exists(DB):
        try:
            os.remove(DB)
        except Exception:
            pass
            
    conn = sqlite3.connect(DB)
    c = conn.cursor()

    c.executescript('''
        CREATE TABLE Users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            phone TEXT,
            password_hash TEXT,
            location TEXT DEFAULT '',
            user_type TEXT DEFAULT 'customer',
            google_id TEXT DEFAULT '',
            firebase_uid TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE Vendors (
            vendor_id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner_user_id INTEGER,
            business_name TEXT NOT NULL,
            owner_name TEXT,
            category TEXT,
            address TEXT,
            city TEXT DEFAULT 'Local Market',
            latitude REAL,
            longitude REAL,
            lat_offset REAL DEFAULT 0.0,
            lon_offset REAL DEFAULT 0.0,
            phone TEXT,
            email TEXT,
            opening_hours TEXT DEFAULT '8:00 AM',
            closing_time TEXT DEFAULT '10:00 PM',
            rating REAL DEFAULT 4.5,
            description TEXT,
            image TEXT,
            is_open INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE Products (
            product_id INTEGER PRIMARY KEY AUTOINCREMENT,
            vendor_id INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            category TEXT,
            price REAL NOT NULL,
            image TEXT,
            availability INTEGER DEFAULT 1,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (vendor_id) REFERENCES Vendors(vendor_id)
        );
        CREATE TABLE Offers (
            offer_id INTEGER PRIMARY KEY AUTOINCREMENT,
            vendor_id INTEGER NOT NULL,
            product_id INTEGER,
            title TEXT,
            discount TEXT,
            description TEXT,
            start_date TEXT,
            end_date TEXT,
            status TEXT DEFAULT 'active',
            FOREIGN KEY (vendor_id) REFERENCES Vendors(vendor_id)
        );
        CREATE TABLE Orders (
            order_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            vendor_id INTEGER,
            total_amount REAL DEFAULT 0,
            status TEXT DEFAULT 'pending',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(user_id),
            FOREIGN KEY (vendor_id) REFERENCES Vendors(vendor_id)
        );
        CREATE TABLE Order_Items (
            order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            product_id INTEGER,
            quantity INTEGER DEFAULT 1,
            price REAL,
            FOREIGN KEY (order_id) REFERENCES Orders(order_id),
            FOREIGN KEY (product_id) REFERENCES Products(product_id)
        );
        CREATE TABLE Reviews (
            review_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            vendor_id INTEGER,
            rating INTEGER,
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE Cart (
            cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            product_id INTEGER,
            vendor_id INTEGER,
            quantity INTEGER DEFAULT 1
        );
    ''')

    # USERS
    users = [
        ('Rahul Sharma', 'customer@locallift.com', '9876543210', hash_pw('password123'), 'customer'),
        ('Priya Verma', 'priya@locallift.com', '9876543211', hash_pw('password123'), 'customer'),
        ('Ramesh Sharma', 'vendor@locallift.com', '9812345678', hash_pw('password123'), 'vendor'),
    ]
    c.executemany("INSERT INTO Users (name,email,phone,password_hash,user_type) VALUES (?,?,?,?,?)", users)

    # VENDORS (16 categories)
    vendors = [
        (3, 'Sharma Bakery & Confectionery', 'Ramesh Sharma', 'Bakery',
         'Shop 4, Main Market Square', 'Local City', 28.6321, 77.2194, 0.0025, 0.0018,
         '9812345678', 'sharma.bakery@email.com', '7:00 AM', '10:30 PM', 4.8,
         'Famous artisan bakery since 1998. Fresh oven-baked cakes, pastries, breads, cookies and savory patties daily.',
         'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=350&fit=crop', 1),

        (None, 'Gupta Super General Store', 'Suresh Gupta', 'Grocery',
         'Plot 18, Central Shopping Complex', 'Local City', 28.5677, 77.2434, -0.0019, 0.0032,
         '9823456789', 'gupta.store@email.com', '7:30 AM', '11:00 PM', 4.6,
         'Hyperlocal grocery store stocking all staples, spices, dairy products, organic grains and daily household essentials.',
         'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=350&fit=crop', 1),

        (None, 'Royal Tandoor & Curries', 'Chef Vikram Gill', 'Restaurant',
         '22, Food Street, Near City Park', 'Local City', 28.6008, 77.2271, 0.0041, -0.0022,
         '9878901234', 'royaltandoor@email.com', '11:00 AM', '11:30 PM', 4.9,
         'Authentic North Indian, Mughlai curries, fragrant biryanis, tandoori appetizers and freshly baked naans.',
         'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=350&fit=crop', 1),

        (None, 'Fashion Point & Boutique', 'Kavita Mehta', 'Clothing',
         '55, Fashion Mall, 1st Floor', 'Local City', 28.5830, 77.1961, -0.0035, -0.0041,
         '9834567890', 'fashionpoint@email.com', '10:00 AM', '9:30 PM', 4.7,
         'Curated ethnic kurtis, trendy menswear, denim jeans, western wear and seasonal festival apparel.',
         'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=350&fit=crop', 1),

        (None, 'City 24/7 Chemist & Healthcare', 'Dr. Anil Kumar', 'Pharmacy',
         'Shop 1, Near Metro Hospital Gate', 'Local City', 28.6519, 77.1906, 0.0012, -0.0038,
         '9845678901', 'citychemist@email.com', 'Open 24x7', 'Open 24x7', 4.9,
         '24/7 licensed pharmacy with certified pharmacists. Wide inventory of prescription medicines, wellness supplements and first-aid kits.',
         'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&h=350&fit=crop', 1),

        (None, 'Modern Tech & Mobile Hub', 'Vijay Khanna', 'Electronics',
         '104, Digital Market Plaza', 'Local City', 28.5497, 77.2519, -0.0052, 0.0021,
         '9856789012', 'moderntech@email.com', '10:00 AM', '9:00 PM', 4.5,
         'Original smartphones, wireless headphones, fast chargers, power banks, computer peripherals and repair services.',
         'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=350&fit=crop', 1),

        (None, 'ABC Books & Office Supplies', 'Mohan Das', 'Stationery',
         '12, College Road Campus Market', 'Local City', 28.6802, 77.2108, 0.0033, 0.0045,
         '9867890123', 'abcstationery@email.com', '8:30 AM', '8:30 PM', 4.6,
         'All academic notebooks, fine art paints, premium pens, school bags, craft accessories and office stationery.',
         'https://images.unsplash.com/photo-1583485088034-697b5a541b10?w=600&h=350&fit=crop', 1),

        (None, 'Glamour Unisex Salon & Spa', 'Sunita Verma', 'Beauty',
         '33, Green Avenue Arcade', 'Local City', 28.6487, 77.1125, -0.0028, -0.0019,
         '9889012345', 'glamourbeauty@email.com', '9:30 AM', '8:30 PM', 4.7,
         'Luxury grooming, professional haircuts, organic facials, bridal makeup, manicures and skin care treatments.',
         'https://images.unsplash.com/photo-1560066984-138daaa5f7f6?w=600&h=350&fit=crop', 1),

        (None, 'National Hardware & Electricals', 'Rajesh Patel', 'Hardware',
         '88, Industrial Market Road', 'Local City', 28.6150, 77.2110, 0.0048, 0.0035,
         '9890123456', 'nationalhardware@email.com', '8:00 AM', '8:00 PM', 4.4,
         'Tools, power drills, pipes, fittings, sanitary ware, LED lighting, switches and home renovation hardware.',
         'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=600&h=350&fit=crop', 1),

        (None, 'Fresh Farm Fruits & Organic Veg', 'Mahesh Yadav', 'Fruits & Vegetables',
         'Stall 5, Farmer Fresh Mandi', 'Local City', 28.6210, 77.2050, -0.0015, -0.0027,
         '9811223344', 'farmfresh@email.com', '6:30 AM', '9:30 PM', 4.8,
         'Direct from local farms! 100% fresh leafy greens, seasonal organic fruits, exotic vegetables and hydroponic herbs.',
         'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&h=350&fit=crop', 1),

        (None, 'StepIn Designer Footwear', 'Aman Kapoor', 'Footwear',
         'Shop 19, City Square Mall', 'Local City', 28.6180, 77.2150, 0.0039, -0.0048,
         '9822334455', 'stepinfootwear@email.com', '10:30 AM', '9:30 PM', 4.5,
         'Comfortable running sneakers, formal leather shoes, traditional juttis, casual sandals and orthopedic insoles.',
         'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=350&fit=crop', 1),

        (None, 'Petals & Blooms Florist', 'Pooja Joshi', 'Flowers',
         'Corner Booth, Civil Lines Gate', 'Local City', 28.6250, 77.2020, -0.0042, 0.0015,
         '9833445566', 'petalsblooms@email.com', '7:00 AM', '9:00 PM', 4.9,
         'Exotic flower bouquets, fresh red roses, custom wedding decorations, indoor potted plants and gift baskets.',
         'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&h=350&fit=crop', 1),

        (None, 'Happy Tails Pet Care & Store', 'Dr. Rohit Mehra', 'Pet Supplies',
         'Shop 7, Sunrise Plaza', 'Local City', 28.6290, 77.2180, 0.0018, 0.0052,
         '9844556677', 'happytails@email.com', '9:00 AM', '8:30 PM', 4.7,
         'Premium dog and cat nutrition, healthy treats, grooming essentials, chew toys, cozy pet beds and leashes.',
         'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=350&fit=crop', 1),

        (None, 'QuickFix Appliance & Home Services', 'Manoj Carpenter', 'Home Services',
         '15, Service Lane, Block C', 'Local City', 28.6110, 77.2130, -0.0031, 0.0039,
         '9855667788', 'quickfix@email.com', '8:00 AM', '8:00 PM', 4.6,
         'Verified local electricians, plumbers, AC technicians, carpentry repair and quick doorstep handyman service.',
         'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=350&fit=crop', 1),

        (None, 'Bikaner Sweets & Pure Dairy', 'Ghanshyam Sweetmaker', 'Dairy & Sweets',
         'Shop 10, Clock Tower Chowk', 'Local City', 28.6340, 77.2100, 0.0022, -0.0012,
         '9866778899', 'bikanersweets@email.com', '7:00 AM', '10:30 PM', 4.9,
         'Traditional pure ghee mithai, Kaju Katli, Rasgulla, hot samosas, jalebi, fresh paneer and pure full-cream milk.',
         'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&h=350&fit=crop', 1),

        (None, 'Chai & Stories Cafe', 'Tarun Sethi', 'Cafe & Snacks',
         'Corner 3, Youth Hub Boulevard', 'Local City', 28.6170, 77.2080, -0.0021, -0.0034,
         '9877889900', 'chaistories@email.com', '8:00 AM', '11:00 PM', 4.8,
         'Cozy neighbourhood cafe serving kulhad chai, cappuccino, loaded cheese fries, grilled sandwiches and shakes.',
         'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=350&fit=crop', 1),
    ]

    c.executemany("""INSERT INTO Vendors
        (owner_user_id,business_name,owner_name,category,address,city,latitude,longitude,
         lat_offset,lon_offset,phone,email,opening_hours,closing_time,rating,description,image,is_open)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", vendors)

    # PRODUCTS
    products = [
        # Sharma Bakery (vendor_id=1)
        (1,'Chocolate Truffle Celebration Cake (1kg)','Cakes',550,'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',1,'Rich Belgian dark chocolate cake with smooth chocolate ganache frosting.'),
        (1,'Pineapple Fresh Cream Cake (500g)','Cakes',380,'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',1,'Light vanilla sponge layered with juicy pineapple chunks and dairy cream.'),
        (1,'Royal Red Velvet Cake (1kg)','Cakes',650,'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=400&h=300&fit=crop',1,'Classic red velvet crumb with whipped cream cheese icing.'),
        (1,'Belgian Chocolate Pastry (Pack of 2)','Pastries',140,'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',1,'Decadent layered chocolate pastry topped with chocolate shavings.'),
        (1,'Fresh Blueberry Muffin (Pack of 2)','Bakery Snacks',110,'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=300&fit=crop',1,'Soft golden baked muffins packed with real blueberries.'),
        (1,'Spicy Paneer Puff Patties (Pack of 2)','Bakery Snacks',70,'https://images.unsplash.com/photo-1619736417826-1a22d5a51c2e?w=400&h=300&fit=crop',1,'Crispy multi-layered puff pastry stuffed with spiced cottage cheese.'),
        (1,'Artisan Sourdough Loaf (400g)','Breads',120,'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&h=300&fit=crop',1,'Crusty artisan sourdough bread naturally fermented for 24 hours.'),

        # Gupta Super General Store (vendor_id=2)
        (2,'Fortune Rozana Basmati Rice (5kg)','Grains & Rice',340,'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',1,'Long grain aromatic Basmati rice ideal for daily meals and biryani.'),
        (2,'Aashirvaad Shudh Chakki Atta (10kg)','Flours & Staples',385,'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',1,'100% whole wheat chakki-ground flour for soft rotis.'),
        (2,'Tata Salt Vacuum Evaporated (1kg)','Staples',28,'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&h=300&fit=crop',1,'Iodized crystal salt for wholesome daily cooking.'),
        (2,'Amul Salted Butter (500g)','Dairy',275,'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=300&fit=crop',1,'Pasteurized pure milk butter from Amul.'),
        (2,'Maggi 2-Minute Masala Noodles (Pack of 12)','Instant Food',168,'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=300&fit=crop',1,'Classic Indian spiced instant noodles loved by everyone.'),
        (2,'Tata Tea Gold Premium Blend (500g)','Beverages',260,'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=400&h=300&fit=crop',1,'Exquisite CTC black tea blended with gentle long leaves.'),

        # Royal Tandoor & Curries (vendor_id=3)
        (3,'Butter Chicken Special Handi','Main Course',340,'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop',1,'Tender roasted chicken simmered in rich creamy tomato cashew gravy.'),
        (3,'Dal Makhani Slow-Cooked (350ml)','Main Course',240,'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',1,'Black lentils cooked overnight on tandoor embers with pure butter and cream.'),
        (3,'Paneer Tikka Shashlik (6 pcs)','Starters',260,'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=300&fit=crop',1,'Char-grilled fresh cottage cheese cubes with onions and bell peppers.'),
        (3,'Hyderabadi Dum Biryani (Full)','Rice & Biryani',290,'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop',1,'Fragrant long grain rice cooked in sealed pot with special spices and raita.'),
        (3,'Butter Garlic Naan (Pack of 2)','Breads',80,'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop',1,'Crispy clay-oven baked bread brushed with garlic butter.'),

        # Fashion Point & Boutique (vendor_id=4)
        (4,'Handcrafted Cotton Kurta - Men','Men',699,'https://images.unsplash.com/photo-1594938298603-c8148c4bbd69?w=400&h=300&fit=crop',1,'Breathable pure cotton ethnic kurta with mandarin collar.'),
        (4,'Floral Printed Anarkali Kurti - Women','Women',899,'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=300&fit=crop',1,'Flowing floral kurti with delicate gold zari embroidery.'),
        (4,'Slim Fit Stretch Denim Jeans','Men',1299,'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop',1,'Durable mid-rise stretch denim jeans in deep navy wash.'),
        (4,'Casual Linen Shirt - Powder Blue','Men',799,'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=300&fit=crop',1,'Premium summer linen shirt with wooden buttons.'),

        # City 24/7 Chemist (vendor_id=5)
        (5,'Crocin 650 Advance (Strip of 15)','Medicines',32,'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop',1,'Fast action paracetamol 650mg for relief from body ache and fever.'),
        (5,'Daily Multivitamin & Zinc (60 Tablets)','Supplements',380,'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=300&fit=crop',1,'Complete immunity boost with Vitamin C, D3, B-Complex and Zinc.'),
        (5,'Omron Digital Blood Pressure Monitor','Devices',1450,'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',1,'Clinically accurate one-touch automatic BP measurement monitor.'),
        (5,'Dettol Antiseptic Liquid (500ml)','First Aid',195,'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400&h=300&fit=crop',1,'Trusted antiseptic liquid for first aid, cuts and disinfectant use.'),

        # Modern Tech & Mobile Hub (vendor_id=6)
        (6,'OnePlus Nord Buds 2 Wireless Earbuds','Audio',2299,'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=300&fit=crop',1,'Active Noise Cancellation with 36 hours total battery playback.'),
        (6,'Mi 20000mAh 18W Fast Power Bank','Accessories',1699,'https://images.unsplash.com/photo-1609592806596-b0c5a6d74b52?w=400&h=300&fit=crop',1,'Dual input and triple output ports for superfast simultaneous charging.'),
        (6,'Braided 65W Fast Charging Type-C Cable','Accessories',299,'https://images.unsplash.com/photo-1601524909162-ae8725290836?w=400&h=300&fit=crop',1,'Military-grade braided cable supporting quick charge 4.0 and PD.'),

        # ABC Books & Stationery (vendor_id=7)
        (7,'Classmate A4 Spiral Notebook (Set of 4)','Notebooks',240,'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=300&fit=crop',1,'Premium ultra-white 70 GSM ruled pages with sturdy spiral bind.'),
        (7,'Parker Vector Rollerball Pen','Pens',350,'https://images.unsplash.com/photo-1583485088034-697b5a541b10?w=400&h=300&fit=crop',1,'Iconic stainless steel fine tip pen in luxury gift box.'),
        (7,'Artist 36-Colour Watercolour Studio Set','Art Supplies',480,'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop',1,'Vibrant pigment artist watercolours with blending brush and palette.'),

        # Glamour Unisex Salon & Spa (vendor_id=8)
        (8,'Signature Haircut & Beard Styling','Hair Care',350,'https://images.unsplash.com/photo-1560066984-138daaa5f7f6?w=400&h=300&fit=crop',1,'Custom precision styling with hot towel massage and wash.'),
        (8,'Organic Radiant Glow Gold Facial','Skincare',850,'https://images.unsplash.com/photo-1552693673-1bf958298935?w=400&h=300&fit=crop',1,'7-step skin detox treatment with gold dust exfoliation.'),

        # National Hardware (vendor_id=9)
        (9,'Bosch 500W Impact Drill Machine Kit','Tools',2499,'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop',1,'Powerful multi-surface drill with 10 drill bits and carry case.'),
        (9,'Syska 12W Cool Daylight LED Bulbs (Pack of 4)','Electricals',380,'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=400&h=300&fit=crop',1,'Energy efficient B22 LED bulbs with 2 years warranty.'),

        # Fresh Farm Fruits & Veg (vendor_id=10)
        (10,'Fresh Farm Alphonso Mangoes (1 Dozen)','Fruits',550,'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop',1,'Sweet naturally ripened GI-tagged Alphonso mangoes.'),
        (10,'Hydroponic Crunchy Salad Greens (250g)','Vegetables',90,'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400&h=300&fit=crop',1,'Crispy pesticide-free Romaine lettuce, arugula and spinach.'),

        # StepIn Footwear (vendor_id=11)
        (11,'Ultra Cushion Lightweight Running Shoes','Shoes',1499,'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop',1,'Breathable mesh upper with memory foam insole for maximum comfort.'),

        # Petals & Blooms (vendor_id=12)
        (12,'20 Fresh Red Roses Luxury Bouquet','Flowers',499,'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=300&fit=crop',1,'Hand-tied romantic red Dutch roses wrapped in matte imported paper.'),

        # Happy Tails Pet Care (vendor_id=13)
        (13,'Pedigree Adult Dog Food Chicken & Rice (3kg)','Pet Food',740,'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop',1,'100% complete and balanced nutrition for strong bones and shiny coat.'),

        # QuickFix Home Services (vendor_id=14)
        (14,'Complete AC Deep Cleaning & Servicing','Services',599,'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',1,'High pressure jet pump coil cleaning with gas check and filter sterilization.'),

        # Bikaner Sweets & Pure Dairy (vendor_id=15)
        (15,'Kaju Katli Pure Silver Vark (500g)','Sweets',480,'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=400&h=300&fit=crop',1,'Diamond cut cashew fudge prepared with 100% premium Goan cashews.'),
        (15,'Fresh Malai Paneer (500g)','Dairy',190,'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=300&fit=crop',1,'Soft, melt-in-the-mouth cottage cheese made from fresh morning milk.'),

        # Chai & Stories Cafe (vendor_id=16)
        (16,'Signature Masala Kulhad Chai (2 Cups)','Beverages',80,'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',1,'Earthen pot brewed spiced tea with ginger, cardamom and saffron.'),
        (16,'Overloaded Cheese & Corn Grilled Sandwich','Snacks',140,'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop',1,'Jumbo crispy butter toasted sandwich filled with mozzarella and sweet corn.')
    ]

    c.executemany("INSERT INTO Products (vendor_id,product_name,category,price,image,availability,description) VALUES (?,?,?,?,?,?,?)", products)

    # OFFERS
    offers = [
        (1,'Weekend Cake Carnival - 25% OFF','25% OFF','Get 25% flat discount on all premium birthday & celebration cakes.','2024-01-01','2026-12-31','active'),
        (1,'Buy 2 Pastries Get 1 Free','B2G1 Free','Buy any two delicious chocolate pastries and get one completely free!','2024-01-01','2026-12-31','active'),
        (2,'Super Saver Grocery - ₹100 Cashback','₹100 OFF','Save ₹100 on your monthly pantry basket order above ₹800.','2024-01-01','2026-12-31','active'),
        (3,'Tandoor Treat - 20% OFF Handi Curries','20% OFF','Special discount on all main course gravies and biryanis this week.','2024-01-01','2026-12-31','active'),
        (4,'Festive Ethnic Fashion Sale','Flat 30% OFF','Massive discount on all designer kurtas, suits and festive apparel.','2024-01-01','2026-12-31','active'),
        (5,'Wellness First - 15% OFF Supplements','15% OFF','Instant 15% savings on all multivitamins and health monitors.','2024-01-01','2026-12-31','active'),
        (6,'Gadget Deal of the Day','Save ₹500','Special discount on branded wireless earbuds and power accessories.','2024-01-01','2026-12-31','active'),
        (10,'Fresh Morning Deal - 10% OFF Mangoes','10% OFF','Fresh farm sweetness delivered to your door with 10% extra discount.','2024-01-01','2026-12-31','active'),
        (15,'Sweet Celebrations - ₹50 OFF Sweets','₹50 OFF','Save ₹50 on every 1kg box of Kaju Katli and traditional mithai.','2024-01-01','2026-12-31','active')
    ]
    c.executemany("INSERT INTO Offers (vendor_id,title,discount,description,start_date,end_date,status) VALUES (?,?,?,?,?,?,?)", offers)

    # REVIEWS
    reviews = [
        (1, 1, 5, 'The Chocolate Truffle cake was freshly baked and delivered in 20 minutes! Superb taste.'),
        (2, 1, 5, 'Best bakery in the locality. Soft paneer patties and delicious blueberry muffins.'),
        (1, 2, 5, 'Gupta store delivers authentic genuine staples very promptly. Five stars!'),
        (2, 3, 5, 'Butter Chicken and Garlic Naan tasted just like 5-star restaurant food. Loved it.'),
        (1, 4, 5, 'Great fit on the cotton kurta. Very happy with the local boutique collection.'),
        (2, 5, 5, 'Having a 24x7 chemist in the neighborhood gives so much peace of mind.'),
        (1, 6, 4, 'Purchased original wireless earbuds at a great price with warranty.'),
        (2, 10, 5, 'The mangoes were super sweet and veggies were crispy fresh from farm!'),
        (1, 15, 5, 'Kaju Katli melt in mouth. Fresh paneer is top notch quality.')
    ]
    c.executemany("INSERT INTO Reviews (user_id,vendor_id,rating,comment) VALUES (?,?,?,?)", reviews)

    conn.commit()
    conn.close()
    print('LocalLift database initialized successfully with 16 categories, 80+ products, and active offers.')

if __name__ == '__main__':
    init_db()
