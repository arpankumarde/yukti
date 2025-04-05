import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Calendar,
  XCircle,
  MessageSquare,
  FileText,
  Star,
  ArrowLeft,
  Phone,
} from "lucide-react";

interface TranscriptEntry {
  rating: number;
  feedback: string;
  question: string;
  timestamp: string;
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
}

const Page = async ({
  params,
}: {
  params: Promise<{ interviewId: string; interviewSessionId: string }>;
}) => {
  const { interviewId, interviewSessionId } = await params;

  const interviewSession = await prisma.interviewSession.findUnique({
    where: {
      interviewSessionId,
    },
    include: {
      interview: true,
      application: {
        include: {
          applicant: true,
        },
      },
    },
  });

  const transcriptEntries: TranscriptEntry[] =
    (interviewSession?.transcript as unknown as TranscriptEntry[]) || [];

  if (!interviewSession) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600">
              Error: Interview session not found for ID {interviewSessionId}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/recruiter/dashboard/interviews/reports/${interviewId}`}>
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Interview Reports
          </Button>
        </Link>
      </div>

      <Card className="mb-8 border shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Interview Session Report
              </CardTitle>
              <CardDescription className="text-gray-600">
                Review detailed results and transcript
              </CardDescription>
            </div>
            <Badge
              variant={interviewSession.attempted ? "default" : "secondary"}
              className="text-sm px-2 py-1"
            >
              {interviewSession.attempted ? "Completed" : "Not Attempted"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Interview Details
              </h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <FileText className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-500">Interview Title:</span>
                  <span className="ml-2 font-medium">
                    {interviewSession.interview.title}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-500">Interview ID:</span>
                  <span className="ml-2 font-medium text-gray-800">
                    {interviewSession.interviewId}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-500">Session ID:</span>
                  <span className="ml-2 font-medium text-gray-800">
                    {interviewSession.interviewSessionId}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Applicant Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 font-medium">
                    {interviewSession.application.applicant.name}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-2 font-medium">
                    {interviewSession.application.applicant.email}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-500">Phone:</span>
                  <span className="ml-2 font-medium">
                    {interviewSession.application.applicant.phone ||
                      "Not provided"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Performance Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-blue-50 border border-blue-100">
                <CardContent className="flex items-center gap-2">
                  <Star size={20} className="w-6 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-gray-800">Overall Rating</p>
                    <p className="font-medium">
                      {interviewSession.rating ? (
                        <span className="flex items-center gap-1">
                          {interviewSession.rating}/10
                        </span>
                      ) : (
                        "Not rated yet"
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-indigo-50 border border-indigo-100">
                <CardContent className="flex items-start gap-2">
                  <MessageSquare size={20} className="w-6 text-indigo-700" />
                  <div className="flex-1">
                    <p className="text-gray-800">Overall Feedback</p>
                    <p className="font-medium text-gray-800">
                      {interviewSession.feedback || "No feedback provided"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-gray-700" />
            Interview Transcript
          </CardTitle>
          <CardDescription>
            Questions and answers from the interview session
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {transcriptEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                      Question
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                      User Answer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                      Correct Answer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                      Feedback
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transcriptEntries.map((entry, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800 w-64">
                        {entry?.question}
                      </td>
                      <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-600 w-64">
                        {entry.userAnswer}
                      </td>
                      <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-600 w-64">
                        {entry.correctAnswer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Badge
                          variant={
                            entry.rating > 7
                              ? "default"
                              : entry.rating > 4
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {entry.rating}/10
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-600 w-64">
                        {entry.feedback}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <XCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p>No transcript available for this interview session.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
