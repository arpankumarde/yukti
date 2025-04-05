import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

const getAnalysisPrompt = (isJobMatch: boolean) => {
  if (isJobMatch) {
    return `You are an expert ATS (Applicant Tracking System) analyzer and professional resume reviewer. Analyze the following resume text in relation to the provided job profile and provide a detailed report covering:

1. ATS Compatibility Score (0-100%)
2. Job Match Score (0-100%)
3. Key findings and recommendations
4. Keyword alignment with job requirements
5. Missing skills and qualifications
6. Format and structure analysis
7. Strengths relative to job requirements
8. Specific improvement suggestions to better match the job profile

Format your response in markdown for better readability.`;
  }

  return `You are an expert ATS (Applicant Tracking System) analyzer and professional resume reviewer. Analyze the following resume text and provide a detailed report covering:

1. ATS Compatibility Score (0-100) dont include percentage sign and make sure its an integer.
2. Format and Structure Analysis
3. Key Findings
4. Keyword Optimization
5. Content Quality Assessment
6. Technical Skills Analysis
7. Professional Experience Evaluation
8. Education and Certifications Review
9. Improvement Recommendations

Format your response in markdown for better readability.`;
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
        model: "google/gemini-2.0-flash-001",
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