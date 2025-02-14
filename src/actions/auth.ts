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
    const hr = await prisma.hR.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return { hr };
  } catch (error) {
    return { error: "Something went wrong" };
  }
}
