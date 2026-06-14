import { connectDB } from '@/lib/mongodb'
import { CommunicationLog } from '@/lib/models'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const userId = req.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const logs = await CommunicationLog.find()
      .populate({
        path: 'customerId',
        match: { userId },
        select: 'name email phone'
      })
      .populate('campaignId', 'title type')
      .sort({ updatedAt: -1 })
      .limit(20)

    // Filter out logs where customer didn't match the userId (since populate returns null for unmatched ref query)
    const filteredLogs = logs.filter(log => log.customerId !== null)

    return NextResponse.json(filteredLogs)
  } catch (error) {
    console.error('Fetch simulator logs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
