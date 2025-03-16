"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Server action to update application comments
export async function updateApplicationComments(applicationId: string, comments: string) {
  try {
    await prisma.application.update({
      where: {
        applicationId
      },
      data: {
        comments
      }
    });
    
    revalidatePath(`/recruiter/dashboard/applications/[jid]/[aid]`);
    return { success: true };
  } catch (error) {
    console.error("Error updating comments:", error);
    return { error: "Failed to update comments" };
  }
}