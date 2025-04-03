import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize the OpenAI client with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Get form data from the request
    const formData = await req.formData();
    const audioFile = formData.get("file") as File | null;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }

    // Get optional parameters
    const language = formData.get("language") as string | null;
    const prompt = formData.get("prompt") as string | null;

    // Create a Buffer from the audio file
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type });
    
    // Create a File object that OpenAI can process
    const file = new File([audioBlob], audioFile.name, { 
      type: audioFile.type 
    });

    // Send to OpenAI Whisper API for transcription
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: language || undefined,
      prompt: prompt || undefined,
      response_format: "json",
    });

    // Return success response with transcription
    return NextResponse.json({
      success: true,
      text: transcription.text,
    });
    
  } catch (error: any) {
    console.error("Transcription error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to transcribe audio", 
        message: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Configure the API route
export const config = {
  api: {
    // Disable the default body parser to handle file uploads
    bodyParser: false,
    // Set a reasonable response size limit
    responseLimit: '10mb',
  },
};