import { connectDB } from '@/lib/mongodb'
import { Campaign, Segment } from '@/lib/models'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const userId = req.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Find all segments for the user
    const segments = await Segment.find({ userId })
    
    // Find all campaigns for the user
    const campaigns = await Campaign.find({ userId })

    const segmentAnalytics = segments.map((seg) => {
      // Find campaigns targeted at this segment
      const targetedCampaigns = campaigns.filter(c => c.segmentId && c.segmentId.toString() === seg._id.toString())

      // Aggregate metrics
      let totalSent = 0
      let totalDelivered = 0
      let totalOpened = 0
      let totalClicked = 0
      let totalConversions = 0
      let totalRevenue = 0

      for (const campaign of targetedCampaigns) {
        if (campaign.metrics) {
          totalSent += campaign.metrics.sent || 0
          totalDelivered += campaign.metrics.delivered || 0
          totalOpened += campaign.metrics.opened || 0
          totalClicked += campaign.metrics.clicked || 0
          totalConversions += campaign.metrics.conversions || 0
          totalRevenue += campaign.metrics.revenue || 0
        }
      }

      const ctr = totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : '0.0'
      const openRate = totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : '0.0'
      const conversionRate = totalClicked > 0 ? ((totalConversions / totalClicked) * 100).toFixed(1) : '0.0'

      return {
        segmentId: seg._id,
        name: seg.name,
        campaignsCount: targetedCampaigns.length,
        totalSent,
        totalDelivered,
        totalOpened,
        totalClicked,
        totalConversions,
        totalRevenue,
        openRate,
        ctr,
        conversionRate
      }
    })

    // Sort by revenue descending
    segmentAnalytics.sort((a, b) => b.totalRevenue - a.totalRevenue)

    return NextResponse.json(segmentAnalytics)

  } catch (error) {
    console.error('Segments aggregation analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
