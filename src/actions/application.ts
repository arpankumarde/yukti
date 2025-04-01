"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function withdrawApplication(applicationId: string) {
  if (!applicationId) {
    return { error: "Missing required fields" };
  }

  try {
    const updatedApplication = await prisma.application.update({
      where: {
        applicationId: applicationId,
      },
      data: {
        status: "WITHDRAWN",
      },
    });

    revalidatePath(`/applicant/dashboard/applied-jobs/${applicationId}`);
    return { updatedApplication };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong" };
  }
}
