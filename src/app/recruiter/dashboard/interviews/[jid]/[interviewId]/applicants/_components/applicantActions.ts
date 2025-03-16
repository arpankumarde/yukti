"use server";

import prisma from "@/lib/prisma";

export async function createInterviewSessionAction({
  applicationId,
  interviewId,
}: {
  applicationId: string;
  interviewId: string;
}) {
  try {
    const newInterviewSession = await prisma.interviewSession.create({
      data: {
        applicationId,
        interviewId,
      },
    });

    return {
      interviewSession: newInterviewSession,
    };
  } catch (error) {
    console.error(error);
    return {
      error,
    };
  }
}

export async function deleteInterviewSessionAction(interviewSessionId: string) {
  try {
    const interviewSession = await prisma.interviewSession.delete({
      where: { interviewSessionId },
    });

    return {
      interviewSession,
    };
  } catch (error) {
    console.error(error);
    return {
      error,
    };
  }
}
