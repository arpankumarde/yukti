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
import { Users, CalendarCheck } from "lucide-react";

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
    <div className="container mx-auto px-4 py-10">
      <Card className="border shadow-lg">
        <CardHeader className="space-y-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" />
            <CardTitle className="text-2xl font-bold text-gray-800">
              Select Applicants
            </CardTitle>
          </div>
          <CardDescription className="text-gray-600">
            Choose the applicants who will participate in &quot;{interview.title}&quot;
          </CardDescription>
          
          <div className="flex items-center gap-2 text-sm text-indigo-600 mt-2">
            <CalendarCheck className="h-4 w-4" />
            {interview.conductWithAI 
              ? `Complete by: ${interview.completeBy?.toLocaleDateString() || 'Not specified'}`
              : `Scheduled for: ${interview.scheduledAt?.toLocaleDateString() || 'Not specified'}`
            }
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium flex items-center gap-2 text-indigo-700">
                <Users className="h-5 w-5" />
                Available Candidates ({applications.length})
              </h3>
              <Separator className="bg-indigo-100" />
            </div>

            <div className="bg-white rounded-md p-1">
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