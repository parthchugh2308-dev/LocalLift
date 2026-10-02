package com.example.locallift.data

import com.example.locallift.data.model.OfferEntity
import com.example.locallift.data.model.OrderEntity
import com.example.locallift.data.model.OrderItemEntity
import com.example.locallift.data.model.ProductEntity
import com.example.locallift.data.model.ReviewEntity
import com.example.locallift.data.model.VendorEntity

object InitialDataSeeder {

    fun getInitialVendors(): List<VendorEntity> = listOf(
        VendorEntity(
            id = 1,
            businessName = "Sharma Bakery & Confectionery",
            ownerName = "Ramesh Sharma",
            category = "Bakery",
            address = "Shop 4, Main Market Square",
            city = "Local Market",
            latitude = 28.6321,
            longitude = 77.2194,
            phone = "+91 9812345678",
            email = "sharma.bakery@email.com",
            openingHours = "7:00 AM",
            closingTime = "10:30 PM",
            rating = 4.8,
            description = "Famous artisan bakery since 1998. Fresh oven-baked cakes, pastries, breads, cookies and savory patties daily.",
            imageUrl = "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=350&fit=crop",
            isOpen = true
        ),
        VendorEntity(
            id = 2,
            businessName = "Gupta Super General Store",
            ownerName = "Suresh Gupta",
            category = "Grocery",
            address = "Plot 18, Central Shopping Complex",
            city = "Local Market",
            latitude = 28.6345,
            longitude = 77.2210,
            phone = "+91 9823456789",
            email = "gupta.store@email.com",
            openingHours = "7:30 AM",
            closingTime = "11:00 PM",
            rating = 4.6,
            description = "Hyperlocal grocery store stocking all staples, spices, dairy products, organic grains and daily household essentials.",
            imageUrl = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=350&fit=crop",
            isOpen = true
        ),
        VendorEntity(
            id = 3,
            businessName = "Royal Tandoor & Curries",
            ownerName = "Chef Vikram Gill",
            category = "Restaurant",
            address = "22, Food Street, Near City Park",
            city = "Local Market",
            latitude = 28.6360,
            longitude = 77.2170,
            phone = "+91 9878901234",
            email = "royaltandoor@email.com",
            openingHours = "11:00 AM",
            closingTime = "11:30 PM",
            rating = 4.9,
            description = "Authentic North Indian, Mughlai curries, fragrant biryanis, tandoori appetizers and freshly baked naans.",
            imageUrl = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=350&fit=crop",
            isOpen = true
        ),
        VendorEntity(
            id = 4,
            businessName = "City 24/7 Chemist & Healthcare",
            ownerName = "Dr. Anil Kumar",
            category = "Pharmacy",
            address = "Shop 1, Near Metro Hospital Gate",
            city = "Local Market",
            latitude = 28.6310,
            longitude = 77.2230,
            phone = "+91 9845678901",
            email = "citychemist@email.com",
            openingHours = "Open 24x7",
            closingTime = "Open 24x7",
            rating = 4.9,
            description = "24/7 licensed pharmacy with certified pharmacists. Wide inventory of prescription medicines, wellness supplements and first-aid kits.",
            imageUrl = "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&h=350&fit=crop",
            isOpen = true
        ),
        VendorEntity(
            id = 5,
            businessName = "Fashion Point & Boutique",
            ownerName = "Kavita Mehta",
            category = "Clothing",
            address = "55, Fashion Mall, 1st Floor",
            city = "Local Market",
            latitude = 28.6295,
            longitude = 77.2155,
            phone = "+91 9834567890",
            email = "fashionpoint@email.com",
            openingHours = "10:00 AM",
            closingTime = "9:30 PM",
            rating = 4.7,
            description = "Curated ethnic kurtis, trendy menswear, denim jeans, western wear and seasonal festival apparel.",
            imageUrl = "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=350&fit=crop",
            isOpen = true
        ),
        VendorEntity(
            id = 6,
            businessName = "Modern Tech & Mobile Hub",
            ownerName = "Vijay Khanna",
            category = "Electronics",
            address = "104, Digital Market Plaza",
            city = "Local Market",
            latitude = 28.6270,
            longitude = 77.2215,
            phone = "+91 9856789012",
            email = "moderntech@email.com",
            openingHours = "10:00 AM",
            closingTime = "9:00 PM",
            rating = 4.5,
            description = "Original smartphones, wireless headphones, fast chargers, power banks, computer peripherals and repair services.",
            imageUrl = "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=350&fit=crop",
            isOpen = true
        ),
        VendorEntity(
            id = 7,
            businessName = "Fresh Farm Organic Mandi",
            ownerName = "Mahesh Yadav",
            category = "Fruits & Vegetables",
            address = "Stall 5, Farmer Fresh Market",
            city = "Local Market",
            latitude = 28.6335,
            longitude = 77.2165,
            phone = "+91 9811223344",
            email = "farmfresh@email.com",
            openingHours = "6:30 AM",
            closingTime = "9:30 PM",
            rating = 4.8,
            description = "Direct from local farms! 100% fresh leafy greens, seasonal organic fruits, exotic vegetables and herbs.",
            imageUrl = "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&h=350&fit=crop",
            isOpen = true
        ),
        VendorEntity(
            id = 8,
            businessName = "Bikaner Sweets & Pure Dairy",
            ownerName = "Ghanshyam Sweetmaker",
            category = "Dairy & Sweets",
            address = "Shop 10, Clock Tower Chowk",
            city = "Local Market",
            latitude = 28.6350,
            longitude = 77.2185,
            phone = "+91 9866778899",
            email = "bikanersweets@email.com",
            openingHours = "7:00 AM",
            closingTime = "10:30 PM",
            rating = 4.9,
            description = "Traditional pure ghee mithai, Kaju Katli, Rasgulla, hot samosas, jalebi, fresh paneer and pure full-cream milk.",
            imageUrl = "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&h=350&fit=crop",
            isOpen = true
        ),
        VendorEntity(
            id = 9,
            businessName = "Chai & Stories Cafe",
            ownerName = "Tarun Sethi",
            category = "Cafe & Snacks",
            address = "Corner 3, Youth Hub Boulevard",
            city = "Local Market",
            latitude = 28.6315,
            longitude = 77.2175,
            phone = "+91 9877889900",
            email = "chaistories@email.com",
            openingHours = "8:00 AM",
            closingTime = "11:00 PM",
            rating = 4.8,
            description = "Cozy neighbourhood cafe serving kulhad chai, cappuccino, loaded cheese fries, grilled sandwiches and shakes.",
            imageUrl = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=350&fit=crop",
            isOpen = true
        ),
        VendorEntity(
            id = 10,
            businessName = "ABC Books & Office Stationery",
            ownerName = "Mohan Das",
            category = "Stationery",
            address = "12, College Road Campus Market",
            city = "Local Market",
            latitude = 28.6375,
            longitude = 77.2225,
            phone = "+91 9867890123",
            email = "abcstationery@email.com",
            openingHours = "8:30 AM",
            closingTime = "8:30 PM",
            rating = 4.6,
            description = "Academic notebooks, fine art paints, premium pens, school supplies, art and craft tools.",
            imageUrl = "https://images.unsplash.com/photo-1583485088034-697b5a541b10?w=600&h=350&fit=crop",
            isOpen = true
        ),
        VendorEntity(
            id = 11,
            businessName = "Glamour Unisex Salon & Spa",
            ownerName = "Sunita Verma",
            category = "Beauty",
            address = "33, Green Avenue Arcade",
            city = "Local Market",
            latitude = 28.6285,
            longitude = 77.2205,
            phone = "+91 9889012345",
            email = "glamourbeauty@email.com",
            openingHours = "9:30 AM",
            closingTime = "8:30 PM",
            rating = 4.7,
            description = "Luxury grooming, professional haircuts, organic facials, skin care treatments and relaxing spa services.",
            imageUrl = "https://images.unsplash.com/photo-1560066984-138daaa5f7f6?w=600&h=350&fit=crop",
            isOpen = true
        ),
        VendorEntity(
            id = 12,
            businessName = "National Hardware & Electricals",
            ownerName = "Rajesh Patel",
            category = "Hardware",
            address = "88, Industrial Market Road",
            city = "Local Market",
            latitude = 28.6365,
            longitude = 77.2235,
            phone = "+91 9890123456",
            email = "nationalhardware@email.com",
            openingHours = "8:00 AM",
            closingTime = "8:00 PM",
            rating = 4.4,
            description = "Hand tools, power drills, pipes, fittings, sanitary ware, LED lighting, switches and renovation supplies.",
            imageUrl = "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=600&h=350&fit=crop",
            isOpen = true
        ),
        VendorEntity(
            id = 13,
            businessName = "Petals & Blooms Florist",
            ownerName = "Pooja Joshi",
            category = "Flowers",
            address = "Corner Booth, Civil Lines Gate",
            city = "Local Market",
            latitude = 28.6305,
            longitude = 77.2160,
            phone = "+91 9833445566",
            email = "petalsblooms@email.com",
            openingHours = "7:00 AM",
            closingTime = "9:00 PM",
            rating = 4.9,
            description = "Exotic flower bouquets, fresh red roses, custom wedding decorations and indoor potted plants.",
            imageUrl = "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&h=350&fit=crop",
            isOpen = true
        ),
        VendorEntity(
            id = 14,
            businessName = "Happy Tails Pet Care & Store",
            ownerName = "Dr. Rohit Mehra",
            category = "Pet Supplies",
            address = "Shop 7, Sunrise Plaza",
            city = "Local Market",
            latitude = 28.6340,
            longitude = 77.2245,
            phone = "+91 9844556677",
            email = "happytails@email.com",
            openingHours = "9:00 AM",
            closingTime = "8:30 PM",
            rating = 4.7,
            description = "Premium dog and cat nutrition, healthy treats, grooming essentials, chew toys, cozy pet beds and accessories.",
            imageUrl = "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=350&fit=crop",
            isOpen = true
        ),
        VendorEntity(
            id = 15,
            businessName = "StepIn Designer Footwear",
            ownerName = "Aman Kapoor",
            category = "Footwear",
            address = "Shop 19, City Square Mall",
            city = "Local Market",
            latitude = 28.6275,
            longitude = 77.2180,
            phone = "+91 9822334455",
            email = "stepinfootwear@email.com",
            openingHours = "10:30 AM",
            closingTime = "9:30 PM",
            rating = 4.5,
            description = "Comfortable running sneakers, formal leather shoes, traditional juttis, casual sandals and insoles.",
            imageUrl = "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=350&fit=crop",
            isOpen = true
        ),
        VendorEntity(
            id = 16,
            businessName = "QuickFix Appliance & Home Services",
            ownerName = "Manoj Carpenter",
            category = "Home Services",
            address = "15, Service Lane, Block C",
            city = "Local Market",
            latitude = 28.6330,
            longitude = 77.2250,
            phone = "+91 9855667788",
            email = "quickfix@email.com",
            openingHours = "8:00 AM",
            closingTime = "8:00 PM",
            rating = 4.6,
            description = "Verified local electricians, plumbers, AC technicians, carpentry repair and quick doorstep handyman service.",
            imageUrl = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=350&fit=crop",
            isOpen = true
        )
    )

