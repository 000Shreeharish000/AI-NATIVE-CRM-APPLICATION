import { connectDB } from '@/lib/mongodb'
import { Customer } from '@/lib/models'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { userId, customers } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    if (!customers || !Array.isArray(customers) || customers.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty customers array' }, { status: 400 })
    }

    const importedCustomers = []
    const errors = []

    for (let i = 0; i < customers.length; i++) {
      const { name, email, phone, tagsString } = customers[i]

      // Validations
      if (!name || !email || !phone) {
        errors.push(`Row ${i + 1}: Missing name, email, or phone.`)
        continue
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        errors.push(`Row ${i + 1} (${name}): Invalid email format.`)
        continue
      }

      // Format tags
      const tags = tagsString
        ? tagsString.split(',').map((t: string) => t.trim().toLowerCase()).filter(Boolean)
        : []

      try {
        const customer = await Customer.create({
          userId,
          name,
          email,
          phone,
          tags,
          totalOrders: 0,
          totalSpent: 0
        })
        importedCustomers.push(customer)
      } catch (e: any) {
        console.error('Import row save error:', e)
        errors.push(`Row ${i + 1} (${name}): Database save failed. Duplicate email?`)
      }
    }

    return NextResponse.json({
      message: `Ingested ${importedCustomers.length} shoppers successfully.`,
      successCount: importedCustomers.length,
      errors
    }, { status: 200 })

  } catch (error) {
    console.error('Customer batch import error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
