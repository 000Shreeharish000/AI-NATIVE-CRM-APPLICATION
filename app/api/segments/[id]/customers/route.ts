import { connectDB } from '@/lib/mongodb'
import { Segment, Customer } from '@/lib/models'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params

    const segment = await Segment.findById(id)
    if (!segment) {
      return NextResponse.json({ error: 'Segment not found' }, { status: 404 })
    }

    // Parse filters
    let query = segment.filters || {}
    if (typeof query === 'string') {
      query = JSON.parse(query)
    }

    // Convert date string criteria to Date objects
    query = JSON.parse(JSON.stringify(query), (key, value) => {
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        return new Date(value)
      }
      return value
    })

    // Scope query to the user
    query.userId = segment.userId

    const customers = await Customer.find(query)
    return NextResponse.json({
      customers,
      count: customers.length,
      filters: query
    })
  } catch (error) {
    console.error('Fetch segment customers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
