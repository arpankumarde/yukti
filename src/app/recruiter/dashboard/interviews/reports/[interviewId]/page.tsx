import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CalendarCheck,
  ArrowLeft,
  FileText,
  Users,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const Page = async ({
  params,
}: {
  params: Promise<{ interviewId: string }>;
}) => {
  const { interviewId } = await params;

  const interview = await prisma.interview.findUnique({
    where: {
      interviewId,
    },
    include: {
      InterviewSession: {
        include: {
          application: {
            include: {
              applicant: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          questions: true,
        },
      },
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/recruiter/dashboard">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="border shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Interview Reports
              </CardTitle>
              <CardDescription className="text-gray-600">
                Review applicants{`'`} performance for {interview?.title}
              </CardDescription>
            </div>
            <Badge
              variant={interview?.conductWithAI ? "secondary" : "outline"}
              className="text-sm px-2 py-1"
            >
              {interview?.conductWithAI ? "AI Interview" : "Human Interview"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center gap-2 text-sm text-indigo-600">
            <CalendarCheck className="h-4 w-4" />
            <span>
              {interview?._count.questions || 0} questions in this interview
            </span>
          </div>

          <Separator className="bg-indigo-100" />

          {interview && interview.InterviewSession.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {interview.InterviewSession.map((session) => (
                    <tr
                      key={session.interviewSessionId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">
                              {session.application.applicant.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {session.application.applicant.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {session.attempted ? (
                          <Badge
                            variant="success"
                            className="flex items-center gap-1 bg-green-100 text-green-800"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge
                            variant="destructive"
                            className="flex items-center gap-1 bg-amber-100 text-amber-800"
                          >
                            <XCircle className="h-3 w-3" />
                            Not Attempted
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {session.attempted ? (
                          <Button asChild variant="outline" size="sm">
                            <Link
                              href={`/recruiter/dashboard/interviews/reports/${interviewId}/${session.interviewSessionId}`}
                              className="flex items-center"
                            >
                              <FileText className="h-3.5 w-3.5 mr-1" />
                              View Report
                            </Link>
                          </Button>
                        ) : (
                          <Button disabled variant="outline" size="sm">
                            Report Not Available
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <XCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p>No interview sessions available for this interview.</p>
              <p className="text-sm mt-2">
                Schedule interviews for applicants to see results here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
