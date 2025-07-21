import { type NextRequest, NextResponse } from "next/server"

// Get API key from environment variable
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

if (!OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY environment variable is not set")
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 })
    }

    // Check if any message contains an image
    const hasImage = messages.some((msg: any) => msg.image)
    
    // Use vision model if there's an image, otherwise use the regular model
    const model = hasImage ? "openai/gpt-4o-mini" : "deepseek/deepseek-r1-0528:free"

    // Process messages to include images in the correct format
    const processedMessages = messages.map((msg: any) => {
      if (msg.image) {
        // For vision models, we need to include the image in the content array
        return {
          role: msg.role,
          content: [
            {
              type: "text",
              text: msg.content || "Please describe this image."
            },
            {
              type: "image_url",
              image_url: {
                url: msg.image
              }
            }
          ]
        }
      } else {
        return {
          role: msg.role,
          content: msg.content
        }
      }
    })

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: hasImage 
              ? "You are a helpful AI assistant with vision capabilities. When you see an image, describe what you observe in detail. Be friendly, helpful, and conversational. Always respond in English."
              : "You are a helpful AI assistant. Always respond in English, regardless of the language used in the user's message. Be friendly, helpful, and conversational.",
          },
          ...processedMessages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
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
