import { connectDB } from '@/lib/mongodb'
import { Message, Campaign } from '@/lib/models'
import { generateText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { NextRequest, NextResponse } from 'next/server'

const systemPrompt = `You are a Xeno AI assistant. You help users create, optimize, and manage marketing campaigns. 
You provide insights on audience targeting, content strategies, budget optimization, and campaign performance analysis.
Always be helpful, provide actionable suggestions, and maintain context of ongoing campaigns.`

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { userId, messages, campaignId } = await req.json()

    if (!userId || !messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]

    // Get campaign context if provided
    let campaignContext = ''
    if (campaignId) {
      const campaign = await Campaign.findById(campaignId)
      if (campaign) {
        campaignContext = `\n\nCurrent Campaign Context:\nTitle: ${campaign.title}\nStatus: ${campaign.status}\nType: ${campaign.type}`
      }
    }

    const response = await generateText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt + campaignContext,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    })

    // Save assistant message
    await Message.create({
      userId,
      role: 'assistant',
      content: response.text,
      campaignContext: campaignId || null,
    })

    // Save user message
    await Message.create({
      userId,
      role: 'user',
      content: lastMessage.content,
      campaignContext: campaignId || null,
    })

    return NextResponse.json({
      message: response.text,
      usage: response.usage,
    })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
