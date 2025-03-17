import prisma from "@/lib/prisma";
import Applicants from "./_components/Applicants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Users, CalendarCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Page = async ({
  params,
}: {
  params: Promise<{ jid: string; interviewId: string }>;
}) => {
  const { jid, interviewId } = await params;

  const applications = await prisma.application.findMany({
    where: { jobId: jid },
    include: {
      applicant: true,
    },
  });

  const interview = await prisma.interview.findUnique({
    where: { interviewId },
    include: {
      job: true,
    },
  });

  const interviewSessions = await prisma.interviewSession.findMany({
    where: { interviewId },
    include: {
      application: true,
    },
  });

  if (!interview) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600">
              Error: Interview not found for interviewId {interviewId}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link
              href={`/recruiter/dashboard/interviews/${jid}/${interviewId}/questions`}
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Select Applicants</h1>
        </div>
        <Users className="h-6 w-6 text-muted-foreground" />
      </div>

      <Card className="bg-background shadow-xl border-muted">
        <CardHeader className="border-b bg-muted/10 p-6">
          <CardTitle>Available Candidates</CardTitle>
          <CardDescription>
            Choose the applicants who will participate in &quot;
            {interview.title}&quot;
          </CardDescription>

          <div className="flex items-center gap-2 text-sm text-primary mt-2">
            <CalendarCheck className="h-4 w-4" />
            {interview.conductWithAI
              ? `Complete by: ${
                  interview.completeBy?.toLocaleDateString() || "Not specified"
                }`
              : `Scheduled for: ${
                  interview.scheduledAt?.toLocaleDateString() || "Not specified"
                }`}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-primary inline-flex items-center gap-2">
                <Users className="h-5 w-5" />
                Candidates ({applications.length})
              </h3>
              <Separator />
            </div>

            <div className="bg-background rounded-md">
              <Applicants
                applications={applications}
                interviewSessions={interviewSessions}
                interviewId={interviewId}
                jobId={jid}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
