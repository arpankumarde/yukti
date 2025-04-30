import React from "react";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { getCookie } from "cookies-next";
import { Applicant } from "@/generated/prisma";
import ResumeEditForm from "./ResumeEditForm";

const Page = async ({ params }: { params: Promise<{ resumeId: string }> }) => {
  const { resumeId } = await params;

  const userCookie = await getCookie("ykapptoken", { cookies });
  const user = userCookie ? (JSON.parse(userCookie) as Applicant) : undefined;

  if (!user) {
    redirect("/applicant/login");
  }

  const resume = await prisma.resume.findUnique({
    where: {
      resumeId,
      applicantId: user.applicantId,
    },
  });

  if (!resume) {
    notFound();
  }

  return (
    <div className="space-y-6 p-6 md:p-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/applicant/dashboard/resumes/${resumeId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Edit Resume</h1>
        </div>
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>

      <Card className="bg-background shadow-xl border-muted">
        <CardHeader className="border-b bg-muted/10 p-6">
          <CardTitle>Edit {resume.title}</CardTitle>
          <CardDescription>Update your resume information</CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <ResumeEditForm resume={resume} applicantId={user.applicantId} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
