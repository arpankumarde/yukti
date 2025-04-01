import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Calendar,
  Building2,
  MapPin,
  FileText,
  ExternalLink,
  Clock,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Hourglass,
  DollarSign,
  Gift,
  GraduationCap,
  MessageSquare,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { ReactNode } from "react";
import { withdrawApplication } from "@/actions/application";

const Page = async ({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) => {
  const { applicationId } = await params;

  const application = await prisma.application.findUnique({
    where: {
      applicationId: applicationId,
    },
    include: {
      job: {
        include: {
          company: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!application) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <Card className="overflow-hidden border border-border/40 shadow-sm">
            <CardContent className="py-16 flex flex-col items-center justify-center text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse">
                <Clock className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-medium mb-3">
                Loading Application Details
              </h3>
              <p className="text-muted-foreground max-w-md">
                Please wait while we fetch your application information...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Define status icon and color
  const getStatusDetails = (
    status: string
  ): {
    icon: ReactNode;
    variant: "default" | "destructive" | "outline";
    bgColor: string;
    textColor: string;
  } => {
    switch (status) {
      case "ONBOARDED":
        return {
          icon: <CheckCircle className="h-4 w-4 mr-2" />,
          variant: "outline",
          bgColor: "bg-green-100 dark:bg-green-900/30",
          textColor: "text-green-700 dark:text-green-400",
        };
      case "ACCEPTED":
        return {
          icon: <CheckCircle className="h-4 w-4 mr-2" />,
          variant: "outline",
          bgColor: "bg-green-100 dark:bg-green-900/30",
          textColor: "text-green-700 dark:text-green-400",
        };
      case "REJECTED":
        return {
          icon: <XCircle className="h-4 w-4 mr-2" />,
          variant: "destructive",
          bgColor: "bg-red-100 dark:bg-red-900/30",
          textColor: "text-red-700 dark:text-red-400",
        };
      case "WITHDRAWN":
        return {
          icon: <AlertCircle className="h-4 w-4 mr-2" />,
          variant: "outline",
          bgColor: "bg-gray-100 dark:bg-gray-800",
          textColor: "text-gray-700 dark:text-gray-400",
        };
      default:
        return {
          icon: <Hourglass className="h-4 w-4 mr-2 animate-pulse" />,
          variant: "outline",
          bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
          textColor: "text-yellow-700 dark:text-yellow-400",
        };
    }
  };

  const statusDetails = getStatusDetails(application?.status ?? "PENDING");

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">
              Application Details
            </h1>
            <p className="text-muted-foreground">
              Review your submitted application details and status
            </p>
          </div>
          <Button variant="outline" size="sm" asChild className="gap-2 h-9">
            <Link href="/applicant/dashboard/applied-jobs">
              <ArrowLeft className="h-4 w-4" />
              Back to Applied Jobs
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left column - Main application info */}
          <div className="md:col-span-2 space-y-6">
            <Card className="overflow-hidden border border-border/40 shadow-md">
              <CardHeader className="bg-muted/10 border-b p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      {application.job.title}
                    </CardTitle>
                    <CardDescription className="mt-2 flex flex-wrap gap-3">
                      <span className="inline-flex items-center text-foreground/70">
                        <Building2 className="mr-1.5 h-4 w-4 text-primary/70" />
                        {application.job.company?.name ||
                          "Company not specified"}
                      </span>
                      <span className="inline-flex items-center text-foreground/70">
                        <MapPin className="mr-1.5 h-4 w-4 text-primary/70" />
                        {application.job.location || "Remote"}
                      </span>
                      <span className="inline-flex items-center text-foreground/70">
                        <Briefcase className="mr-1.5 h-4 w-4 text-primary/70" />
                        {application.job.experience || "Not specified"}
                      </span>
                    </CardDescription>
                  </div>

                  <Badge
                    variant={statusDetails.variant}
                    className={cn(
                      "h-7 px-3 py-1 text-sm font-medium rounded-md flex items-center",
                      statusDetails.bgColor,
                      statusDetails.textColor
                    )}
                  >
                    {statusDetails.icon}
                    {application.status || "PENDING"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-8">
                <div className="space-y-6">
                  {/* Application Date */}
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Applied on
                      </h3>
                      <p className="font-medium">
                        {new Date(application.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Job Details Section */}
                  <div className="bg-muted/10 rounded-lg p-5 border border-border/40">
                    <h3 className="font-medium flex items-center gap-2 mb-4">
                      <Briefcase className="h-4 w-4 text-primary" />
                      Job Details
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Experience */}
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 bg-primary/10 p-1.5 rounded-md">
                          <GraduationCap className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Experience
                          </p>
                          <p className="font-medium">
                            {application.job.experience || "Not specified"}
                          </p>
                        </div>
                      </div>

                      {/* Salary */}
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 bg-primary/10 p-1.5 rounded-md">
                          <DollarSign className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Salary
                          </p>
                          <p className="font-medium">
                            {application.job.salary || "Not disclosed"}
                          </p>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 bg-primary/10 p-1.5 rounded-md">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Location
                          </p>
                          <p className="font-medium">
                            {application.job.location || "Remote"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Perks */}
                    {application.job.perks && (
                      <div className="mt-5 pt-5 border-t border-border/30">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 bg-primary/10 p-1.5 rounded-md">
                            <Gift className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Perks & Benefits
                            </p>
                            <p className="text-sm">{application.job.perks}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {application.comments && (
                  <div className="bg-muted/10 rounded-lg p-4 border border-border/60">
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Recruiter Feedback
                    </h3>
                    <div className="bg-background p-3 rounded-md text-sm">
                      {`"${application.comments}"`}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Job Description</h3>
                  <div className="prose prose-sm max-w-none prose-p:text-muted-foreground prose-headings:text-foreground">
                    {application.job.description ? (
                      <div className="whitespace-pre-wrap">
                        {application.job.description}
                      </div>
                    ) : (
                      <div className="text-muted-foreground italic">
                        No description provided for this position.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-muted/5 p-6 border-t">
                {application.status !== "WITHDRAWN" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2">
                        <XCircle className="h-4 w-4" />
                        Withdraw Application
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          withdraw your application from the recruitment
                          process.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <form
                          action={async () => {
                            "use server";
                            withdrawApplication(applicationId);
                          }}
                        >
                          <AlertDialogAction type="submit">
                            Yes, withdraw application
                          </AlertDialogAction>
                        </form>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {application.status === "WITHDRAWN" && (
                  <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-md text-muted-foreground border border-border w-full">
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">
                      This application has been withdrawn and is no longer
                      active.
                    </span>
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>

          {/* Right column - Documents and additional info */}
          <div className="space-y-6">
            <Card className="overflow-hidden border border-border/40 shadow-md">
              <CardHeader className="bg-muted/10 border-b">
                <CardTitle className="text-lg">Your Documents</CardTitle>
                <CardDescription>
                  Attached files for this application
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {application.resume ? (
                  <a
                    href={application.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 bg-primary/5 rounded-md hover:bg-primary/10 transition-colors group"
                  >
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">Resume</h4>
                      <p className="text-xs text-muted-foreground">
                        View your submitted resume
                      </p>
                    </div>
                    <ExternalLink className="ml-2 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </a>
                ) : (
                  <div className="p-4 bg-muted/10 rounded-md border border-dashed border-border">
                    <div className="flex items-center text-muted-foreground">
                      <FileText className="h-4 w-4 mr-2" />
                      <span className="text-sm">No resume attached</span>
                    </div>
                  </div>
                )}

                {application.cover_letter ? (
                  <a
                    href={application.cover_letter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 bg-primary/5 rounded-md hover:bg-primary/10 transition-colors group"
                  >
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">
                        Cover Letter
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        View your submitted cover letter
                      </p>
                    </div>
                    <ExternalLink className="ml-2 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </a>
                ) : (
                  <div className="p-4 bg-muted/10 rounded-md border border-dashed border-border">
                    <div className="flex items-center text-muted-foreground">
                      <FileText className="h-4 w-4 mr-2" />
                      <span className="text-sm">No cover letter attached</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border border-border/40 shadow-md">
              <CardHeader className="bg-muted/10 border-b">
                <CardTitle className="text-lg">Application Timeline</CardTitle>
                <CardDescription>
                  Track your application progress
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="flex-1 w-px bg-border mt-1 mb-1"></div>
                    </div>
                    <div>
                      <p className="font-medium">Application Submitted</p>
                      <time className="text-sm text-muted-foreground">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "h-7 w-7 rounded-full border flex items-center justify-center",
                          application.status
                            ? "bg-primary"
                            : "bg-muted border-border"
                        )}
                      >
                        {application.status ? (
                          <CheckCircle className="h-4 w-4 text-primary-foreground" />
                        ) : (
                          <Hourglass className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div>
                      <p
                        className={cn(
                          "font-medium",
                          !application.status && "text-muted-foreground"
                        )}
                      >
                        Status Updated
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {application.status
                          ? `Updated to ${application.status}`
                          : "Waiting for review"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
