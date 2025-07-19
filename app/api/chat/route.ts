import { type NextRequest, NextResponse } from "next/server"

// Replace 'your-api-key-here' with your actual OpenRouter API key
const OPENROUTER_API_KEY = "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"

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 })
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      // OpenRouter needs only these two headers for auth
      headers: {
        // Always trim to avoid hidden whitespace issues
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528:free",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful AI assistant. Always respond in English, regardless of the language used in the user's message. Be friendly, helpful, and conversational.",
          },
          ...messages,
        ],
        // feel free to tweak
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      // Try to parse the body; fall back to plain text
      let errorPayload: string | Record<string, unknown>
      try {
        errorPayload = await response.json()
      } catch {
        errorPayload = await response.text()
      }

      console.error("OpenRouter API error:", errorPayload)

      return NextResponse.json({ error: errorPayload }, { status: response.status })
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return NextResponse.json({ error: "Invalid response format from OpenRouter API" }, { status: 500 })
    }

    return NextResponse.json({
      content: data.choices[0].message.content,
      usage: data.usage,
    })
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
