"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Get interview session details with related data
 */
export async function getInterviewSession(sessionId: string) {
  try {
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

    if (!session) {
      return { error: "Interview session not found" };
    }

    return { session };
  } catch (error) {
    console.error("Error fetching interview session:", error);
    return { error: "Failed to fetch interview details" };
  }
}

/**
 * Mark interview as started/attempted
 */
export async function startInterview(sessionId: string) {
  try {
    const session = await prisma.interviewSession.update({
      where: { interviewSessionId: sessionId },
      data: { attempted: true },
    });

    revalidatePath(`/applicant/dashboard/interview/${sessionId}`);
    return { success: true, session };
  } catch (error) {
    console.error("Error starting interview:", error);
    return { error: "Failed to start interview" };
  }
}

/**
 * Save user answer to transcript
 */
export async function saveAnswer({
  sessionId,
  questionId,
  question,
  userAnswer,
  correctAnswer,
  feedback,
  rating,
}: {
  sessionId: string;
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  feedback: string;
  rating: number;
}) {
  try {
    // Get current transcript
    const session = await prisma.interviewSession.findUnique({
      where: { interviewSessionId: sessionId },
      select: { transcript: true },
    });

    if (!session) {
      return { error: "Session not found" };
    }

    // Add new answer to transcript
    const newTranscript = [
      ...session.transcript,
      {
        questionId,
        question,
        userAnswer,
        correctAnswer,
        feedback,
        rating,
        timestamp: new Date().toISOString(),
      },
    ];

    // Update transcript in database
    await prisma.interviewSession.update({
      where: { interviewSessionId: sessionId },
      data: {
        transcript: newTranscript as object[],
        rating: rating, // We can update the overall rating here too
        feedback: feedback,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving answer:", error);
    return { error: "Failed to save answer" };
  }
}

/**
 * Complete interview
 */
export async function completeInterview(sessionId: string) {
  try {
    // Get session with transcript
    const session = await prisma.interviewSession.findUnique({
      where: { interviewSessionId: sessionId },
      select: { transcript: true },
    });

    if (!session?.transcript?.length) {
      return { error: "No answers found in session" };
    }

    // Calculate average rating from all answers
    const ratings = session.transcript.map((entry: any) => entry.rating || 0);
    const averageRating = Math.round(
      ratings.reduce((sum: number, rating: number) => sum + rating, 0) /
        ratings.length
    );

    // Generate comprehensive feedback
    // const feedbackEntries = session.transcript.map(
    //   (entry: any) => entry.feedback
    // );
    const overallFeedback = `Overall performance rating: ${averageRating}/10. 
    Summary: You completed ${session.transcript.length} interview questions with varying levels of effectiveness.
    Key strengths and areas for improvement are reflected in the individual question feedback.`;

    // Update session with final rating and feedback
    const updatedSession = await prisma.interviewSession.update({
      where: { interviewSessionId: sessionId },
      data: {
        attempted: true,
        rating: averageRating,
        feedback: overallFeedback,
      },
    });

    revalidatePath(`/applicant/dashboard/interview/${sessionId}`);
    revalidatePath(`/applicant/dashboard/interview/${sessionId}/feedback`);

    return { success: true, session: updatedSession };
  } catch (error) {
    console.error("Error completing interview:", error);
    return { error: "Failed to complete interview" };
  }
}
