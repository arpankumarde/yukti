import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Edit, Calendar } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { TiEye } from "react-icons/ti";

const JobDetailsPage = async ({
  params,
}: {
  params: Promise<{ jid: string }>;
}) => {
  const { jid } = await params;
  const job = await prisma.job.findUnique({
    where: { id: jid },
    include: {
      recruiter: true,
      interviews: true,
      _count: {
        select: { applications: true, interviews: true },
      },
    },
  });

  if (!job) {
    return <div>Job not found</div>;
  }

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
    { label: "Total Interviews", value: job._count.interviews },
    { label: "Recruiter", value: job.recruiter.name },
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
    <div className="space-y-6 p-6 md:p-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/recruiter/dashboard/postings">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold text-primary">Job Details</h1>
        </div>
        <Button asChild>
          <Link href={`/recruiter/dashboard/postings/${job.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Job
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="bg-background shadow-lg">
          <CardHeader className="border-b bg-muted/10 p-6">
            <h2 className="text-xl font-semibold tracking-tight">
              Basic Information
            </h2>
          </CardHeader>
          <div className="p-6">
            <div className="rounded-lg border divide-y">
              {jobDetails.map(
                ({ label, value, hasViewButton, className }, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 px-6 py-4 items-center text-sm"
                  >
                    <div className="font-medium text-gray-500">{label}</div>
                    <div className={cn("col-span-2", className)}>
                      <span>{value}</span>
                      {hasViewButton && value > 0 && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="ml-4"
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
          </div>
        </Card>

        <Card className="bg-background shadow-lg">
          <CardHeader className="border-b bg-muted/10 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">
                Interviews
              </h2>
              {job.interviews.length > 0 && (
                <Button asChild>
                  <Link href={`/recruiter/dashboard/interviews/${job.id}/new`}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Interview
                  </Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <div className="p-6">
            {job.interviews.length > 0 ? (
              <div className="rounded-lg border divide-y">
                {job.interviews.map((interview) => (
                  <div key={interview.interviewId} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{interview.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {interview.type} •{" "}
                          {interview.conductWithAI
                            ? "AI Interview"
                            : "Manual Interview"}
                        </p>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link
                          href={`/recruiter/dashboard/interviews/${job.id}/${interview.interviewId}`}
                          className="flex items-center gap-2"
                        >
                          <TiEye className="h-4 w-4" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-sm font-semibold">
                  No Interviews Scheduled
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get started by scheduling your first interview.
                </p>
                <Button className="mt-4" asChild>
                  <Link href={`/recruiter/dashboard/interviews/${job.id}/new`}>
                    Schedule Interview
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default JobDetailsPage;
