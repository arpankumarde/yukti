import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { applicantId, name, phone } = body;

    if (!applicantId) {
      return NextResponse.json(
        { error: "Applicant ID is required" },
        { status: 400 }
      );
    }

    // Update applicant in database
    const updatedApplicant = await prisma.applicant.update({
      where: { applicantId },
      data: {
        name,
        phone,
        updatedAt: new Date(),
      },
      select: {
        applicantId: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    return NextResponse.json({
      success: true,
      applicant: updatedApplicant,
    });
  } catch (error) {
    console.error("Error updating applicant profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
