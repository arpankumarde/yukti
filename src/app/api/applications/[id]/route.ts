import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { jobId, applicantId, status, resume, score, strength, weakness, coverLetter } = await req.json();

    const application = await prisma.application.create({
      data: {
        jobId,
        applicantId,
        status,
        resume,
        score: score ? String(score) : null,
        strength: strength ? String(strength) : null,
        weakness: weakness ? String(weakness) : null,
        cover_letter: coverLetter ? String(coverLetter) : null,
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