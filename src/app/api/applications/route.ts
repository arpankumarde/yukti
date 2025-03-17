import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { jobId, applicantId, status, resume, score, strength, weakness, coverLetter, keywords } = await req.json();

    // Debug the incoming keywords data
    console.log("Received keywords:", keywords);
    console.log("Keywords type:", typeof keywords);
    console.log("Is Array:", Array.isArray(keywords));

    // Ensure keywords are properly formatted as an array of strings
    const sanitizedKeywords = Array.isArray(keywords) 
      ? keywords
          .filter(k => k !== null && k !== undefined) // Remove null/undefined
          .map(k => String(k).trim())                 // Convert to string and trim
          .filter(k => k !== '')                      // Remove empty strings
      : [];
    
    console.log("Sanitized keywords:", sanitizedKeywords);

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
        keywords: sanitizedKeywords, // Use sanitized keywords
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, score, strength, weakness } = await req.json();

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        score: score ? String(score) : null,
        strength: strength ? String(strength) : null,
        weakness: weakness ? String(weakness) : null,
      },
    });

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}