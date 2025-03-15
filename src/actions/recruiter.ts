"use server";

import prisma from "@/lib/prisma";
import { InterviewType } from "@prisma/client";

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

export async function updateJob(payload: {
  id: string;
  title: string;
  description: string;
  experience: string;
}) {
  const { id, title, description, experience } = payload;

  if (!id || !title || !description || !experience) {
    return { error: "Missing required fields" };
  }

  try {
    const job = await prisma.job.update({
      where: { id },
      data: {
        title,
        description,
        experience,
      },
    });

    return { job };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong" };
  }
}

export async function getJob(id: string) {
  try {
    const job = await prisma.job.findUnique({
      where: { id },
    });
    return { job };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch job" };
  }
}

export async function createInterview(payload: {
  title: string;
  type: InterviewType;
  conductWithAI: boolean;
  conductOffline: boolean;
  scheduledAt: Date;
  completeBy?: Date;
  location?: string;
  jobId: string;
}) {
  const {
    title,
    type,
    conductWithAI,
    conductOffline,
    scheduledAt,
    completeBy,
    location,
    jobId,
  } = payload;

  if (!title || !jobId) {
    return { error: "Missing required fields" };
  }

  try {
    const interview = await prisma.interview.create({
      data: {
        title,
        type,
        conductWithAI,
        conductOffline,
        scheduledAt,
        completeBy,
        location,
        jobId,
      },
    });

    return { interview };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong" };
  }
}
