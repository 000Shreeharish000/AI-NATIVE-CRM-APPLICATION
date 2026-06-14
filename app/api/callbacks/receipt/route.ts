import { connectDB } from '@/lib/mongodb'
import { CommunicationLog, Campaign, Customer, Order } from '@/lib/models'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { logId, status, purchaseDetails } = await req.json()

    if (!logId || !status) {
      return NextResponse.json({ error: 'Log ID and Status required' }, { status: 400 })
    }

    // Find the communication log
    const log = await CommunicationLog.findById(logId)
    if (!log) {
      return NextResponse.json({ error: 'Communication log not found' }, { status: 404 })
    }

    // Prevent duplicate updates for the same status
    const alreadyReachedStatus = log.history.some(h => h.status === status)
    if (alreadyReachedStatus) {
      return NextResponse.json({ message: 'Status already recorded' }, { status: 200 })
    }

    // Update log status and push history
    log.status = status
    log.history.push({ status, timestamp: new Date() })
    await log.save()

    // Find corresponding campaign
    const campaign = await Campaign.findById(log.campaignId)
    if (campaign) {
      // Initialize metrics if not present
      if (!campaign.metrics) {
        campaign.metrics = { sent: 0, delivered: 0, opened: 0, clicked: 0, conversions: 0, spend: 0, revenue: 0 }
      }

      // Update campaign metrics
      if (status === 'delivered') {
        campaign.metrics.delivered += 1
      } else if (status === 'read') {
        campaign.metrics.opened += 1
      } else if (status === 'clicked') {
        campaign.metrics.clicked += 1
      } else if (status === 'ordered') {
        campaign.metrics.conversions += 1
        if (purchaseDetails && purchaseDetails.price) {
          campaign.metrics.revenue += purchaseDetails.price
        }
      }
      campaign.markModified('metrics')
      await campaign.save()
    }

    // If customer purchased (conversions), update Customer and Order collections
    if (status === 'ordered' && purchaseDetails) {
      const customer = await Customer.findById(log.customerId)
      if (customer) {
        // Create the order
        const price = purchaseDetails.price || 0
        const itemName = purchaseDetails.name || 'Simulated Purchase'
        const category = purchaseDetails.category || 'General'

        await Order.create({
          customerId: customer._id,
          amount: price,
          items: [{ name: itemName, category, price }],
          purchaseDate: new Date(),
          campaignId: log.campaignId
        })

        // Update customer statistics
        customer.totalOrders += 1
        customer.totalSpent = Math.round((customer.totalSpent + price) * 100) / 100
        customer.lastPurchaseDate = new Date()
        
        // Ensure VIP tag if spend is high
        if (customer.totalSpent > 120 && !customer.tags.includes('VIP')) {
          customer.tags.push('VIP')
        }
        await customer.save()
      }
    }

    return NextResponse.json({
      message: `Status updated to ${status} successfully.`,
      logId,
      status
    }, { status: 200 })

  } catch (error) {
    console.error('Receipt callback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
