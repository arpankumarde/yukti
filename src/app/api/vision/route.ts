import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.0-pro-exp-02-05:free",
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://nextjs-pdf-parser.vercel.app",
        },
      }
    );

    if (response.status !== 200) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = response.data;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing vision request:", error);
    return NextResponse.json(
      { error: "Failed to process vision request" },
      { status: 500 }
    );
  }
}
