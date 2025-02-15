"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function createHR(payload: {
  name: string;
  email: string;
  password: string;
}) {
  const { name, email, password } = payload;

  if (!name || !email || !password) {
    return { error: "Missing required fields" };
  }

  const hashedPassword = await bcrypt.hash(payload?.password, 10);

  try {
    const recruiter = await prisma.recruiter.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return { recruiter };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong" };
  }
}

export async function loginHR(payload: { email: string; password: string }) {
  const { email, password } = payload;

  if (!email || !password) {
    return { error: "Missing required fields" };
  }

  try {
    const recruiter = await prisma.recruiter.findUnique({
      where: {
        email,
      },
    });

    if (!recruiter) {
      return { error: "Invalid credentials" };
    }

    const match = await bcrypt.compare(password, recruiter.password);

    if (!match) {
      return { error: "Invalid credentials" };
    }

    return { recruiter };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong" };
  }
}

export async function createApplicant(payload: {
  name: string;
  email: string;
  password: string;
}) {
  const { name, email, password } = payload;

  if (!name || !email || !password) {
    return { error: "Missing required fields" };
  }

  const hashedPassword = await bcrypt.hash(payload?.password, 10);

  try {
    const applicant = await prisma.applicant.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return { applicant };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong" };
  }
}

export async function loginApplicant(payload: {
  email: string;
  password: string;
}) {
  const { email, password } = payload;

  if (!email || !password) {
    return { error: "Missing required fields" };
  }

  try {
    const applicant = await prisma.applicant.findUnique({
      where: {
        email,
      },
    });

    if (!applicant) {
      return { error: "Invalid credentials" };
    }

    const match = await bcrypt.compare(password, applicant.password);

    if (!match) {
      return { error: "Invalid credentials" };
    }

    return { applicant };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong" };
  }
}
