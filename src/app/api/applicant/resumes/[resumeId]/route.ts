import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { resumeId: string } }
) {
  try {
    const resumeId = params.resumeId;

    const resume = await prisma.resume.findUnique({
      where: { resumeId },
    });

    if (!resume) {
      return NextResponse.json(
        { message: "Resume not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(resume);
  } catch (error) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      { message: "Failed to fetch resume" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { resumeId: string } }
) {
  try {
    const resumeId = params.resumeId;
    const data = await request.json();

    // Check if resume exists
    const existingResume = await prisma.resume.findUnique({
      where: { resumeId },
    });

    if (!existingResume) {
      return NextResponse.json(
        { message: "Resume not found" },
        { status: 404 }
      );
    }

    // Check if this is set as default and update other resumes if needed
    if (data.isDefault) {
      await prisma.resume.updateMany({
        where: {
          applicantId: existingResume.applicantId,
          isDefault: true,
          resumeId: { not: resumeId },
        },
        data: { isDefault: false },
      });
    }

    // Update the resume
    const updatedResume = await prisma.resume.update({
      where: { resumeId },
      data: {
        title: data.title,
        address: data.address,
        summary: data.summary,
        education: data.education,
        experience: data.experience,
        skills: data.skills,
        languages: data.languages,
        certifications: data.certifications,
        projects: data.projects,
        achievements: data.achievements,
        publications: data.publications,
        references: data.references,
        socialLinks: data.socialLinks,
        isDefault: data.isDefault,
      },
    });

    return NextResponse.json(updatedResume);
  } catch (error) {
    console.error("Error updating resume:", error);
    return NextResponse.json(
      { message: "Failed to update resume" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { resumeId: string } }
) {
  try {
    const resumeId = params.resumeId;

    // Check if resume exists
    const existingResume = await prisma.resume.findUnique({
      where: { resumeId },
    });

    if (!existingResume) {
      return NextResponse.json(
        { message: "Resume not found" },
        { status: 404 }
      );
    }

    // Check if this resume is used in any applications
    const applications = await prisma.application.findMany({
      where: { resumeId },
    });

    if (applications.length > 0) {
      return NextResponse.json(
        { message: "Cannot delete resume that is used in applications" },
        { status: 400 }
      );
    }

    // Delete the resume
    await prisma.resume.delete({
      where: { resumeId },
    });

    return NextResponse.json(
      { message: "Resume deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting resume:", error);
    return NextResponse.json(
      { message: "Failed to delete resume" },
      { status: 500 }
    );
  }
}
