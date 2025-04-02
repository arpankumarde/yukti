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
  Job,
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
export interface InterviewSessionWithRelations extends InterviewSession {
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
  const cookieStore = await cookies();
  const authCookie = await cookieStore.get("ykapptoken");

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

    // Check if user is authenticated
    if (!applicantId) {
      return {
        isShortlisted: false,
        error: "Authentication required. Please log in.",
      };
    }

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

    // Check if the current user is the one shortlisted for this interview
    if (session.application.applicantId !== applicantId) {
      return {
        isShortlisted: false,
        error: "You are not authorized to access this interview session",
      };
    }

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
  const { isShortlisted, session, error } = await checkInterviewShortlist(
    sessionId
  );

  if (!isShortlisted || !session) {
    // Redirect to dashboard with error message
    redirect(
      `/applicant/dashboard?error=${encodeURIComponent(
        error || "unauthorized-interview-access"
      )}`
    );
  }

  return session;
}
