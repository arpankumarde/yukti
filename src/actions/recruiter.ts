"use server";

import prisma from "@/lib/prisma";

export async function createJob(payload: {
  title: string;
  description: string;
  experience: string;
  recruiterId: string;
}) {
  const { title, description, experience, recruiterId } = payload;

  if (!title || !description || !experience || !recruiterId) {
    return { error: "Missing required fields" };
  }

  try {
    const job = await prisma.job.create({
      data: {
        title,
        description,
        experience,
        recruiterId,
      },
    });

    return { job };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong" };
  }
} 