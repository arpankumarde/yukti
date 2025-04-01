import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Edit, Calendar, Trash2, Users } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { TiEye } from "react-icons/ti";
import { revalidatePath } from "next/cache";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const JobDetailsPage = async ({
  params,
}: {
  params: Promise<{ jid: string }>;
}) => {
  const { jid } = await params;
  const job = await prisma.job.findUnique({
    where: { id: jid },
    include: {
      company: true,
      interviews: {
        include: {
          _count: {
            select: { InterviewSession: true },
          },
        },
      },
      _count: {
        select: { applications: true, interviews: true },
      },
    },
  });

  if (!job) {
    return <div>Job not found</div>;
  }

  // Remove total interviews from jobDetails
  const jobDetails = [
    { label: "ID", value: job.id },
    { label: "Title", value: job.title },
    {
      label: "Description",
      value: job.description || "No description provided",
    },
    { label: "Location", value: job.location },
    { label: "Experience", value: job.experience },
    { label: "Salary", value: job.salary || "Not specified" },
    { label: "Perks", value: job.perks || "Not specified" },
    {
      label: "Total Applications",
      value: job._count.applications,
      hasViewButton: true,
    },
    { label: "Recruiter", value: job.company.name },
    {
      label: "Created At",
      value: new Date(job.createdAt).toLocaleString(),
      className: "text-muted-foreground",
    },
    {
      label: "Updated At",
      value: new Date(job.updatedAt).toLocaleString(),
      className: "text-muted-foreground",
    },
  ];

  return (
    <div className="space-y-6 p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-full hover:bg-primary/10"
          >
            <Link href="/recruiter/dashboard/postings">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text">
            Job Details
          </h1>
        </div>
        <Button asChild variant="default">
          <Link href={`/recruiter/dashboard/postings/${job.id}/edit`}>
            <Edit className="h-4 w-4" />
            Edit Job
          </Link>
        </Button>
      </div>

      <div className="grid gap-8">
        <Card className="bg-background shadow-lg border-muted/40 overflow-hidden">
          <CardHeader className="bg-muted/5 border-b p-6">
            <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <span className="bg-primary/10 p-2 rounded-md">
                <Briefcase className="h-5 w-5 text-primary" />
              </span>
              Basic Information
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-lg divide-y">
              {jobDetails.map(
                ({ label, value, hasViewButton, className }, index) => (
                  <div
                    key={index}
                    className={cn(
                      "grid grid-cols-3 px-6 py-4 items-center text-sm transition-colors",
                      index % 2 === 0 ? "bg-background" : "bg-muted/5"
                    )}
                  >
                    <div className="font-medium text-gray-500">{label}</div>
                    <div className={cn("col-span-2", className)}>
                      <span>{value}</span>
                      {hasViewButton && value > 0 && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="ml-4 hover:bg-primary/10"
                        >
                          <Link
                            href={`/recruiter/dashboard/applications/${job.id}`}
                            className="flex items-center gap-2"
                          >
                            <TiEye className="h-4 w-4" />
                            View Applications
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background shadow-lg border-muted/40 overflow-hidden">
          <CardHeader className="bg-muted/5 border-b p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                <span className="bg-primary/10 p-2 rounded-md">
                  <Calendar className="h-5 w-5 text-primary" />
                </span>
                Interviews ({job._count.interviews})
              </h2>
              <Button asChild variant="default" className="gap-2">
                <Link href={`/recruiter/dashboard/interviews/${job.id}/new`}>
                  <Calendar className="h-4 w-4" />
                  Schedule Interview
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {job.interviews.length > 0 ? (
              <div className="space-y-4">
                {job.interviews.map((interview) => (
                  <Card
                    key={interview.interviewId}
                    className="overflow-hidden border-muted/20"
                  >
                    <div className="p-5 bg-white hover:bg-muted/5 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <h3 className="font-medium text-lg">
                            {interview.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="font-normal">
                              {interview.type}
                            </Badge>

                            {interview.conductWithAI ? (
                              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-sm py-1 px-3 flex items-center gap-1.5">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-3.5 w-3.5"
                                >
                                  <path d="M12 2a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4a2 2 0 0 1-2-2V4a2 2 0 0 0-2-2z" />
                                  <path d="M9 16c.85-.63 1.87-1 3-1s2.15.37 3 1" />
                                  <circle cx="8" cy="12" r="1" />
                                  <circle cx="16" cy="12" r="1" />
                                </svg>
                                AI Interview
                              </Badge>
                            ) : interview.conductOffline ? (
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                              >
                                Offline Interview
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                              >
                                Video Interview
                              </Badge>
                            )}

                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
                            >
                              <Users className="h-3 w-3" />
                              {interview._count?.InterviewSession || 0}{" "}
                              Applicants
                            </Badge>

                            {interview.scheduledAt && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(
                                  interview.scheduledAt
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="gap-1"
                          >
                            <Link
                              href={`/recruiter/dashboard/interviews/reports/${interview.interviewId}`}
                            >
                              <TiEye className="h-4 w-4" />
                              View
                            </Link>
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            asChild
                          >
                            <Link
                              href={`/recruiter/dashboard/interviews/${job.id}/${interview.interviewId}/questions`}
                            >
                              <Edit className="h-3.5 w-3.5" />
                              Edit
                            </Link>
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="gap-1"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Interview
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this
                                  interview? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <form
                                  action={async () => {
                                    "use server";
                                    // Assuming you have or will create a deleteInterview action
                                    // You'll need to implement this function in your actions file
                                    const result = await deleteInterview(
                                      interview.interviewId
                                    );
                                    if (result?.success) {
                                      revalidatePath(
                                        `/recruiter/dashboard/postings/${job.id}`
                                      );
                                    }
                                  }}
                                >
                                  <AlertDialogAction type="submit">
                                    Delete
                                  </AlertDialogAction>
                                </form>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed rounded-lg bg-muted/5">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">
                  No Interviews Scheduled
                </h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                  Get started by scheduling your first interview to evaluate
                  candidates for this position.
                </p>
                <Button className="mt-6" size="lg" asChild>
                  <Link href={`/recruiter/dashboard/interviews/${job.id}/new`}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule First Interview
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobDetailsPage;

// Add the missing icon
const Briefcase = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
};

export async function deleteInterview(interviewId: string) {
  try {
    await prisma.interview.delete({
      where: { interviewId },
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete interview" };
  }
}
