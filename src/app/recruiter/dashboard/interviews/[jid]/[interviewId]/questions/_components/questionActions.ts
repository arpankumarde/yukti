"use server";

import prisma from "@/lib/prisma";

export async function addQuestionAction({
  question,
  answer,
  interviewId,
}: {
  question: string;
  answer?: string;
  interviewId: string;
}) {
  try {
    const newQuestion = await prisma.interviewQA.create({
      data: {
        question,
        answer,
        interviewId,
      },
    });

    return { question: newQuestion };
  } catch (error) {
    console.error(error);
    return { error };
  }
}
