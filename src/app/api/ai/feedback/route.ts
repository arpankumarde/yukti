import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // You can use OpenAI API or OpenRouter API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI interview assistant that evaluates interview answers."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("AI API error:", data.error);
      return NextResponse.json(
        { error: "Error generating feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      result: data.choices[0]?.message?.content || "No feedback available"
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}