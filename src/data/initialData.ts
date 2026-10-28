import { CategoryInfo, Offer, Order, Product, Review, User, Vendor } from '../types';

export const CATEGORIES: Record<string, CategoryInfo> = {
  'Bakery': {
    name: 'Bakery',
    icon: 'fa-bread-slice',
    color: 'bg-amber-600',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=350&fit=crop',
    items: [
      { name: 'Fresh Cream Black Forest Cake (500g)', price: 420, desc: 'Rich Belgian cocoa sponge with whipped cream and cherries', img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&fit=crop' },
      { name: 'Butter Croissant (2 Pcs)', price: 120, desc: 'Flaky golden layered European-style butter croissants', img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&fit=crop' },
      { name: 'Whole Wheat Multigrain Bread', price: 65, desc: 'Freshly baked daily with 7 wholesome grains & seeds', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&fit=crop' },
      { name: 'Belgian Chocolate Truffle Pastry', price: 90, desc: 'Decadent dark chocolate ganache single pastry slice', img: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=400&fit=crop' },
      { name: 'Crispy Herb Garlic Toast Loaf', price: 80, desc: 'Infused with roasted garlic butter and Italian herbs', img: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400&fit=crop' }
    ]
  },
  'Grocery': {
    name: 'Grocery',
    icon: 'fa-basket-shopping',
    color: 'bg-emerald-600',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=350&fit=crop',
    items: [
      { name: 'Aashirvaad Shudh Chakki Atta (5kg)', price: 245, desc: '100% pure whole wheat ground flour with natural dietary fiber', img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&fit=crop' },
      { name: 'Fortune Sunlite Sunflower Oil (1L)', price: 145, desc: 'Refined healthy cooking oil enriched with vitamins A & D', img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&fit=crop' },
      { name: 'Tata Sampann Unpolished Toor Dal (1kg)', price: 165, desc: 'Natural unpolished protein-rich dal with natural oils intact', img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&fit=crop' },
      { name: 'India Gate Premium Basmati Rice (1kg)', price: 180, desc: 'Aged long-grain aromatic basmati for daily feasts and biryani', img: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&fit=crop' },
      { name: 'Tata Vacuum Evaporated Salt (1kg)', price: 28, desc: 'Desh ka namak with guaranteed balanced iodine content', img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&fit=crop' }
    ]
  },
  'Restaurant': {
    name: 'Restaurant',
    icon: 'fa-utensils',
    color: 'bg-rose-600',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=350&fit=crop',
    items: [
      { name: 'Paneer Butter Masala & Butter Naan Meal', price: 260, desc: 'Cottage cheese cubes in rich creamy tomato cashew gravy + 2 butter naans', img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&fit=crop' },
      { name: 'Hyderabadi Dum Veg Biryani', price: 220, desc: 'Fragrant basmati rice slow-cooked with spiced vegetables & mint raita', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&fit=crop' },
      { name: 'Tandoori Soya Chaap Platter', price: 190, desc: 'Charcoal grilled marinated soya chunks served with mint chutney', img: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=400&fit=crop' },
      { name: 'Dal Makhani Special Bowl', price: 180, desc: 'Overnight slow simmered black lentils finished with cream & white butter', img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&fit=crop' }
    ]
  },
  'Pharmacy': {
    name: 'Pharmacy',
    icon: 'fa-prescription-bottle-medical',
    color: 'bg-blue-600',
    image: 'https://images.unsplash.com/photo-1586015555751-63c2998a698a?w=600&h=350&fit=crop',
    items: [
      { name: 'Dolo 650mg Paracetamol Tablets (15 Tab)', price: 34, desc: 'Fast relief for fever, headache, body aches and inflammation', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&fit=crop' },
      { name: 'Celin 500mg Vitamin C Chewable (20 Tab)', price: 42, desc: 'Daily immunity booster with pure ascorbic acid for protection', img: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&fit=crop' },
      { name: 'Dettol Antiseptic Liquid (250ml)', price: 135, desc: 'Trusted first-aid disinfectant for cuts, bites and hygienic home care', img: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&fit=crop' },
      { name: 'Volini Pain Relief Fast Spray (100g)', price: 195, desc: 'Instant micro-gel spray for muscle cramps, backache and joint pain', img: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&fit=crop' }
    ]
  },
  'Clothing': {
    name: 'Clothing',
    icon: 'fa-shirt',
    color: 'bg-pink-600',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=350&fit=crop',
    items: [
      { name: 'Pure Cotton Handcrafted Anarkali Kurti', price: 899, desc: 'Breathable Jaipur hand-block printed cotton festive daily wear', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&fit=crop' },
      { name: 'Men Classic Slim-Fit Linen Casual Shirt', price: 749, desc: '100% pure premium lightweight linen in summer pastel shades', img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&fit=crop' },
      { name: 'Stretchable Comfort Fit Denim Jeans', price: 1199, desc: 'Durable indigo denim with 4-way flexibility and modern cut', img: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=400&fit=crop' }
    ]
  },
  'Electronics': {
    name: 'Electronics',
    icon: 'fa-mobile-screen',
    color: 'bg-cyan-600',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&h=350&fit=crop',
    items: [
      { name: 'boAt Rockerz Bluetooth Wireless Neckband', price: 999, desc: '30-hour battery life with ASAP fast charge and signature deep bass', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&fit=crop' },
      { name: 'Fast USB-C 65W GaN Charger Adapter', price: 799, desc: 'Universal high-speed power delivery for smartphones & laptops', img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&fit=crop' },
      { name: 'Braided 100W Fast Charging Cable 2m', price: 299, desc: 'Ultra durable nylon braided cable with reinforced bend connectors', img: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400&fit=crop' }
    ]
  },
  'Stationery': {
    name: 'Stationery',
    icon: 'fa-pen-nib',
    color: 'bg-indigo-600',
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3d368?w=600&h=350&fit=crop',
    items: [
      { name: 'Classmate Spiral Long Ruled Notebook (Pack of 4)', price: 220, desc: 'High GSM ozone-treated paper for smudge-free fountain and gel pens', img: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&fit=crop' },
      { name: 'Pilot V7 Liquid Ink Rollerball Pens (Set of 3)', price: 180, desc: 'Precision Japanese tip for silky-smooth effortless writing flow', img: 'https://images.unsplash.com/photo-1585336261026-41ff34639906?w=400&fit=crop' },
      { name: 'Faber-Castell Art & Sketching Color Set', price: 310, desc: '24 vibrant non-toxic shades with smooth blending textures', img: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&fit=crop' }
    ]
  },
  'Beauty': {
    name: 'Beauty',
    icon: 'fa-wand-magic-sparkles',
    color: 'bg-fuchsia-600',
    image: 'https://images.unsplash.com/photo-1560066984-138daaa5f7f6?w=600&h=350&fit=crop',
    items: [
      { name: 'Organic Lotus & Papaya Glow Facial Kit', price: 499, desc: '4-step herbal skin therapy for immediate bridal glow & tan removal', img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&fit=crop' },
      { name: 'Cold-Pressed Sweet Almond Hair Nourish Oil (200ml)', price: 280, desc: 'Pure vitamin E enriched oil for root strength and shine', img: 'https://images.unsplash.com/photo-1608248597359-bb5eb4fb2a64?w=400&fit=crop' },
      { name: 'Matte Liquid Lip Tint & Cheek Stain Set', price: 350, desc: '12-hour transfer-proof smudge-free natural velvet finish', img: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&fit=crop' }
    ]
  },
  'Hardware': {
    name: 'Hardware',
    icon: 'fa-hammer',
    color: 'bg-stone-600',
    image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=600&h=350&fit=crop',
    items: [
      { name: 'Compact Home DIY Tool Box Set (24 Pcs)', price: 699, desc: 'Includes hammer, pliers, screwdrivers, tester, tape and wrench', img: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=400&fit=crop' },
      { name: 'Philips 12W Warm White Energy LED Bulb (Pack of 2)', price: 210, desc: 'B22 base bright eye-comfort light with 25,000 hour lifespan', img: 'https://images.unsplash.com/photo-1550985543-f47f38aeee65?w=400&fit=crop' },
      { name: 'Waterproof Silicone Sealant & M-Seal Kit', price: 140, desc: 'Instant leak repair for sinks, pipes, tile gaps and joints', img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&fit=crop' }
    ]
  },
  'Fruits & Vegetables': {
    name: 'Fruits & Vegetables',
    icon: 'fa-carrot',
    color: 'bg-lime-600',
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&h=350&fit=crop',
    items: [
      { name: 'Farm Fresh Hydroponic Spinach & Coriander (250g)', price: 35, desc: 'Crisp pesticide-free washed leafy greens harvested this morning', img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&fit=crop' },
      { name: 'Organic Kashmiri Red Apples (1kg Box)', price: 160, desc: 'Crisp sweet juicy handpicked Grade-A valley apples', img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&fit=crop' },
      { name: 'Fresh Hybrid Vine Ripe Tomatoes (1kg)', price: 38, desc: 'Firm red tomatoes perfect for curries, salads and sauces', img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&fit=crop' }
    ]
  },
  'Footwear': {
    name: 'Footwear',
    icon: 'fa-shoe-prints',
    color: 'bg-teal-600',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=350&fit=crop',
    items: [
      { name: 'Lightweight Breathable Walking Running Shoes', price: 1299, desc: 'Air-cushioned memory foam insole for all-day comfort', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&fit=crop' },
      { name: 'Traditional Handcrafted Punjabi Leather Jutti', price: 699, desc: 'Genuine soft leather with fine golden thread embroidery', img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&fit=crop' }
    ]
  },
  'Flowers': {
    name: 'Flowers',
    icon: 'fa-seedling',
    color: 'bg-red-500',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&h=350&fit=crop',
    items: [
      { name: 'Bunch of 12 Fresh Dutch Red Roses with Gypsophila', price: 349, desc: 'Wrapped in luxury kraft paper with satin ribbon bow', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&fit=crop' },
      { name: 'Indoor Money Plant in Ceramic Self-Watering Pot', price: 220, desc: 'Air purifying lush green plant ideal for home desk and living room', img: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&fit=crop' }
    ]
  },
  'Pet Supplies': {
    name: 'Pet Supplies',
    icon: 'fa-paw',
    color: 'bg-orange-600',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=350&fit=crop',
    items: [
      { name: 'Pedigree Adult Dog Food Chicken & Veg (3kg)', price: 680, desc: 'Complete balanced nutrition with calcium, vitamins and protein', img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&fit=crop' },
      { name: 'Natural Chicken Chew Sticks (Pack of 30)', price: 199, desc: 'Healthy raw hide dental hygiene chew treat for puppies & dogs', img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&fit=crop' }
    ]
  },
  'Home Services': {
    name: 'Home Services',
    icon: 'fa-screwdriver-wrench',
    color: 'bg-sky-600',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=350&fit=crop',
    items: [
      { name: 'Complete AC Foam Jet Cleaning Service', price: 499, desc: 'Deep antibacterial indoor coil wash with pressure jet spray', img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&fit=crop' },
      { name: 'Master Electrician Home Inspection Visit', price: 199, desc: 'Troubleshooting short circuits, wiring check, switchboard replacement', img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&fit=crop' }
    ]
  },
  'Dairy & Sweets': {
    name: 'Dairy & Sweets',
    icon: 'fa-cheese',
    color: 'bg-yellow-600',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&h=350&fit=crop',
    items: [
      { name: 'Fresh Desi Cow Ghee (1L Pet Jar)', price: 620, desc: 'Traditional bilona method pure aromatic golden cow ghee', img: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&fit=crop' },
      { name: 'Kaju Katli Special Sweet Box (500g)', price: 460, desc: 'Made with 100% Goan cashews and pure silver vark coating', img: 'https://images.unsplash.com/photo-1559703248-dcaaec9a6914?w=400&fit=crop' },
      { name: 'Fresh Malai Paneer (500g Block)', price: 180, desc: 'Soft melt-in-mouth cottage cheese prepared fresh daily', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&fit=crop' }
    ]
  },
  'Cafe & Snacks': {
    name: 'Cafe & Snacks',
    icon: 'fa-mug-hot',
    color: 'bg-purple-600',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=350&fit=crop',
    items: [
      { name: 'Special Masala Kulhad Chai & Bun Maska', price: 75, desc: 'Cardamom ginger brewed hot tea served in terracotta pot with toasted butter bun', img: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&fit=crop' },
      { name: 'Cheesy Peri-Peri Loaded French Fries', price: 130, desc: 'Crisp golden potato fries tossed in zesty peri-peri spices with warm cheese dip', img: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400&fit=crop' },
      { name: 'Cold Coffee with Choco Ice Cream Scoop', price: 110, desc: 'Thick creamy blended espresso topped with dark chocolate syrup', img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&fit=crop' }
    ]
  }
};

export const INITIAL_USERS: User[] = [
  { user_id: 1, name: 'Rahul Sharma', email: 'customer@locallift.com', phone: '9876543210', user_type: 'customer', location: 'Model Town, Ludhiana' },
  { user_id: 2, name: 'Priya Verma', email: 'priya@locallift.com', phone: '9876543211', user_type: 'customer', location: 'Civil Lines' },
  { user_id: 3, name: 'Ramesh Sharma', email: 'vendor@locallift.com', phone: '9812345678', user_type: 'vendor', location: 'Main Market Square' },
  { user_id: 999, name: 'Platform Administrator', email: 'admin@locallift.com', phone: '9999900000', user_type: 'admin', location: 'HQ Control' }
];

// Reference base coordinates (Model Town, Ludhiana / Connaught Place)
export const DEFAULT_LAT = 30.9010;
export const DEFAULT_LON = 75.8573;
export const DEFAULT_ADDR = "Model Town Market, Ludhiana, Punjab";

export const INITIAL_VENDORS: Vendor[] = [
  {
    vendor_id: 1,
    owner_user_id: 3,
    business_name: 'Sharma Bakery & Confectionery',
    owner_name: 'Ramesh Sharma',
    category: 'Bakery',
    address: 'Shop 4, Main Market Square',
    city: 'Ludhiana',
    latitude: 30.9025,
    longitude: 75.8590,
    phone: '+91 9812345678',
    email: 'vendor@locallift.com',
    opening_hours: '7:00 AM',
    closing_time: '10:30 PM',
    rating: 4.8,
    description: 'Famous artisan bakery since 1998. Fresh oven-baked cakes, pastries, breads, cookies and savory patties daily.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=350&fit=crop',
    is_open: true,
    status: 'approved'
  },
  {
    vendor_id: 2,
    owner_user_id: 4,
    business_name: 'Gupta Super General Store',
    owner_name: 'Suresh Gupta',
    category: 'Grocery',
    address: 'Plot 18, Central Shopping Complex',
    city: 'Ludhiana',
    latitude: 30.8995,
    longitude: 75.8602,
    phone: '+91 9823456789',
    email: 'gupta.store@email.com',
    opening_hours: '7:30 AM',
    closing_time: '11:00 PM',
    rating: 4.6,
    description: 'Hyperlocal grocery store stocking all staples, spices, dairy products, organic grains and daily household essentials.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=350&fit=crop',
    is_open: true,
    status: 'approved'
  },
  {
    vendor_id: 3,
    owner_user_id: 5,
    business_name: 'Royal Tandoor & Curries',
    owner_name: 'Chef Vikram Gill',
    category: 'Restaurant',
    address: '22, Food Street, Near City Park',
    city: 'Ludhiana',
    latitude: 30.9051,
    longitude: 75.8550,
    phone: '+91 9878901234',
    email: 'royaltandoor@email.com',
    opening_hours: '11:00 AM',
    closing_time: '11:30 PM',
    rating: 4.9,
    description: 'Authentic North Indian, Mughlai curries, fragrant biryanis, tandoori appetizers and freshly baked naans.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=350&fit=crop',
    is_open: true,
    status: 'approved'
  },
  {
    vendor_id: 4,
    owner_user_id: 6,
    business_name: 'Fashion Point & Boutique',
    owner_name: 'Kavita Mehta',
    category: 'Clothing',
    address: '55, Fashion Mall, 1st Floor',
    city: 'Ludhiana',
    latitude: 30.8975,
    longitude: 75.8532,
    phone: '+91 9834567890',
    email: 'fashionpoint@email.com',
    opening_hours: '10:00 AM',
    closing_time: '9:30 PM',
    rating: 4.7,
    description: 'Curated ethnic kurtis, trendy menswear, denim jeans, western wear and seasonal festival apparel.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=350&fit=crop',
    is_open: true,
    status: 'approved'
  },
  {
    vendor_id: 5,
    owner_user_id: 7,
    business_name: 'City 24/7 Chemist & Healthcare',
    owner_name: 'Dr. Anil Kumar',
    category: 'Pharmacy',
    address: 'Shop 1, Near Metro Hospital Gate',
    city: 'Ludhiana',
    latitude: 30.9030,
    longitude: 75.8535,
    phone: '+91 9845678901',
    email: 'citychemist@email.com',
    opening_hours: 'Open 24x7',
    closing_time: 'Open 24x7',
    rating: 4.9,
    description: '24/7 licensed pharmacy with certified pharmacists. Wide inventory of prescription medicines and supplements.',
    image: 'https://images.unsplash.com/photo-1586015555751-63c2998a698a?w=600&h=350&fit=crop',
    is_open: true,
    status: 'approved'
  },
  {
    vendor_id: 6,
    owner_user_id: 8,
    business_name: 'Modern Tech & Mobile Hub',
    owner_name: 'Vijay Khanna',
    category: 'Electronics',
    address: '104, Digital Market Plaza',
    city: 'Ludhiana',
    latitude: 30.8958,
    longitude: 75.8594,
    phone: '+91 9856789012',
    email: 'moderntech@email.com',
    opening_hours: '10:00 AM',
    closing_time: '9:00 PM',
    rating: 4.5,
    description: 'Original smartphones, wireless headphones, fast chargers, power banks and quick accessories.',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&h=350&fit=crop',
    is_open: true,
    status: 'approved'
  },
  {
    vendor_id: 7,
    owner_user_id: 9,
    business_name: 'ABC Books & Stationery',
    owner_name: 'Mohan Das',
    category: 'Stationery',
    address: '12, College Road Campus Market',
    city: 'Ludhiana',
    latitude: 30.9045,
    longitude: 75.8618,
    phone: '+91 9867890123',
    email: 'abcstationery@email.com',
    opening_hours: '8:30 AM',
    closing_time: '8:30 PM',
    rating: 4.6,
    description: 'All academic notebooks, fine art paints, premium pens, school bags, craft accessories and office stationery.',
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3d368?w=600&h=350&fit=crop',
    is_open: true,
    status: 'approved'
  },
  {
    vendor_id: 8,
    owner_user_id: 10,
    business_name: 'Glamour Unisex Salon & Spa',
    owner_name: 'Sunita Verma',
    category: 'Beauty',
    address: '33, Green Avenue Arcade',
    city: 'Ludhiana',
    latitude: 30.8982,
    longitude: 75.8554,
    phone: '+91 9889012345',
    email: 'glamourbeauty@email.com',
    opening_hours: '9:30 AM',
    closing_time: '8:30 PM',
    rating: 4.7,
    description: 'Luxury grooming, professional haircuts, organic facials, bridal makeup, manicures and skin care treatments.',
    image: 'https://images.unsplash.com/photo-1560066984-138daaa5f7f6?w=600&h=350&fit=crop',
    is_open: true,
    status: 'approved'
  },
  {
    vendor_id: 9,
    owner_user_id: 11,
    business_name: 'National Hardware & Electricals',
    owner_name: 'Rajesh Patel',
    category: 'Hardware',
    address: '88, Industrial Market Road',
    city: 'Ludhiana',
    latitude: 30.9060,
    longitude: 75.8605,
    phone: '+91 9890123456',
    email: 'nationalhardware@email.com',
    opening_hours: '8:00 AM',
    closing_time: '8:00 PM',
    rating: 4.4,
    description: 'Tools, power drills, pipes, fittings, sanitary ware, LED lighting, switches and home renovation hardware.',
    image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=600&h=350&fit=crop',
    is_open: true,
    status: 'approved'
  },
  {
    vendor_id: 10,
    owner_user_id: 12,
    business_name: 'Fresh Farm Fruits & Organic Veg',
    owner_name: 'Mahesh Yadav',
    category: 'Fruits & Vegetables',
    address: 'Stall 5, Farmer Fresh Mandi',
    city: 'Ludhiana',
    latitude: 30.9002,
    longitude: 75.8548,
    phone: '+91 9811223344',
    email: 'farmfresh@email.com',
    opening_hours: '6:30 AM',
    closing_time: '9:30 PM',
    rating: 4.8,
    description: 'Direct from local farms! 100% fresh leafy greens, seasonal organic fruits, exotic vegetables and hydroponic herbs.',
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&h=350&fit=crop',
    is_open: true,
    status: 'approved'
  },
  {
    vendor_id: 11,
    owner_user_id: 13,
    business_name: 'StepIn Designer Footwear',
    owner_name: 'Aman Kapoor',
    category: 'Footwear',
    address: 'Shop 19, City Square Mall',
    city: 'Ludhiana',
    latitude: 30.9048,
    longitude: 75.8525,
    phone: '+91 9822334455',
    email: 'stepinfootwear@email.com',
    opening_hours: '10:30 AM',
    closing_time: '9:30 PM',
    rating: 4.5,
    description: 'Comfortable running sneakers, formal leather shoes, traditional juttis, casual sandals and orthopedic insoles.',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=350&fit=crop',
    is_open: true,
    status: 'approved'
  },
  {
    vendor_id: 12,
    owner_user_id: 14,
    business_name: 'Petals & Blooms Florist',
    owner_name: 'Pooja Joshi',
    category: 'Flowers',
    address: 'Corner Booth, Civil Lines Gate',
    city: 'Ludhiana',
    latitude: 30.8968,
    longitude: 75.8588,
    phone: '+91 9833445566',
    email: 'petalsblooms@email.com',
    opening_hours: '7:00 AM',
    closing_time: '9:00 PM',
    rating: 4.9,
    description: 'Exotic flower bouquets, fresh red roses, custom wedding decorations, indoor potted plants and gift baskets.',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&h=350&fit=crop',
    is_open: true,
    status: 'approved'
  },
  {
    vendor_id: 13,
    owner_user_id: 15,
    business_name: 'Happy Tails Pet Care & Store',
    owner_name: 'Dr. Rohit Mehra',
    category: 'Pet Supplies',
    address: 'Shop 7, Sunrise Plaza',
    city: 'Ludhiana',
    latitude: 30.9038,
    longitude: 75.8622,
    phone: '+91 9844556677',
    email: 'happytails@email.com',
    opening_hours: '9:00 AM',
    closing_time: '8:30 PM',
    rating: 4.7,
    description: 'Premium dog and cat nutrition, healthy treats, grooming essentials, chew toys, cozy pet beds and leashes.',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=350&fit=crop',
    is_open: true,
    status: 'approved'
  },
  {
    vendor_id: 14,
    owner_user_id: 16,
    business_name: 'QuickFix Appliance & Home Services',
    owner_name: 'Manoj Carpenter',
    category: 'Home Services',
    address: '15, Service Lane, Block C',
    city: 'Ludhiana',
    latitude: 30.8985,
    longitude: 75.8610,
    phone: '+91 9855667788',
    email: 'quickfix@email.com',
    opening_hours: '8:00 AM',
    closing_time: '8:00 PM',
    rating: 4.6,
    description: 'Verified local electricians, plumbers, AC technicians, carpentry repair and quick doorstep handyman service.',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=350&fit=crop',
    is_open: true,
    status: 'approved'
  },
  {
    vendor_id: 15,
    owner_user_id: 17,
    business_name: 'Bikaner Sweets & Pure Dairy',
    owner_name: 'Ghanshyam Sweetmaker',
    category: 'Dairy & Sweets',
    address: 'Shop 10, Clock Tower Chowk',
    city: 'Ludhiana',
    latitude: 30.9032,
    longitude: 75.8562,
    phone: '+91 9866778899',
    email: 'bikanersweets@email.com',
    opening_hours: '7:00 AM',
    closing_time: '10:30 PM',
    rating: 4.9,
    description: 'Traditional pure ghee mithai, Kaju Katli, Rasgulla, hot samosas, jalebi, fresh paneer and pure full-cream milk.',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&h=350&fit=crop',
    is_open: true,
    status: 'approved'
  },
  {
    vendor_id: 16,
    owner_user_id: 18,
    business_name: 'Chai & Stories Cafe',
    owner_name: 'Tarun Sethi',
    category: 'Cafe & Snacks',
    address: 'Corner 3, Youth Hub Boulevard',
    city: 'Ludhiana',
    latitude: 30.8990,
    longitude: 75.8538,
    phone: '+91 9877889900',
    email: 'chaistories@email.com',
    opening_hours: '8:00 AM',
    closing_time: '11:00 PM',
    rating: 4.8,
    description: 'Cozy neighbourhood cafe serving kulhad chai, cappuccino, loaded cheese fries, grilled sandwiches and shakes.',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=350&fit=crop',
    is_open: true,
    status: 'approved'
  },
  // Sample Pending Vendor for Admin Review Demonstration
  {
    vendor_id: 17,
    owner_user_id: 19,
    business_name: 'Punjab Green Spice Kitchen',
    owner_name: 'Harpreet Sandhu',
    category: 'Restaurant',
    address: 'Booth 45, Sarabha Nagar Market',
    city: 'Ludhiana',
    latitude: 30.8930,
    longitude: 75.8420,
    phone: '+91 9876501234',
    email: 'punjabgreen@email.com',
    opening_hours: '11:00 AM',
    closing_time: '11:00 PM',
    rating: 4.5,
    description: 'Authentic Punjabi homestyle tiffin and dine-in with farm fresh ingredients.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=350&fit=crop',
    is_open: true,
    status: 'pending'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // Sharma Bakery (vendor_id=1)
  { product_id: 101, vendor_id: 1, product_name: 'Chocolate Truffle Celebration Cake (1kg)', category: 'Cakes', price: 550, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop', availability: 1, description: 'Rich Belgian dark chocolate cake with smooth chocolate ganache frosting.' },
  { product_id: 102, vendor_id: 1, product_name: 'Pineapple Fresh Cream Cake (500g)', category: 'Cakes', price: 380, image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop', availability: 1, description: 'Light vanilla sponge layered with juicy pineapple chunks and dairy cream.' },
  { product_id: 103, vendor_id: 1, product_name: 'Royal Red Velvet Cake (1kg)', category: 'Cakes', price: 650, image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=400&h=300&fit=crop', availability: 1, description: 'Classic red velvet crumb with whipped cream cheese icing.' },
  { product_id: 104, vendor_id: 1, product_name: 'Belgian Chocolate Pastry (Pack of 2)', category: 'Pastries', price: 140, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop', availability: 1, description: 'Decadent layered chocolate pastry topped with chocolate shavings.' },
  { product_id: 105, vendor_id: 1, product_name: 'Fresh Blueberry Muffin (Pack of 2)', category: 'Bakery Snacks', price: 110, image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=300&fit=crop', availability: 1, description: 'Soft golden baked muffins packed with real blueberries.' },
  { product_id: 106, vendor_id: 1, product_name: 'Spicy Paneer Puff Patties (Pack of 2)', category: 'Bakery Snacks', price: 70, image: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400&h=300&fit=crop', availability: 1, description: 'Crispy multi-layered puff pastry stuffed with spiced cottage cheese.' },
  { product_id: 107, vendor_id: 1, product_name: 'Artisan Sourdough Loaf (400g)', category: 'Breads', price: 120, image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&h=300&fit=crop', availability: 1, description: 'Crusty artisan sourdough bread naturally fermented for 24 hours.' },

  // Gupta Super General Store (vendor_id=2)
  { product_id: 201, vendor_id: 2, product_name: 'Fortune Rozana Basmati Rice (5kg)', category: 'Grains & Rice', price: 340, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop', availability: 1, description: 'Long grain aromatic Basmati rice ideal for daily meals and biryani.' },
  { product_id: 202, vendor_id: 2, product_name: 'Aashirvaad Shudh Chakki Atta (10kg)', category: 'Flours & Staples', price: 385, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop', availability: 1, description: '100% whole wheat chakki-ground flour for soft rotis.' },
  { product_id: 203, vendor_id: 2, product_name: 'Tata Salt Vacuum Evaporated (1kg)', category: 'Staples', price: 28, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop', availability: 1, description: 'Iodized crystal salt for wholesome daily cooking.' },
  { product_id: 204, vendor_id: 2, product_name: 'Amul Salted Butter (500g)', category: 'Dairy', price: 275, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=300&fit=crop', availability: 1, description: 'Pasteurized pure milk butter from Amul.' },
  { product_id: 205, vendor_id: 2, product_name: 'Tata Tea Gold Premium Blend (500g)', category: 'Beverages', price: 260, image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=400&h=300&fit=crop', availability: 1, description: 'Exquisite CTC black tea blended with gentle long leaves.' },

  // Royal Tandoor & Curries (vendor_id=3)
  { product_id: 301, vendor_id: 3, product_name: 'Butter Chicken Special Handi', category: 'Main Course', price: 340, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop', availability: 1, description: 'Tender roasted chicken simmered in rich creamy tomato cashew gravy.' },
  { product_id: 302, vendor_id: 3, product_name: 'Dal Makhani Slow-Cooked (350ml)', category: 'Main Course', price: 240, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop', availability: 1, description: 'Black lentils cooked overnight on tandoor embers with pure butter and cream.' },
  { product_id: 303, vendor_id: 3, product_name: 'Paneer Tikka Shashlik (6 pcs)', category: 'Starters', price: 260, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=300&fit=crop', availability: 1, description: 'Char-grilled fresh cottage cheese cubes with onions and bell peppers.' },
  { product_id: 304, vendor_id: 3, product_name: 'Hyderabadi Dum Biryani (Full)', category: 'Rice & Biryani', price: 290, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop', availability: 1, description: 'Fragrant long grain rice cooked in sealed pot with special spices and raita.' },

  // City 24/7 Chemist (vendor_id=5)
  { product_id: 501, vendor_id: 5, product_name: 'Dolo 650mg Paracetamol Tablets (15 Tab)', category: 'Medicines', price: 34, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop', availability: 1, description: 'Fast action paracetamol 650mg for relief from body ache and fever.' },
  { product_id: 502, vendor_id: 5, product_name: 'Daily Multivitamin & Zinc (60 Tablets)', category: 'Supplements', price: 380, image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&h=300&fit=crop', availability: 1, description: 'Complete immunity boost with Vitamin C, D3, B-Complex and Zinc.' },
  { product_id: 503, vendor_id: 5, product_name: 'Dettol Antiseptic Liquid (500ml)', category: 'First Aid', price: 195, image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&h=300&fit=crop', availability: 1, description: 'Trusted antiseptic liquid for first aid, cuts and disinfectant use.' },

  // Bikaner Sweets & Pure Dairy (vendor_id=15)
  { product_id: 1501, vendor_id: 15, product_name: 'Kaju Katli Pure Silver Vark (500g)', category: 'Sweets', price: 480, image: 'https://images.unsplash.com/photo-1559703248-dcaaec9a6914?w=400&h=300&fit=crop', availability: 1, description: 'Diamond cut cashew fudge prepared with 100% premium Goan cashews.' },
  { product_id: 1502, vendor_id: 15, product_name: 'Fresh Malai Paneer (500g Block)', category: 'Dairy', price: 190, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=300&fit=crop', availability: 1, description: 'Soft, melt-in-the-mouth cottage cheese made from fresh morning milk.' },

  // Chai & Stories Cafe (vendor_id=16)
  { product_id: 1601, vendor_id: 16, product_name: 'Signature Masala Kulhad Chai (2 Cups)', category: 'Beverages', price: 80, image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop', availability: 1, description: 'Earthen pot brewed spiced tea with ginger, cardamom and saffron.' },
  { product_id: 1602, vendor_id: 16, product_name: 'Overloaded Cheese & Corn Grilled Sandwich', category: 'Snacks', price: 140, image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400&h=300&fit=crop', availability: 1, description: 'Jumbo crispy butter toasted sandwich filled with mozzarella and sweet corn.' }
];

export const INITIAL_OFFERS: Offer[] = [
  {
    offer_id: 1,
    vendor_id: 1,
    business_name: 'Sharma Bakery & Confectionery',
    title: 'Weekend Cake Carnival - 25% OFF',
    discount: '25% OFF',
    description: 'Get 25% flat discount on all premium birthday & celebration cakes.',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    status: 'active'
  },
  {
    offer_id: 2,
    vendor_id: 1,
    business_name: 'Sharma Bakery & Confectionery',
    title: 'Buy 2 Pastries Get 1 Free',
    discount: 'B2G1 FREE',
    description: 'Buy any two delicious chocolate pastries and get one completely free!',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    status: 'active'
  },
  {
    offer_id: 3,
    vendor_id: 2,
    business_name: 'Gupta Super General Store',
    title: 'Super Saver Grocery - ₹100 Cashback',
    discount: '₹100 OFF',
    description: 'Save ₹100 on your monthly pantry basket order above ₹800.',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    status: 'active'
  },
  {
    offer_id: 4,
    vendor_id: 3,
    business_name: 'Royal Tandoor & Curries',
    title: 'Tandoor Treat - 20% OFF Handi Curries',
    discount: '20% OFF',
    description: 'Special discount on all main course gravies and biryanis this week.',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    status: 'active'
  },
  {
    offer_id: 5,
    vendor_id: 5,
    business_name: 'City 24/7 Chemist & Healthcare',
    title: 'Wellness First - 15% OFF Supplements',
    discount: '15% OFF',
    description: 'Instant 15% savings on all multivitamins and health monitors.',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    status: 'active'
  },
  {
    offer_id: 6,
    vendor_id: 15,
    business_name: 'Bikaner Sweets & Pure Dairy',
    title: 'Sweet Celebrations - ₹50 OFF Sweets',
    discount: '₹50 OFF',
    description: 'Save ₹50 on every 1kg box of Kaju Katli and traditional mithai.',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    status: 'active'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    order_id: 101,
    user_id: 1,
    vendor_id: 1,
    customer_name: 'Rahul Sharma',
    customer_phone: '9876543210',
    business_name: 'Sharma Bakery & Confectionery',
    total_amount: 550,
    status: 'delivered',
    notes: 'Please write Happy Birthday Parth on the cake',
    created_at: '2026-10-28 09:15',
    delivery_address: 'House 14B, Model Town, Ludhiana',
    items: [
      { product_id: 101, product_name: 'Chocolate Truffle Celebration Cake (1kg)', price: 550, quantity: 1 }
    ]
  },
  {
    order_id: 102,
    user_id: 1,
    vendor_id: 1,
    customer_name: 'Priya Verma',
    customer_phone: '9876543211',
    business_name: 'Sharma Bakery & Confectionery',
    total_amount: 210,
    status: 'preparing',
    notes: 'Please pack napkins and cutlery',
    created_at: '2026-10-28 10:20',
    delivery_address: 'Flat 202, Green Avenue, Ludhiana',
    items: [
      { product_id: 104, product_name: 'Belgian Chocolate Pastry (Pack of 2)', price: 140, quantity: 1 },
      { product_id: 106, product_name: 'Spicy Paneer Puff Patties (Pack of 2)', price: 70, quantity: 1 }
    ]
  },
  {
    order_id: 103,
    user_id: 2,
    vendor_id: 3,
    customer_name: 'Vikram Gill',
    customer_phone: '9811223344',
    business_name: 'Royal Tandoor & Curries',
    total_amount: 530,
    status: 'pending',
    notes: 'Make it medium spicy',
    created_at: '2026-10-28 10:30',
    delivery_address: 'Sector 32, Urban Estate, Ludhiana',
    items: [
      { product_id: 301, product_name: 'Butter Chicken Special Handi', price: 340, quantity: 1 },
      { product_id: 302, product_name: 'Dal Makhani Slow-Cooked (350ml)', price: 240, quantity: 1 }
    ]
  }
];

export const INITIAL_REVIEWS: Review[] = [
  { review_id: 1, user_id: 1, vendor_id: 1, user_name: 'Aarav Sharma', rating: 5, comment: 'Extremely fresh quality and super fast neighborhood delivery within 15 minutes! Freshly baked crust and warm patties.' },
  { review_id: 2, user_id: 2, vendor_id: 1, user_name: 'Pooja Verma', rating: 5, comment: 'Best bakery in our area. Supporting small local vendors through LocalLift has been a joy!' },
  { review_id: 3, user_id: 3, vendor_id: 1, user_name: 'Gurpreet Singh', rating: 4, comment: 'Clean packaging, authentic items and very polite owner.' },
  { review_id: 4, user_id: 1, vendor_id: 2, user_name: 'Rohan Mehra', rating: 5, comment: 'Gupta Store delivered our grocery order in 10 minutes without charging extra delivery fee.' },
  { review_id: 5, user_id: 2, vendor_id: 3, user_name: 'Simran Kaur', rating: 5, comment: 'Delicious royal biryani and hot naans! Far better than distant dark kitchens.' }
];

// Haversine distance formula in kilometers
export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1000) / 1000;
}

export function formatDistance(distKm: number): { formatted: string; timeEstimate: string; distM: number } {
  const distM = Math.round(distKm * 1000);
  let formatted = '';
  let timeEstimate = '';

  if (distKm < 1.0) {
    formatted = `${distM} m away`;
    const walkMin = Math.max(1, Math.round(distM / 75));
    timeEstimate = `${walkMin} min walk`;
  } else {
    formatted = `${distKm.toFixed(1)} km away`;
    const driveMin = Math.max(2, Math.round(distKm * 2.5));
    timeEstimate = `${driveMin} min drive`;
  }

  return { formatted, timeEstimate, distM };
}
