import { connectDB } from '@/lib/mongodb'
import { Customer, Order, Segment, Campaign, CommunicationLog } from '@/lib/models'
import { NextRequest, NextResponse } from 'next/server'

const FIRST_NAMES = ['Aarav', 'Aditi', 'Rohan', 'Priya', 'Kabir', 'Ananya', 'Vikram', 'Neha', 'Siddharth', 'Diya', 'Rahul', 'Ishita', 'Arjun', 'Kavya', 'Dev', 'Amit', 'Sunita', 'Rajesh', 'Pooja', 'Karan', 'Kriti', 'Vijay', 'Meera', 'Sanjay', 'Deepa', 'Anil', 'Sonia', 'Gaurav', 'Ritu', 'Manish'];
const LAST_NAMES = ['Sharma', 'Patel', 'Gupta', 'Singh', 'Mehta', 'Reddy', 'Sen', 'Verma', 'Nair', 'Rao', 'Bose', 'Roy', 'Joshi', 'Iyer', 'Shah', 'Kumar', 'Das', 'Choudhury', 'Mishra', 'Gill', 'Jain', 'Saxena', 'Kapoor', 'Malhotra', 'Bhatt', 'Dubey', 'Trivedi', 'Pandey', 'Mukherjee', 'Chatterjee'];

