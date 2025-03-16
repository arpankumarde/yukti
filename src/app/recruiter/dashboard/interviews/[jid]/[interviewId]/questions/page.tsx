import prisma from "@/lib/prisma";
import Questions from "./_components/Questions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, HelpCircle } from "lucide-react";

const Page = async ({
  params,
}: {
  params: Promise<{ interviewId: string; jid: string }>;
}) => {
  const { interviewId, jid } = await params;

  const interview = await prisma.interview.findUnique({
    where: { interviewId },
    include: {
      questions: true,
      job: true,
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
  
  // Ensure questions is an array and calculate the correct length
  const questionCount = Array.isArray(interview.questions) ? interview.questions.length : 0;

  return (
    <div className="container mx-auto px-4 py-10">
      <Card className="border shadow-lg animate-fadeIn">
        <CardHeader className="space-y-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-indigo-600" />
            <CardTitle className="text-2xl font-bold text-gray-800">
              Interview Questions
            </CardTitle>
          </div>
          <CardDescription className="text-gray-600">
            Add or generate questions for "{interview.title}" interview
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium flex items-center gap-2 text-indigo-700">
                <HelpCircle className="h-5 w-5" />
                Questions ({questionCount})
              </h3>
              <Separator className="bg-indigo-100" />
            </div>

            <div className="bg-white rounded-md p-1">
              <Questions
                questionProps={interview?.questions || []}
                interviewId={interviewId}
                interviewTitle={interview?.title || ""}
                job={interview?.job}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;