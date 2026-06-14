import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
})

export async function GET(req: NextRequest) {
  try {
    const systemPrompt = `You are an AI D2C retail trend researcher. Scan social channels (TikTok, Instagram, Pinterest) and generate 3 or 4 highly viral and realistic summer market trends for D2C brands.
    
    The trends must align with these product categories:
    - Coffee & Drinks
    - Fashion
    - Beauty & Cosmetics

    And map to these exact target segments available in the CRM:
    - VIP Customers
    - Coffee Lovers
    - Fashion Enthusiasts
    - Beauty Addicts
    - Inactive Shoppers
    - Frequent Buyers

    Output a valid JSON array of trend objects. Do not include markdown code fences or quotes. Return ONLY the raw JSON.

    Each object in the JSON array must contain:
    1. "id": A unique string slug (e.g., "cold-brew-lemonade")
    2. "trendTopic": The name of the viral trend (e.g., "Dark Roast Espresso Tonic")
    3. "category": The product category
    4. "platform": The social media platform where it is viral ("Instagram", "TikTok", or "Pinterest")
    5. "mentionsChange": Percentage spike in mentions (e.g., "+185% in last 24h")
    6. "sentimentScore": Numeric sentiment index from 1 to 100 (e.g. 92)
    7. "insight": A short explanation (1-2 sentences) of why it is trending.
    8. "suggestedSegment": One of the exact segments listed above (e.g. "Coffee Lovers")
    9. "suggestedChannel": Suggested messaging channel ("whatsapp", "sms", "email", or "rcs")
    
    Example output format:
    [
      {
        "id": "espresso-tonic",
        "trendTopic": "Espresso Tonic",
        "category": "Coffee & Drinks",
        "platform": "Instagram",
        "mentionsChange": "+140% in last 12h",
        "sentimentScore": 89,
        "insight": "D2C shoppers are posting recipe videos combining double-shot espresso with tonic water and lemon peels.",
        "suggestedSegment": "Coffee Lovers",
        "suggestedChannel": "whatsapp"
      }
    ]`

    const niche = req.nextUrl.searchParams.get('niche')
    let prompt = 'Perform a live trend scan for D2C marketing opportunities.'
    if (niche) {
      prompt = `Perform a live trend scan specifically focused on this D2C niche: "${niche}". Generate trends matching this category.`
    }

    const response = await generateText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      prompt
    })

    const cleanedText = response.text.replace(/```json|```/g, '').trim()
    const trends = JSON.parse(cleanedText)

    // Build the prefill URLs dynamically
    const trendsWithUrls = trends.map((trend: any) => {
      const title = `Social Trend: ${trend.trendTopic} Promo`
      const desc = `Targeting ${trend.suggestedSegment} via ${trend.suggestedChannel} based on trending mentions on ${trend.platform} (${trend.mentionsChange}).`
      const prompt = `Write an exciting marketing message about ${trend.trendTopic}. Target ${trend.suggestedSegment} and make it feel urgent. Mention discount code TRENDY15 for 15% off.`

      const params = new URLSearchParams({
        prefill: 'trend',
        segmentName: trend.suggestedSegment,
        channel: trend.suggestedChannel,
        title,
        desc,
        prompt
      })

      return {
        ...trend,
        prefillUrl: `/dashboard/campaigns?${params.toString()}`
      }
    })

    return NextResponse.json(trendsWithUrls)

  } catch (error) {
    console.error('Trend generator API error:', error)
    return NextResponse.json([
      {
        id: "cold-brew-lemonade",
        trendTopic: "Cold Brew Lemonade",
        category: "Coffee & Drinks",
        platform: "Instagram",
        mentionsChange: "+180% in last 24h",
        sentimentScore: 92,
        insight: "D2C coffee brands are seeing a massive spike in recipes mixing lemonade concentrate with cold brew concentrate.",
        suggestedSegment: "Coffee Lovers",
        suggestedChannel: "whatsapp",
        prefillUrl: `/dashboard/campaigns?prefill=trend&segmentName=Coffee%20Lovers&channel=whatsapp&title=Social+Trend%3A+Cold+Brew+Lemonade+Promo&desc=Targeting+Coffee+Lovers+via+whatsapp+based+on+trending+mentions+on+Instagram+%28%2B180%25+in+last+24h%29.&prompt=Write+an+exciting+marketing+message+about+Cold+Brew+Lemonade.+Target+Coffee+Lovers+and+make+it+feel+urgent.+Mention+discount+code+TRENDY15+for+15%25+off.`
      },
      {
        id: "linen-matching-sets",
        trendTopic: "Eco-Linen Matching Sets",
        category: "Fashion",
        platform: "TikTok",
        mentionsChange: "+240% in last 48h",
        sentimentScore: 95,
        insight: "Minimalist fashion matching sets made of organic linen are going viral as comfortable summer wear.",
        suggestedSegment: "Fashion Enthusiasts",
        suggestedChannel: "email",
        prefillUrl: `/dashboard/campaigns?prefill=trend&segmentName=Fashion%20Enthusiasts&channel=email&title=Social+Trend%3A+Eco-Linen+Sets+Promo&desc=Targeting+Fashion+Enthusiasts+via+email+based+on+trending+mentions+on+TikTok+%28%2B240%25+in+last+48h%29.&prompt=Write+an+exciting+marketing+message+about+Eco-Linen+Matching+Sets.+Target+Fashion+Enthusiasts+and+make+it+feel+urgent.+Mention+discount+code+TRENDY15+for+15%25+off.`
      }
    ])
  }
}
