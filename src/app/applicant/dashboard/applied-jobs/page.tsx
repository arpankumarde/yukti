import { cookies } from "next/headers";
import {
  Briefcase,
  Calendar,
  FileText,
  MessageSquare,
  Star,
  Building2,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";
import Link from "next/link";
import ExportXLSXButton from "./_components/ExportXLSXButton";
import ExportCSVButton from "./_components/ExportCSVButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface AuthCookie {
  applicantId: string;
}

export default async function AppliedJobsPage() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("ykapptoken");

  if (!authCookie) {
    throw new Error("Authentication required");
  }

  const userData = JSON.parse(authCookie.value) as AuthCookie;
  const applicantId = userData.applicantId;

  const applications = await prisma.application.findMany({
    where: { applicantId },
    select: {
      applicationId: true,
      score: true,
      resume: true,
      cover_letter: true,
      comments: true,
      createdAt: true,
      status: true,
      job: {
        include: {
          company: { select: { name: true } },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Count applications by status for summary section
  const statusCounts = {
    total: applications.length,
    pending: applications.filter(
      (app) => !app.status || app.status === "PENDING"
    ).length,
    accepted: applications.filter((app) => app.status === "ACCEPTED").length,
    rejected: applications.filter((app) => app.status === "REJECTED").length,
    withdrawn: applications.filter((app) => app.status === "WITHDRAWN").length,
  };

  // Helper function to get status badge details
  const getStatusDetails = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return {
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />,
          color:
            "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
          textColor: "text-green-800",
        };
      case "REJECTED":
        return {
          icon: <XCircle className="h-3.5 w-3.5 mr-1" />,
          color: "bg-red-100 text-red-800 hover:bg-red-100 border-red-200",
          textColor: "text-red-800",
        };
      case "WITHDRAWN":
        return {
          icon: <AlertCircle className="h-3.5 w-3.5 mr-1" />,
          color: "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200",
          textColor: "text-gray-800",
        };
      default:
        return {
          icon: <Clock className="h-3.5 w-3.5 mr-1" />,
          color:
            "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200",
          textColor: "text-yellow-800",
        };
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              My Applied Jobs
            </h1>
            <p className="text-muted-foreground mt-1 ml-12">
              Track the status of your job applications and stay updated on your
              career journey
            </p>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-3 self-start md:self-auto">
            <ExportXLSXButton applications={applications} />
            <ExportCSVButton applications={applications} />
          </div>
        </div>

        {/* Stats Summary Cards */}
        {applications.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-primary/5 border-primary/10">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="mt-2 font-semibold text-3xl">
                  {statusCounts.total}
                </div>
                <p className="text-sm text-muted-foreground">
                  Total Applications
                </p>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-900/20">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="mt-2 font-semibold text-3xl text-yellow-700 dark:text-yellow-400">
                  {statusCounts.pending}
                </div>
                <p className="text-sm text-yellow-600 dark:text-yellow-500">
                  Pending
                </p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="mt-2 font-semibold text-3xl text-green-700 dark:text-green-400">
                  {statusCounts.accepted}
                </div>
                <p className="text-sm text-green-600 dark:text-green-500">
                  Accepted
                </p>
              </CardContent>
            </Card>

            <Card className="bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="mt-2 font-semibold text-3xl text-red-700 dark:text-red-400">
                  {statusCounts.rejected + statusCounts.withdrawn}
                </div>
                <p className="text-sm text-red-600 dark:text-red-500">
                  Rejected/Withdrawn
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter Controls */}
        {applications.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="text-sm text-muted-foreground">
              Showing {applications.length} applications
            </div>

            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        )}

        {/* Applications Grid */}
        <div className="grid gap-6">
          {applications.map((app) => {
            const statusDetails = getStatusDetails(app?.status ?? "");
            const formattedDate = new Date(app.createdAt).toLocaleDateString(
              undefined,
              {
                year: "numeric",
                month: "short",
                day: "numeric",
              }
            );

            return (
              <Card
                key={app.applicationId}
                className="overflow-hidden transition-all duration-200 hover:shadow-md group border border-border/40"
              >
                <CardHeader className="pb-2 pt-5 px-5">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div>
                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                        {app.job.title}
                      </CardTitle>
                      <CardDescription className="flex flex-wrap mt-3 gap-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Building2 className="w-3.5 h-3.5 mr-1.5 text-muted-foreground/70" />
                          {app.job.company?.name || "Company not specified"}
                        </div>

                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-muted-foreground/70" />
                          {app.job.location || "Remote"}
                        </div>

                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5 mr-1.5 text-muted-foreground/70" />
                          Applied on {formattedDate}
                        </div>
                      </CardDescription>
                    </div>

                    <Badge
                      className={cn(
                        "rounded-md flex items-center px-3 py-1.5",
                        statusDetails.color
                      )}
                    >
                      {statusDetails.icon}
                      {app.status || "PENDING"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="px-5 py-4">
                  <Separator className="my-4" />

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">Resume</h4>
                        {app.resume ? (
                          <a
                            href={app.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                          >
                            View Resume
                            <ChevronRight className="h-3 w-3" />
                          </a>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">
                            Not provided
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">
                          Feedback
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {app.comments || "No feedback yet"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <Star className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">
                          Cover Letter
                        </h4>
                        {app.cover_letter ? (
                          <a
                            href={app.cover_letter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                          >
                            View Cover Letter
                            <ChevronRight className="h-3 w-3" />
                          </a>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">
                            Not provided
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="bg-muted/5 p-4 border-t">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    <Link
                      href={`/applicant/dashboard/applied-jobs/${app.applicationId}`}
                    >
                      View Application Details
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {applications.length === 0 && (
          <Card className="border border-dashed border-border/60">
            <CardContent className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Briefcase className="w-10 h-10 text-primary/60" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                No applications yet
              </h3>
              <p className="text-muted-foreground max-w-md mb-8">
                You have not applied to any jobs yet. Start exploring
                opportunities and tracking your applications here.
              </p>
              <Button asChild size="lg">
                <Link href="/applicant/dashboard/jobs">
                  Browse Available Jobs
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
