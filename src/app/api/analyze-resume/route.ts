import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

const getAnalysisPrompt = (isJobMatch: boolean) => {
  if (isJobMatch) {
    return `You are an expert ATS (Applicant Tracking System) analyzer and professional resume reviewer. Analyze the following resume text and provide a detailed report covering:

1. ATS Compatibility Score (0-100) without any percentage symbol 
2. Key strengths 
3.weakness

The Strength are weakness are advisable to be around 60 words each..

Format your response as a JSON with fields : score , strength , weakness.
Make sure strictly the response doesn't contain anything else but just a JSON.
`;
  }

  return `You are an expert ATS (Applicant Tracking System) analyzer and professional resume reviewer. Analyze the following resume text and provide a detailed report covering:

1. ATS Compatibility Score (0-100%)
2. Key strengths 
3.weakness


Format your response as a JSON with fields : score , strength , weakness.
Make sure strictly the response doesn't contain anything else but just a JSON.
`;
};

export async function POST(req: NextRequest) {
  try {
    const { text, jobProfile } = await req.json();
    const isJobMatch = jobProfile !== "General ATS Analysis";
    const ANALYSIS_PROMPT = getAnalysisPrompt(isJobMatch);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://nextjs-pdf-parser.vercel.app",
        "X-Title": "NextJS PDF Parser",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-pro-exp-02-05:free",
        messages: [
          {
            role: "user",
            content: `${ANALYSIS_PROMPT}\n\n${isJobMatch ? `Job Profile:\n${jobProfile}\n\n` : ""}Resume Text:\n${text}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Error analyzing resume:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 }
    );
  }
}