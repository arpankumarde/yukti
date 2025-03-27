import {
  Briefcase,
  Building2,
  MapPin,
  Coins,
  Gift,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PageProps {
  params: Promise<{ jid: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Job Details - ${resolvedParams.jid}`,
    description: "View detailed information about this job position",
  };
}

export default async function JobDetails({ params }: PageProps) {
  const resolvedParams = await params;
  const { jid } = resolvedParams;

  if (!jid) {
    notFound();
  }

  // Get the current user information from cookies
  const cookieStore = cookies();
  const authCookie = (await cookieStore).get("ykapptoken");

  let hasApplied = false;
  let applicantId: string | null = null;

  // Check if the user is logged in and get applicantId
  if (authCookie && authCookie.value) {
    try {
      const userData = JSON.parse(authCookie.value);
      applicantId = userData.applicantId;

      // Check if the user has already applied for this job
      if (applicantId) {
        const existingApplication = await prisma.application.findUnique({
          where: {
            applicantId_jobId: {
              applicantId,
              jobId: jid,
            },
          },
        });

        hasApplied = !!existingApplication;
      }
    } catch (error) {
      console.error("Error checking application status:", error);
    }
  }

  const job = await prisma.job.findUnique({
    where: {
      id: jid,
    },
    include: {
      recruiter: true,
      interviews: {
        select: {
          interviewId: true,
          title: true,
          type: true,
          conductWithAI: true,
          conductOffline: true,
        },
      },
    },
  });

  if (!job) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-secondary/10 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="border-border shadow-sm overflow-hidden">
          <CardHeader className="bg-secondary/20 border-b border-border pb-6">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Briefcase className="h-5 w-5" />
              <CardDescription>Job Details</CardDescription>
            </div>
            <CardTitle className="text-3xl font-bold">{job.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mt-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{job.recruiter?.name || "Company not specified"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Key Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Experience
                </h3>
                <p className="text-foreground font-medium">
                  {job.experience || "Not specified"}
                </p>
              </div>

              {job.salary && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Salary
                  </h3>
                  <p className="text-foreground font-medium flex items-center gap-2">
                    <Coins className="h-4 w-4 text-primary" />
                    {job.salary}
                  </p>
                </div>
              )}

              {job.perks && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Perks
                  </h3>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-100"
                  >
                    <Gift className="h-3 w-3 mr-1" />
                    Perks Included
                  </Badge>
                </div>
              )}
            </div>

            <Separator />

            {/* Job Description */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                Job Description
              </h2>
              <div className="text-muted-foreground whitespace-pre-wrap prose prose-sm max-w-none">
                {job.description || "No detailed description provided."}
              </div>
            </div>

            {job.perks && (
              <>
                <Separator />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">
                    Perks & Benefits
                  </h2>
                  <div className="text-muted-foreground">{job.perks}</div>
                </div>
              </>
            )}

            {job.interviews && job.interviews.length > 0 && (
              <>
                <Separator />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">
                    Interview Process
                  </h2>
                  <div className="space-y-2">
                    {job.interviews.map((interview, index) => (
                      <div
                        key={interview.interviewId}
                        className="flex items-center gap-2"
                      >
                        <Badge variant="outline" className="bg-primary/5">
                          Stage {index + 1}
                        </Badge>
                        <span className="text-muted-foreground">
                          {interview.title}
                        </span>
                        <Badge
                          variant={
                            interview.type === "CODE" ? "secondary" : "default"
                          }
                        >
                          {interview.type === "CODE" ? "Coding" : "Non-Coding"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="border-t border-border p-6 bg-muted/20">
            <div className="w-full space-y-4">
              {hasApplied && (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-600">
                    You have already applied for this job. Track your
                    application status at{" "}
                    <Link
                      href="/applicant/dashboard/applied-jobs"
                      className="font-medium underline underline-offset-2"
                    >
                      Applied Jobs
                    </Link>
                    .
                  </AlertDescription>
                </Alert>
              )}

              <div className="w-full flex flex-col sm:flex-row items-center gap-4">
                {hasApplied ? (
                  <Button
                    className="w-full sm:w-auto opacity-60 cursor-not-allowed"
                    disabled={true}
                  >
                    Already Applied
                  </Button>
                ) : (
                  <Button className="w-full sm:w-auto" asChild>
                    <Link href={`/applicant/dashboard/jobs/${job.id}/apply`}>
                      Apply Now
                    </Link>
                  </Button>
                )}

                <Button variant="outline" className="w-full sm:w-auto" asChild>
                  <Link href="/applicant/dashboard/jobs">Back to Jobs</Link>
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
