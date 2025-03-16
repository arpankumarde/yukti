import { Briefcase, Building2, CalendarDays } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";

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

  const job = await prisma.job.findUnique({
    where: {
      id: jid,
    },
    include: {
      recruiter: true,
    },
  });

  if (!job) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-secondary/20 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-background rounded-xl border border-border p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-primary" />
              {job.title}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{job.recruiter?.name || "Company not specified"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                <span>{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6 mb-8">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Experience Required
              </h2>
              <p className="text-muted-foreground">
                {job.experience || "Not specified"}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Job Description
              </h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {job.description}
              </p>
            </div>
          </div>

          {/* Apply Button */}
          <Button asChild>
            <Link href={`/applicant/dashboard/jobs/${job.id}/apply`}>
              Apply Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
