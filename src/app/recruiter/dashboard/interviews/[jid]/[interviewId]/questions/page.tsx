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
import { MessageSquare, HelpCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
  const questionCount = Array.isArray(interview.questions)
    ? interview.questions.length
    : 0;

  return (
    <div className="space-y-6 p-6 md:p-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/recruiter/dashboard/postings/${jid}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Interview Questions</h1>
        </div>
        <MessageSquare className="h-6 w-6 text-muted-foreground" />
      </div>

      <Card className="bg-background shadow-xl border-muted">
        <CardHeader className="border-b bg-muted/10 p-6">
          <CardTitle>Question Management</CardTitle>
          <CardDescription>
            Add or generate questions for {`"${interview.title}`} interview
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-primary inline-flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Questions ({questionCount})
              </h3>
              <Separator />
            </div>

            <div className="bg-background rounded-md">
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
