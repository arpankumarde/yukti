import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyTurnstileToken } from "@/lib/turnstile"; // Add this import

export async function POST(req: NextRequest) {
  try {
    const {
      jobId,
      applicantId,
      status,
      resume,
      coverLetter,
      score,
      strength,
      weakness,
      keywords,
      turnstileToken, // Add this
    } = await req.json();

    // Validate required fields
    if (!jobId || !applicantId || !status || !resume) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate turnstile token
    if (!turnstileToken) {
      return NextResponse.json(
        { error: "CAPTCHA verification required" },
        { status: 400 }
      );
    }

    const isValid = await verifyTurnstileToken(turnstileToken);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid CAPTCHA verification" },
        { status: 400 }
      );
    }

    // Sanitize keywords array if needed
    const sanitizedKeywords = Array.isArray(keywords) ? keywords : [];

    const application = await prisma.application.create({
      data: {
        jobId,
        applicantId,
        status,
        resume,
        score: score ? Number(score) : null,
        strength: strength ? String(strength) : null,
        weakness: weakness ? String(weakness) : null,
        cover_letter: coverLetter ? String(coverLetter) : null,
        keywords: sanitizedKeywords
      }
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}