import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { interviewId, jobTitle, applicantIds } = await request.json();

    // Validate required fields
    if (!interviewId || !jobTitle || !applicantIds || !Array.isArray(applicantIds) || applicantIds.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields or applicantIds is not a valid array" },
        { status: 400 }
      );
    }

    // Get the interview questions
    const interviewQA = await prisma.interviewQA.findMany({
      where: {
        interviewId: interviewId
      }
    });

    if (!interviewQA || interviewQA.length === 0) {
      return NextResponse.json(
        { error: "No questions found for this interview" },
        { status: 404 }
      );
    }

    // Find applications for the applicants
    const applications = await Promise.all(
      applicantIds.map(async (applicantId) => {
        const application = await prisma.application.findFirst({
          where: {
            applicantId: applicantId,
            job: {
              interviews: {
                some: {
                  interviewId: interviewId
                }
              }
            }
          },
          select: {
            applicationId: true
          }
        });
        return application;
      })
    );

    // Filter out any null applications
    const validApplications = applications.filter(app => app !== null);

    if (validApplications.length === 0) {
      return NextResponse.json(
        { error: "No valid applications found for the provided applicant IDs" },
        { status: 404 }
      );
    }

    // Create interview sessions for each valid application
    const interviewSessions = await Promise.all(
      validApplications.map(async (application) => {
        // Check if a session already exists
        const existingSession = await prisma.interviewSession.findUnique({
          where: {
            interviewId_applicationId: {
              interviewId: interviewId,
              applicationId: application.applicationId
            }
          }
        });

        if (existingSession) {
          return existingSession;
        }

        // Create a new interview session
        return prisma.interviewSession.create({
          data: {
            interviewId: interviewId,
            applicationId: application.applicationId,
            attempted: false,
            transcript: [], // This matches your schema's Json[] type
          }
        });
      })
    );

    return NextResponse.json({
      success: true,
      jobTitle,
      interviewSessions,
      questions: interviewQA,
    });
  } catch (error) {
    console.error("Failed to create interview sessions:", error);
    return NextResponse.json(
      { error: "Failed to create interview sessions" },
      { status: 500 }
    );
  }
}