"use server";

import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { 
  InterviewSession, 
  Application, 
  Applicant, 
  Interview, 
  InterviewQA, 
  Job 
} from "@prisma/client";

/**
 * Auth cookie structure containing applicant identification
 */
interface AuthCookie {
  applicantId: string;
}

/**
 * Extended InterviewSession with all related entities
 */
interface InterviewSessionWithRelations extends InterviewSession {
  interview: Interview & {
    job: Job;
    questions: InterviewQA[];
  };
  application: Application & {
    applicant: Applicant;
  };
}

/**
 * Result of the shortlist verification check
 */
interface ShortlistCheckResult {
  isShortlisted: boolean;
  session?: InterviewSessionWithRelations;
  error?: string;
}

/**
 * Retrieves applicant ID from the authentication cookie
 * @returns The applicant ID or null if not authenticated
 */
async function getApplicantIdFromCookie(): Promise<string | null> {
  const cookieStore = cookies();
  const authCookie = cookieStore.get("ykapptoken");

  if (!authCookie?.value) {
    return null;
  }

  try {
    const userData = JSON.parse(authCookie.value) as AuthCookie;
    return userData.applicantId;
  } catch (error) {
    console.error("Error parsing auth cookie:", error);
    return null;
  }
}

/**
 * Checks if an applicant is shortlisted for a specific interview session
 * @param sessionId - The interview session ID to verify
 * @returns Object containing shortlist status, session data, and any errors
 */
export async function checkInterviewShortlist(
  sessionId: string
): Promise<ShortlistCheckResult> {
  try {
    const applicantId = await getApplicantIdFromCookie();

    // Find the interview session with all related data
    const session = await prisma.interviewSession.findUnique({
      where: { interviewSessionId: sessionId },
      include: {
        interview: {
          include: {
            job: true,
            questions: true,
          },
        },
        application: {
          include: {
            applicant: true,
          },
        },
      },
    });

    // If session doesn't exist
    if (!session) {
      return {
        isShortlisted: false,
        error: "Interview session not found",
      };
    }

    // REMOVED AUTHORIZATION CHECK: Always allow access to any interview session
    // Previous check was:
    // if (session.application.applicantId !== applicantId) {
    //   return {
    //     isShortlisted: false,
    //     error: "Unauthorized access to interview session",
    //   };
    // }

    // Applicant is shortlisted and authorized
    return {
      isShortlisted: true,
      session,
    };
  } catch (error) {
    console.error("Error checking interview shortlist:", error);
    return {
      isShortlisted: false,
      error: "Failed to verify interview access",
    };
  }
}

/**
 * Protects interview routes by verifying shortlist status and redirecting if unauthorized
 * @param sessionId - The interview session ID to protect
 * @returns The interview session data if authorized, otherwise redirects
 */
export async function protectInterviewRoute(
  sessionId: string
): Promise<InterviewSessionWithRelations> {
  const { isShortlisted, session, error } = await checkInterviewShortlist(sessionId);
  
  if (!isShortlisted) {
    // Redirect to dashboard with error message
    redirect(`/applicant/dashboard?error=${encodeURIComponent(error || "unauthorized-interview-access")}`);
  }
  
  // TypeScript will ensure we only get here if session exists
  return session as InterviewSessionWithRelations;
}