import { connectDB } from '@/lib/mongodb'
import { Customer } from '@/lib/models'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const userId = req.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const customers = await Customer.find({ userId }).sort({ totalSpent: -1 })
    return NextResponse.json(customers)
  } catch (error) {
    console.error('Fetch customers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
