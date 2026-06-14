import { connectDB } from '@/lib/mongodb'
import { Segment, Customer } from '@/lib/models'
import { NextRequest, NextResponse } from 'next/server'

function castFilters(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj

  const numericFields = ['totalSpent', 'totalOrders']
  const result: any = Array.isArray(obj) ? [] : {}

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key]
      if (numericFields.includes(key)) {
        if (typeof val === 'object' && val !== null) {
          const operatorObj: any = {}
          for (const op in val) {
            if (Object.prototype.hasOwnProperty.call(val, op)) {
              const opVal = val[op]
              if (typeof opVal === 'string' && !isNaN(Number(opVal))) {
                operatorObj[op] = Number(opVal)
              } else {
                operatorObj[op] = opVal
              }
            }
          }
          result[key] = operatorObj
        } else if (typeof val === 'string' && !isNaN(Number(val))) {
          result[key] = Number(val)
        } else {
          result[key] = val
        }
      } else if (typeof val === 'object' && val !== null) {
        result[key] = castFilters(val)
      } else {
        result[key] = val
      }
    }
  }
  return result
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

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

    // Cast numeric fields (totalSpent, totalOrders) from strings if needed
    query = castFilters(query)

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
