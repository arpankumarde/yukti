"use server";

import prisma from "@/lib/prisma";
import { InterviewType, JobStatus } from "@/generated/prisma";

export async function createJob(payload: {
  title: string;
  description: string;
  location: string;
  perks?: string;
  salary?: string;
  companyId: string;
  experience: string;
  vacancy: number;
  skills?: string[];
  status?: JobStatus;
  jobType?: string;
  applyBy?: Date;
}) {
  const {
    title,
    description,
    experience,
    companyId,
    location,
    perks,
    salary,
    vacancy,
    skills,
    status,
    jobType,
    applyBy,
  } = payload;

  if (
    !title ||
    !description ||
    !experience ||
    !companyId ||
    !location ||
    vacancy === undefined
  ) {
    return { error: "Missing required fields" };
  }

  try {
    const job = await prisma.job.create({
      data: {
        title,
        description,
        experience,
        companyId,
        location,
        perks,
        salary,
        vacancy,
        skills: skills || [],
        status: status || "ACTIVE",
        jobType: jobType || "Full Time",
        applyBy,
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
  location?: string;
  perks?: string;
  salary?: string;
  vacancy?: number;
  skills?: string[];
  status?: JobStatus;
  jobType?: string;
  applyBy?: Date;
}) {
  const {
    id,
    title,
    description,
    experience,
    location,
    perks,
    salary,
    vacancy,
    skills,
    status,
    jobType,
    applyBy,
  } = payload;

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
        ...(location && { location }),
        ...(perks && { perks }),
        ...(salary && { salary }),
        ...(vacancy !== undefined && { vacancy }),
        ...(skills && { skills }),
        ...(status && { status }),
        ...(jobType && { jobType }),
        ...(applyBy && { applyBy }),
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

export async function deleteJob(id: string) {
  try {
    await prisma.job.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete job" };
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
