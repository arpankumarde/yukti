"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function addRecruiter(payload: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  companyId: string;
}) {
  const { name, email, phone, password, companyId } = payload;

  if (!name || !email || !password || !companyId) {
    return { error: "Missing required fields" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const recruiter = await prisma.recruiter.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        companyId,
      },
    });

    return { recruiter };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong" };
  }
}

export async function removeRecruiter(recruiterId: string) {
  try {
    const recruiter = await prisma.recruiter.delete({
      where: {
        recruiterId,
      },
    });

    return { recruiter };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong" };
  }
}
