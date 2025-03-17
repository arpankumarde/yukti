import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const authCookie = (await cookieStore).get('ykapptoken');
    
    if (!authCookie) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userData = JSON.parse(authCookie.value);
    const applicantId = userData.applicantId;
    
    // Get application ID from URL
    const applicationId = req.nextUrl.searchParams.get("applicationId");
    
    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    // Fetch application with job details
    const application = await prisma.application.findUnique({
      where: {
        applicationId: applicationId,
        applicantId: applicantId, // Ensure the application belongs to the logged-in user
      },
      include: {
        job: {
          include: {
            recruiter: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application details" },
      { status: 500 }
    );
  }
}