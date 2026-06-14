import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { type, segmentName, description, additionalPrompt } = await req.json()

    if (!type || !segmentName) {
      return NextResponse.json({ error: 'Campaign type and segment name are required' }, { status: 400 })
    }

    const systemPrompt = `You are a professional marketing copywriter. Write a highly converting message for a campaign of type: "${type}" targeting the segment: "${segmentName}".
    
    Campaign Details: ${description || 'No additional details provided.'}
    Additional Request: ${additionalPrompt || 'Write a friendly, catchy message.'}

    Rules based on Campaign Type (Channel):
    - whatsapp: Direct, friendly, keep it under 300 characters, can use emojis and formatting like *bold* for emphasis.
    - sms: Short and concise, under 160 characters. Must contain a clear CTA link (e.g. http://localhost:3000/shop).
    - email: Write a Subject Line first, then the email body. Maintain a professional yet engaging tone.
    - rcs: Engaging, rich description, under 250 characters, call to action.

    Return ONLY the text content of the message. Do not wrap in quotes or code fences. If it is an email, start the first line with "Subject: [Your Subject]" followed by a blank line and the body.`

    const response = await generateText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      prompt: `Generate marketing copy for this campaign.`
    })

    return NextResponse.json({
      content: response.text.trim()
    })

  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
