import { connectDB } from '@/lib/mongodb'
import { CommunicationLog } from '@/lib/models'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const customerId = req.nextUrl.searchParams.get('customerId')

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 })
    }

    // Find logs for this customer, populate the campaign title
    const logs = await CommunicationLog.find({ customerId })
      .populate('campaignId', 'title type')
      .sort({ createdAt: -1 })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Fetch simulator messages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
