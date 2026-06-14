import { NextRequest, NextResponse } from 'next/server'

// Helper function to wait
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function POST(req: NextRequest) {
  try {
    const { campaignId, recipientLogs } = await req.json()

    if (!campaignId || !recipientLogs || !Array.isArray(recipientLogs)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Run the simulation asynchronously
    // In a serverless environment, background promises might get suspended after response,
    // but locally or in node development, this runs completely.
    // We also return a quick response so the main thread is unblocked.
    const runSimulation = async () => {
      for (const log of recipientLogs) {
        // We simulate each customer in parallel with small randomized delays
        (async () => {
          try {
            // 1. Simulate Delivered (95% rate)
            await wait(500 + Math.random() * 1500)
            const isDelivered = Math.random() < 0.95
            const deliveryStatus = isDelivered ? 'delivered' : 'failed'
            
            await fetch(`${appUrl}/api/callbacks/receipt`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ logId: log.logId, status: deliveryStatus })
            })

            if (!isDelivered) return // Stop if failed

            // 2. Simulate Read (80% rate)
            await wait(1000 + Math.random() * 2000)
            const isRead = Math.random() < 0.8
            if (!isRead) return

            await fetch(`${appUrl}/api/callbacks/receipt`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ logId: log.logId, status: 'read' })
            })

            // 3. Simulate Clicked (40% rate)
            await wait(1500 + Math.random() * 2500)
            const isClicked = Math.random() < 0.4
            if (!isClicked) return

            await fetch(`${appUrl}/api/callbacks/receipt`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ logId: log.logId, status: 'clicked' })
            })

            // 4. Simulate Ordered / Conversion (20% rate)
            await wait(2000 + Math.random() * 3000)
            const isOrdered = Math.random() < 0.2
            if (!isOrdered) return

            // Choose a random item to simulate buy
            const items = [
              { name: 'Premium Espresso Roast (500g)', category: 'Coffee & Drinks', price: 18.99 },
              { name: 'Oversized Cotton Hoodie', category: 'Fashion', price: 59.99 },
              { name: 'Vitamin C Glow Moisturizer', category: 'Beauty & Cosmetics', price: 32.00 },
              { name: 'Classic Leather Jacket', category: 'Fashion', price: 149.99 }
            ]
            const purchasedItem = items[Math.floor(Math.random() * items.length)]

            await fetch(`${appUrl}/api/callbacks/receipt`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                logId: log.logId, 
                status: 'ordered', 
                purchaseDetails: purchasedItem 
              })
            })

          } catch (e) {
            console.error('Simulation callback failed for log:', log.logId, e)
          }
        })()
      }
    }

    // Trigger simulation
    runSimulation()

    return NextResponse.json({
      status: 'queued',
      message: 'Channel simulation running in background.',
    })
  } catch (error) {
    console.error('Mock channel error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
