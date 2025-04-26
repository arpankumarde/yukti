import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const { recruiterId, name } = await req.json();

    if (!recruiterId) {
      return NextResponse.json(
        { error: "Missing recruiterId" },
        { status: 400 }
      );
    }

    // Check if recruiter exists
    const existingRecruiter = await prisma.recruiter.findUnique({
      where: { recruiterId },
    });

    if (!existingRecruiter) {
      return NextResponse.json(
        { error: "Recruiter not found" },
        { status: 404 }
      );
    }

    // Update recruiter profile
    const updatedRecruiter = await prisma.recruiter.update({
      where: { recruiterId },
      data: {
        name: name || existingRecruiter.name,
      },
      select: {
        recruiterId: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({ success: true, recruiter: updatedRecruiter });
  } catch (error) {
    console.error("Error updating recruiter profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
