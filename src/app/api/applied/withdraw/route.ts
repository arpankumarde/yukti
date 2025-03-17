import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const authCookie = (await cookieStore).get('ykapptoken');
    
    if (!authCookie) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userData = JSON.parse(authCookie.value);
    const applicantId = userData.applicantId;
    
    const { applicationId } = await req.json();
    
    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    // Find the application and ensure it belongs to the logged-in user
    const application = await prisma.application.findUnique({
      where: {
        applicationId: applicationId,
        applicantId: applicantId,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Update the application status to WITHDRAWN
    const updatedApplication = await prisma.application.update({
      where: {
        applicationId: applicationId,
      },
      data: {
        status: "WITHDRAWN",
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Application withdrawn successfully",
      application: updatedApplication 
    });
  } catch (error) {
    console.error("Error withdrawing application:", error);
    return NextResponse.json(
      { error: "Failed to withdraw application" },
      { status: 500 }
    );
  }
}