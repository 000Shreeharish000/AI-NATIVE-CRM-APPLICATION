import { connectDB } from '@/lib/mongodb'
import { Campaign, Segment, Customer, CommunicationLog } from '@/lib/models'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { campaignId, segmentId } = await req.json()

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
    }

    const campaign = await Campaign.findById(campaignId)
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    let query: any = { userId: campaign.userId }
    if (segmentId) {
      const segment = await Segment.findById(segmentId)
      if (segment) {
        let filters = segment.filters || {}
        if (typeof filters === 'string') {
          filters = JSON.parse(filters)
        }
        // Convert date string filters
        filters = JSON.parse(JSON.stringify(filters), (key, value) => {
          if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
            return new Date(value)
          }
          return value
        })
        query = { ...query, ...filters }
        campaign.segmentId = segmentId
      }
    }

    const customers = await Customer.find(query)
    if (customers.length === 0) {
      return NextResponse.json({ error: 'No customers found in this segment' }, { status: 400 })
    }

    // Reset metrics and set status to active/sending
    campaign.status = 'active'
    campaign.metrics = {
      sent: customers.length,
      delivered: 0,
      opened: 0,
      clicked: 0,
      conversions: 0,
      spend: customers.length * 0.05, // e.g. $0.05 per message cost
      revenue: 0,
    }
    await campaign.save()

    // Clear previous logs for this campaign
    await CommunicationLog.deleteMany({ campaignId })

    // Create initial CommunicationLogs with status 'sent' with dynamic template replacement
    const logsData = customers.map((customer) => {
      let messageContent = campaign.content || `Hello {{name}}, check out our latest offers!`
      
      // Interpolate {{name}}
      messageContent = messageContent.replace(/\{\{name\}\}/g, customer.name)
      
      // Interpolate {{lastPurchaseDate}}
      const formattedDate = customer.lastPurchaseDate
        ? new Date(customer.lastPurchaseDate).toLocaleDateString()
        : 'recent purchase'
      messageContent = messageContent.replace(/\{\{lastPurchaseDate\}\}/g, formattedDate)

      return {
        campaignId: campaign._id,
        customerId: customer._id,
        channel: campaign.type || 'whatsapp',
        status: 'sent',
        messageContent,
        history: [{ status: 'sent', timestamp: new Date() }],
      }
    })

    const createdLogs = await CommunicationLog.insertMany(logsData)

    // Call the stubbed Channel Service
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    // We fire and forget the callback trigger so the user response is immediate
    try {
      fetch(`${appUrl}/api/mock-channel/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign._id,
          recipientLogs: createdLogs.map(log => ({
            logId: log._id,
            customerId: log.customerId,
            channel: log.channel,
            messageContent: log.messageContent,
          }))
        })
      }).catch(err => console.error('Fire-and-forget fetch error:', err))
    } catch (e) {
      console.error('Call to mock channel failed', e)
    }

    return NextResponse.json({
      message: 'Campaign sending initiated.',
      sentCount: customers.length,
      campaign,
    })
  } catch (error) {
    console.error('Send campaign error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