const ITEM_TEMPLATES = {
  'coffee-lover': [
    { name: 'Premium Espresso Roast (500g)', category: 'Coffee & Drinks', price: 18.99 },
    { name: 'Cold Brew Starter Kit', category: 'Coffee & Drinks', price: 34.99 },
    { name: 'Ceramic Coffee Mug', category: 'Coffee & Drinks', price: 12.50 },
    { name: 'Single Origin Ethiopia Beans (250g)', category: 'Coffee & Drinks', price: 14.50 },
    { name: 'Pour Over Glass Dripper', category: 'Coffee & Drinks', price: 29.99 }
  ],
  'fashion-enthusiast': [
    { name: 'Oversized Cotton Hoodie', category: 'Fashion', price: 59.99 },
    { name: 'Slim Fit Denim Jeans', category: 'Fashion', price: 79.99 },
    { name: 'Classic Leather Jacket', category: 'Fashion', price: 149.99 },
    { name: 'Canvas Tote Bag', category: 'Fashion', price: 24.99 },
    { name: 'Summer Linen Shirt', category: 'Fashion', price: 45.00 }
  ],
  'beauty-addict': [
    { name: 'Hydrating Hyaluronic Serum', category: 'Beauty & Cosmetics', price: 28.00 },
    { name: 'Vitamin C Glow Moisturizer', category: 'Beauty & Cosmetics', price: 32.00 },
    { name: 'Organic Clay Face Mask', category: 'Beauty & Cosmetics', price: 19.99 },
    { name: 'Soothe Lip Balm (Pack of 3)', category: 'Beauty & Cosmetics', price: 15.00 },
    { name: 'Gentle Foaming Cleanser', category: 'Beauty & Cosmetics', price: 22.00 }
  ],
  'general': [
    { name: 'Stainless Steel Water Bottle', category: 'Accessories', price: 24.99 },
    { name: 'Gift Card - $25', category: 'Gift Cards', price: 25.00 },
    { name: 'Gift Card - $50', category: 'Gift Cards', price: 50.00 },
    { name: 'Eco-Friendly Phone Case', category: 'Accessories', price: 19.99 }
  ]
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // 1. Clear old customer database records
    const customers = await Customer.find({ userId })
    const customerIds = customers.map((c) => c._id)

    await Order.deleteMany({ customerId: { $in: customerIds } })
    await Customer.deleteMany({ userId })
    await Segment.deleteMany({ userId })
    await CommunicationLog.deleteMany({ customerId: { $in: customerIds } })

    // 2. Generate 150 customers distributed across primary categories
    const createdCustomers = []
    
    for (let index = 0; index < 150; index++) {
      // Pick random name
      const firstName = FIRST_NAMES[index % FIRST_NAMES.length]
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
      const name = `${firstName} ${lastName}`
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${index + 100}@xeno-retail.com`
      const phone = `+9198765${String(index + 1000).slice(-5)}`

      // Determine primary tag: cycle through coffee, fashion, beauty
      const primaryTag = index % 3 === 0 ? 'coffee-lover' : index % 3 === 1 ? 'fashion-enthusiast' : 'beauty-addict'
      const tags = [primaryTag]

      // Sub-segment configurations:
      // VIP: spent > 120
      // Inactive: last purchase > 30 days ago
      // Frequent buyers: >= 3 orders
      const isVipCandidate = index % 5 === 0 // 20% VIPs
      const isInactiveCandidate = index % 6 === 0 && !isVipCandidate // ~15% inactive
      const isFrequentCandidate = index % 4 === 0 // 25% frequent buyers

      let orderCount = 1
      if (isFrequentCandidate) {
        orderCount = Math.floor(Math.random() * 4) + 3 // 3 to 6 orders
      } else if (Math.random() < 0.4) {
        orderCount = 2 // 40% chance of 2 orders
      }

      // Create Customer document first
      const customer = await Customer.create({
        userId,
        name,
        email,
        phone,
        tags,
        totalOrders: 0,
        totalSpent: 0
      })

      let totalSpent = 0
      const orderDates: Date[] = []

      for (let i = 0; i < orderCount; i++) {
        // Choose items based on tag pool
        const pool = ITEM_TEMPLATES[primaryTag] || ITEM_TEMPLATES['general']
        
        // Pick items
        let numItems = 1
        if (isVipCandidate) {
          numItems = Math.floor(Math.random() * 2) + 2 // VIPs buy more items (2 to 3)
        } else if (Math.random() < 0.5) {
          numItems = 2
        }

        const items = []
        let orderAmount = 0
        
        for (let j = 0; j < numItems; j++) {
          const item = pool[Math.floor(Math.random() * pool.length)]
          items.push(item)
          orderAmount += item.price
        }

        // Generate purchase date
        let daysAgo = Math.floor(Math.random() * 15) // default recent (0-15 days)
        if (isInactiveCandidate) {
          daysAgo = Math.floor(Math.random() * 45) + 35 // 35-80 days ago
        } else if (isVipCandidate) {
          daysAgo = Math.floor(Math.random() * 7) // very recent
        }

        const purchaseDate = new Date()
        purchaseDate.setDate(purchaseDate.getDate() - daysAgo)
        orderDates.push(purchaseDate)

        await Order.create({
          customerId: customer._id,
          amount: Math.round(orderAmount * 100) / 100,
          items,
          purchaseDate
        })

        totalSpent += orderAmount
      }

      // Update customer stats
      customer.totalOrders = orderCount
      customer.totalSpent = Math.round(totalSpent * 100) / 100
      customer.lastPurchaseDate = new Date(Math.max(...orderDates.map(d => d.getTime())))
      
      // Dynamic tagging based on final states
      if (isInactiveCandidate) {
        customer.tags.push('inactive')
      }
      if (customer.totalSpent > 120) {
        customer.tags.push('VIP')
      }
      if (customer.totalOrders >= 3) {
        customer.tags.push('frequent-buyer')
      }

      await customer.save()
      createdCustomers.push(customer)
    }

    // 3. Seed the 6 requested Segments
    const defaultSegments = [
      {
        userId,
        name: 'VIP Customers',
        description: 'Customers with total spent greater than $120 or tagged as VIP',
        filters: { tags: 'VIP' },
        queryJson: JSON.stringify({ tags: 'VIP' })
      },
      {
        userId,
        name: 'Coffee Lovers',
        description: 'Customers who buy premium coffee and drinks',
        filters: { tags: 'coffee-lover' },
        queryJson: JSON.stringify({ tags: 'coffee-lover' })
      },
      {
        userId,
        name: 'Fashion Enthusiasts',
        description: 'Customers interested in clothing and apparel',
        filters: { tags: 'fashion-enthusiast' },
        queryJson: JSON.stringify({ tags: 'fashion-enthusiast' })
      },
      {
        userId,
        name: 'Beauty Addicts',
        description: 'Customers interested in cosmetics and skincare',
        filters: { tags: 'beauty-addict' },
        queryJson: JSON.stringify({ tags: 'beauty-addict' })
      },
      {
        userId,
        name: 'Inactive Shoppers',
        description: 'Customers who have not purchased anything in the last 30 days',
        filters: { tags: 'inactive' },
        queryJson: JSON.stringify({ tags: 'inactive' })
      },
      {
        userId,
        name: 'Frequent Buyers',
        description: 'Loyal customers with 3 or more orders in history',
        filters: { tags: 'frequent-buyer' },
        queryJson: JSON.stringify({ tags: 'frequent-buyer' })
      }
    ]

    await Segment.insertMany(defaultSegments)

    return NextResponse.json({
      message: 'Database successfully seeded with 150 customers across 6 segments.',
      customersCount: createdCustomers.length
    }, { status: 200 })

  } catch (error) {
    console.error('Database seed error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
