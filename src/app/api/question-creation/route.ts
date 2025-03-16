import { NextRequest, NextResponse } from "next/server";
import { chatSession } from "@/utils/OpenAiModel";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, experience, interviewTitle } = body;

    // Validate required fields
    if (!title || !description || !experience || !interviewTitle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create prompt for AI
    const inputPrompt = `Job Position: ${title} Job Description: ${description} Job Experience: ${experience} Years, based on this information give me ${
      process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT || 5
    } ${interviewTitle} interview questions alongside with its sample answers in JSON Format as Fields, you are STRICTLY instructed to respond with only a JSON without any additional TEXT or INFO, JUST A JSON WITH FIELD OF QUESTIONS AND ANSWERS. [{"question":"", "answer":""}]`;

    // Call AI model
    const result = await chatSession.sendMessage(inputPrompt);

    console.log(result);

    // Parse the response
    let questionsJson;
    try {
      questionsJson = JSON.parse(result);
    } catch {
      // If direct parsing fails, try cleaning the response
      questionsJson = JSON.parse(result.replace(/```json|```/g, "").trim());
    }

    // Return the parsed JSON
    return NextResponse.json(questionsJson);
  } catch (error) {
    console.error("Failed to generate interview questions:", error);
    return NextResponse.json(
      { error: "Failed to generate interview questions" },
      { status: 500 }
    );
  }
}
