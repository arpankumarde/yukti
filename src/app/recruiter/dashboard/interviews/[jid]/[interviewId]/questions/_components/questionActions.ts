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
        answer: answer?.length ? answer : null,
        interviewId,
      },
    });

    return { question: newQuestion };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

export async function updateQuestionAction({
  question,
  answer,
  interviewQAId,
}: {
  question: string;
  answer?: string;
  interviewQAId: string;
}) {
  try {
    const updatedQuestion = await prisma.interviewQA.update({
      where: { interviewQAId },
      data: {
        question,
        answer: answer?.length ? answer : null,
      },
    });

    return { question: updatedQuestion };
  } catch (error) {
    console.error(error);
    return { error };
  }
}

export async function deleteQuestionAction(interviewQAId: string) {
  try {
    const question = await prisma.interviewQA.delete({
      where: { interviewQAId },
    });

    return { question };
  } catch (error) {
    console.error(error);
    return { error };
  }
}
