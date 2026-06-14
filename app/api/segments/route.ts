import { connectDB } from '@/lib/mongodb'
import { Segment, Customer } from '@/lib/models'
import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
})

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

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const userId = req.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const segments = await Segment.find({ userId })
    return NextResponse.json(segments)
  } catch (error) {
    console.error('Fetch segments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { userId, name, description, filters, prompt } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    let finalFilters = filters || {}
    let finalName = name
    let finalDescription = description

    // If an AI prompt is provided, generate the query and details using Gemini
    if (prompt) {
      const systemPrompt = `You are a MongoDB query generator for a D2C CRM. Translate the user's natural language request into a Mongoose query object for the Customer schema.
      
      Customer Schema fields:
      - name: string
      - email: string
      - phone: string
      - totalOrders: number
      - totalSpent: number
      - lastPurchaseDate: Date (ISO String)
      - tags: string[] (commonly contains: 'coffee-lover', 'fashion-enthusiast', 'beauty-addict', 'VIP', 'inactive', 'churn-risk')

      Current Time: ${new Date().toISOString()}

      Generate a valid JSON object containing:
      1. "filters": The Mongoose query filter object.
      2. "name": A concise, clear name for this segment.
      3. "description": A short description of who this targets.

      Rules:
      - For date comparisons (e.g. last 30 days), compute the exact ISO Date string relative to the Current Time and use operators like $lt or $gt. E.g. lastPurchaseDate: { $lt: "2026-05-15T00:00:00.000Z" } for inactive.
      - Return ONLY the raw JSON block without markdown formatting or code fences. Ensure it is valid JSON.

      Example output:
      {
        "filters": { "totalSpent": { "$gt": 100 }, "tags": "coffee-lover" },
        "name": "High-Spending Coffee Lovers",
        "description": "Coffee enthusiasts who spent more than $100"
      }`

      const response = await generateText({
        model: google('gemini-2.5-flash'),
        system: systemPrompt,
        prompt: `Translate this request: "${prompt}"`,
      })

      try {
        const cleanedText = response.text.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(cleanedText)
        finalFilters = parsed.filters
        finalName = name || parsed.name
        finalDescription = description || parsed.description
      } catch (e) {
        console.error('Failed to parse AI segment query response:', response.text, e)
        return NextResponse.json({ error: 'AI failed to generate a valid query. Try again with a clearer prompt.' }, { status: 422 })
      }
    }

    if (!finalName) {
      return NextResponse.json({ error: 'Segment name required' }, { status: 400 })
    }

    // Cast string-based numeric query operators to actual numbers
    finalFilters = castFilters(finalFilters)

    const segment = await Segment.create({
      userId,
      name: finalName,
      description: finalDescription || '',
      filters: finalFilters,
      queryJson: JSON.stringify(finalFilters)
    })

    return NextResponse.json(segment, { status: 201 })
  } catch (error) {
    console.error('Create segment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