    fun getInitialProducts(): List<ProductEntity> = listOf(
        // Sharma Bakery (vendorId = 1)
        ProductEntity(vendorId = 1, name = "Chocolate Truffle Celebration Cake (1kg)", category = "Bakery", price = 550.0, description = "Rich Belgian dark chocolate cake with smooth chocolate ganache frosting.", imageUrl = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&fit=crop"),
        ProductEntity(vendorId = 1, name = "Pineapple Fresh Cream Cake (500g)", category = "Bakery", price = 380.0, description = "Light vanilla sponge layered with juicy pineapple chunks and fresh cream.", imageUrl = "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&fit=crop"),
        ProductEntity(vendorId = 1, name = "Artisan Sourdough Loaf (400g)", category = "Bakery", price = 120.0, description = "Crusty artisan sourdough bread naturally fermented for 24 hours.", imageUrl = "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&fit=crop"),
        ProductEntity(vendorId = 1, name = "Belgian Chocolate Pastry (Pack of 2)", category = "Bakery", price = 140.0, description = "Decadent layered chocolate pastry topped with chocolate shavings.", imageUrl = "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&fit=crop"),
        ProductEntity(vendorId = 1, name = "Spicy Paneer Puff Patties (Pack of 2)", category = "Bakery", price = 70.0, description = "Crispy multi-layered puff pastry stuffed with spiced cottage cheese.", imageUrl = "https://images.unsplash.com/photo-1619736417826-1a22d5a51c2e?w=400&fit=crop"),

        // Gupta Super General Store (vendorId = 2)
        ProductEntity(vendorId = 2, name = "Fortune Rozana Basmati Rice (5kg)", category = "Grocery", price = 340.0, description = "Long grain aromatic Basmati rice ideal for daily meals and biryani.", imageUrl = "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&fit=crop"),
        ProductEntity(vendorId = 2, name = "Aashirvaad Shudh Chakki Atta (10kg)", category = "Grocery", price = 385.0, description = "100% whole wheat chakki-ground flour for soft rotis.", imageUrl = "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&fit=crop"),
        ProductEntity(vendorId = 2, name = "Tata Salt Vacuum Evaporated (1kg)", category = "Grocery", price = 28.0, description = "Iodized crystal salt for wholesome daily cooking.", imageUrl = "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&fit=crop"),
        ProductEntity(vendorId = 2, name = "Amul Salted Butter (500g)", category = "Grocery", price = 275.0, description = "Pasteurized pure milk butter from Amul.", imageUrl = "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&fit=crop"),
        ProductEntity(vendorId = 2, name = "Tata Tea Gold Premium Blend (500g)", category = "Grocery", price = 260.0, description = "Exquisite CTC black tea blended with gentle long leaves.", imageUrl = "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=400&fit=crop"),

        // Royal Tandoor (vendorId = 3)
        ProductEntity(vendorId = 3, name = "Butter Chicken Special Handi", category = "Restaurant", price = 340.0, description = "Tender roasted chicken simmered in rich creamy tomato cashew gravy.", imageUrl = "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&fit=crop"),
        ProductEntity(vendorId = 3, name = "Dal Makhani Slow-Cooked (350ml)", category = "Restaurant", price = 240.0, description = "Black lentils cooked overnight on tandoor embers with pure butter and cream.", imageUrl = "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&fit=crop"),
        ProductEntity(vendorId = 3, name = "Paneer Tikka Shashlik (6 pcs)", category = "Restaurant", price = 260.0, description = "Char-grilled fresh cottage cheese cubes with onions and bell peppers.", imageUrl = "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&fit=crop"),
        ProductEntity(vendorId = 3, name = "Butter Garlic Naan (Pack of 2)", category = "Restaurant", price = 80.0, description = "Crispy clay-oven baked bread brushed with garlic butter.", imageUrl = "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&fit=crop"),

        // City 24/7 Chemist (vendorId = 4)
        ProductEntity(vendorId = 4, name = "Crocin 650 Advance (Strip of 15)", category = "Pharmacy", price = 32.0, description = "Fast action paracetamol 650mg for relief from body ache and fever.", imageUrl = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&fit=crop"),
        ProductEntity(vendorId = 4, name = "Daily Multivitamin & Zinc (60 Tabs)", category = "Pharmacy", price = 380.0, description = "Complete immunity boost with Vitamin C, D3, B-Complex and Zinc.", imageUrl = "https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&fit=crop"),
        ProductEntity(vendorId = 4, name = "Dettol Antiseptic Liquid (500ml)", category = "Pharmacy", price = 195.0, description = "Trusted antiseptic liquid for first aid, cuts and disinfectant use.", imageUrl = "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400&fit=crop"),

        // Modern Tech (vendorId = 6)
        ProductEntity(vendorId = 6, name = "OnePlus Wireless Earbuds", category = "Electronics", price = 2299.0, description = "Active Noise Cancellation with 36 hours total battery playback.", imageUrl = "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&fit=crop"),
        ProductEntity(vendorId = 6, name = "Fast 20000mAh Power Bank", category = "Electronics", price = 1699.0, description = "Dual input and triple output ports for fast simultaneous charging.", imageUrl = "https://images.unsplash.com/photo-1609592806596-b0c5a6d74b52?w=400&fit=crop"),

        // Farm Fresh (vendorId = 7)
        ProductEntity(vendorId = 7, name = "Fresh Farm Mangoes (1 Dozen)", category = "Fruits & Vegetables", price = 550.0, description = "Sweet naturally ripened GI-tagged Alphonso mangoes.", imageUrl = "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&fit=crop"),
        ProductEntity(vendorId = 7, name = "Hydroponic Salad Greens (250g)", category = "Fruits & Vegetables", price = 90.0, description = "Crispy pesticide-free Romaine lettuce, arugula and spinach.", imageUrl = "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400&fit=crop"),

        // Bikaner Sweets (vendorId = 8)
        ProductEntity(vendorId = 8, name = "Kaju Katli Pure Silver Vark (500g)", category = "Dairy & Sweets", price = 480.0, description = "Diamond cut cashew fudge prepared with 100% premium cashews.", imageUrl = "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=400&fit=crop"),
        ProductEntity(vendorId = 8, name = "Fresh Malai Paneer (500g)", category = "Dairy & Sweets", price = 190.0, description = "Soft, melt-in-mouth cottage cheese made from fresh morning milk.", imageUrl = "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&fit=crop"),

        // Chai & Stories (vendorId = 9)
        ProductEntity(vendorId = 9, name = "Signature Masala Kulhad Chai (2 Cups)", category = "Cafe & Snacks", price = 80.0, description = "Earthen pot brewed spiced tea with ginger, cardamom and saffron.", imageUrl = "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&fit=crop"),
        ProductEntity(vendorId = 9, name = "Cheese & Corn Grilled Sandwich", category = "Cafe & Snacks", price = 140.0, description = "Crispy butter toasted sandwich filled with mozzarella and sweet corn.", imageUrl = "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&fit=crop")
    )

    fun getInitialOffers(): List<OfferEntity> = listOf(
        OfferEntity(vendorId = 1, title = "Cake Carnival - Flat 25% OFF", discount = "25% OFF", description = "Get 25% discount on all celebration & birthday cakes this week."),
        OfferEntity(vendorId = 1, title = "Pastry Treat: Buy 2 Get 1 Free", discount = "B2G1 FREE", description = "Buy any two delicious pastries and receive a free chocolate truffle pastry!"),
        OfferEntity(vendorId = 2, title = "Super Pantry Saver - ₹100 OFF", discount = "₹100 OFF", description = "Instant ₹100 discount on your monthly pantry basket above ₹799."),
        OfferEntity(vendorId = 3, title = "Royal Feast - 20% OFF Curries", discount = "20% OFF", description = "Special 20% discount on all handi curries and chef signature dishes."),
        OfferEntity(vendorId = 4, title = "Wellness First - 15% OFF", discount = "15% OFF", description = "Save 15% on multivitamins, first-aid and wellness monitors."),
        OfferEntity(vendorId = 7, title = "Morning Farm Fresh - 10% OFF", discount = "10% OFF", description = "Freshly harvested organic fruits & vegetables at 10% discount."),
        OfferEntity(vendorId = 8, title = "Festive Mithai Deal - ₹50 OFF", discount = "₹50 OFF", description = "Flat ₹50 savings on all 500g & 1kg traditional sweet boxes."),
        OfferEntity(vendorId = 9, title = "Chai & Snacks Combo", discount = "20% OFF", description = "Order any sandwich or fries and get 20% discount on kulhad chai.")
    )

    fun getInitialReviews(): List<ReviewEntity> = listOf(
        ReviewEntity(vendorId = 1, userName = "Aarav Sharma", rating = 5, comment = "The Chocolate Truffle cake was freshly baked and delivered in 15 minutes! Superb taste.", date = "Today"),
        ReviewEntity(vendorId = 1, userName = "Priya V.", rating = 5, comment = "Best bakery in our locality. Soft paneer patties and delicious blueberry muffins.", date = "Yesterday"),
        ReviewEntity(vendorId = 2, userName = "Simran Kaur", rating = 5, comment = "Gupta store delivers authentic genuine staples very promptly. Five stars!", date = "2 days ago"),
        ReviewEntity(vendorId = 3, userName = "Vikram Gill", rating = 5, comment = "Butter Chicken and Garlic Naan tasted just like 5-star restaurant food. Loved it.", date = "3 days ago"),
        ReviewEntity(vendorId = 4, userName = "Ananya P.", rating = 5, comment = "Having a 24x7 chemist in the neighborhood gives so much peace of mind.", date = "1 week ago"),
        ReviewEntity(vendorId = 8, userName = "Rohan Malhotra", rating = 5, comment = "Kaju Katli melts in your mouth! Fresh paneer is top notch quality.", date = "1 week ago")
    )

    fun getInitialOrders(): List<OrderEntity> = listOf(
        OrderEntity(
            id = 1,
            vendorId = 1,
            vendorName = "Sharma Bakery & Confectionery",
            totalAmount = 420.0,
            status = "Confirmed",
            notes = "Please deliver before 6 PM.",
            deliveryAddress = "Flat 402, Sunshine Apartments, Main Market",
            paymentMethod = "Cash on Delivery",
            timestamp = System.currentTimeMillis() - 3600000
        ),
        OrderEntity(
            id = 2,
            vendorId = 2,
            vendorName = "Gupta Super General Store",
            totalAmount = 625.0,
            status = "Delivered",
            notes = "Leave at the door.",
            deliveryAddress = "House 12, Block B, Civil Lines",
            paymentMethod = "UPI",
            timestamp = System.currentTimeMillis() - 86400000
        )
    )

    fun getInitialOrderItems(): List<OrderItemEntity> = listOf(
        OrderItemEntity(orderId = 1, productId = 2, productName = "Pineapple Fresh Cream Cake (500g)", quantity = 1, price = 380.0),
        OrderItemEntity(orderId = 1, productId = 5, productName = "Spicy Paneer Puff Patties (Pack of 2)", quantity = 1, price = 40.0),
        OrderItemEntity(orderId = 2, productId = 6, productName = "Fortune Rozana Basmati Rice (5kg)", quantity = 1, price = 340.0),
        OrderItemEntity(orderId = 2, productId = 9, productName = "Amul Salted Butter (500g)", quantity = 1, price = 275.0),
        OrderItemEntity(orderId = 2, productId = 8, productName = "Tata Salt Vacuum Evaporated (1kg)", quantity = 1, price = 10.0)
    )
}
