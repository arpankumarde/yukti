import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.applicantId || !data.title) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if this is set as default and update other resumes if needed
    if (data.isDefault) {
      await prisma.resume.updateMany({
        where: {
          applicantId: data.applicantId,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    // Create the resume
    const resume = await prisma.resume.create({
      data: {
        applicantId: data.applicantId,
        title: data.title,
        address: data.address || null,
        summary: data.summary || null,
        education: data.education || [],
        experience: data.experience || [],
        skills: data.skills || [],
        languages: data.languages || [],
        certifications: data.certifications || [],
        projects: data.projects || [],
        achievements: data.achievements || [],
        publications: data.publications || [],
        references: data.references || [],
        socialLinks: data.socialLinks || [],
        isDefault: data.isDefault || false,
      },
    });

    return NextResponse.json(
      { message: "Resume created successfully", resumeId: resume.resumeId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating resume:", error);
    return NextResponse.json(
      { message: "Failed to create resume" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const applicantId = url.searchParams.get("applicantId");

    if (!applicantId) {
      return NextResponse.json(
        { message: "Applicant ID is required" },
        { status: 400 }
      );
    }

    const resumes = await prisma.resume.findMany({
      where: { applicantId },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(resumes);
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return NextResponse.json(
      { message: "Failed to fetch resumes" },
      { status: 500 }
    );
  }
}
