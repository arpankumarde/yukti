import React from "react";
import prisma from "@/lib/prisma";
import NextLink from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  FileText,
  User,
  Briefcase,
  Calendar,
  CheckCircle2,
  Star,
  ThumbsUp,
  ThumbsDown,
  Tag,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { ApplicationDetailsClient } from "./_components/ApplicationDetailsClient";
import Markdown from "react-markdown";

const ApplicationDetailsPage = async ({
  params,
}: {
  params: Promise<{ jid: string; aid: string }>;
}) => {
  const { jid, aid } = await params;

  // Fetch application details from the database
  const application = await prisma.application.findUnique({
    where: { applicationId: aid },
    include: {
      applicant: true,
      job: true,
    },
  });

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold text-gray-800">
          Application not found
        </h1>
        <p className="text-gray-600 mt-2">
          The application you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild className="mt-6">
          <NextLink href={`/recruiter/dashboard/applications/${jid}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </NextLink>
        </Button>
      </div>
    );
  }

  const renderScoreBox = (score: number | null) => {
    // ... existing score box rendering code ...
  };

  const getStatusColor = (status: string | null) => {
    // ... existing status color code ...
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/recruiter/dashboard/applications/${jid}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-primary">
            Application Details
          </h1>
        </div>
        <Badge className={cn("px-3 py-1", getStatusColor(application.status))}>
          {application.status || "Not Specified"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Applicant Info Card - No changes */}
        <Card className="col-span-1 shadow-md">
          <CardHeader className="border-b bg-muted/10 p-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold tracking-tight">
                Applicant Info
              </h2>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{application.applicant.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{application.applicant.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{application.applicant.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Applied on</p>
              <p className="font-medium">
                {new Date(application.createdAt).toLocaleString()}
              </p>
            </div>
            {application.resume && (
              <div className="pt-4">
                <NextLink target="_blank" href={application.resume}>
                  <Button className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    View Resume
                  </Button>
                </NextLink>
              </div>
            )}
            {application.cover_letter && (
              <div className="pt-2">
                <NextLink target="_blank" href={application.cover_letter}>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    View Cover Letter
                  </Button>
                </NextLink>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Details Card - Enhanced with more details */}
        <Card className="col-span-1 md:col-span-2 shadow-md">
          <CardHeader className="border-b bg-muted/10 p-6">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold tracking-tight">
                Job Details
              </h2>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column - Basic job details */}
                <div className="space-y-4">
                  <div className="border rounded-lg p-3">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Position
                    </h3>
                    <p className="font-semibold text-foreground">
                      {application.job.title}
                    </p>
                  </div>

                  <div className="border rounded-lg p-3">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Experience Required
                    </h3>
                    <p className="font-semibold text-foreground">
                      {application.job.experience}
                    </p>
                  </div>

                  <div className="border rounded-lg p-3">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Location
                    </h3>
                    <p className="font-semibold text-foreground">
                      {application.job.location}
                    </p>
                  </div>
                </div>

                {/* Right column - Additional details */}
                <div className="space-y-4">
                  {application.job.salary && (
                    <div className="border rounded-lg p-3">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Salary Range
                      </h3>
                      <p className="font-semibold text-foreground">
                        {application.job.salary}
                      </p>
                    </div>
                  )}
                  {application.job.perks && (
                    <div className="border rounded-lg p-3">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Perks & Benefits
                      </h3>
                      <p className="text-foreground">{application.job.perks}</p>
                    </div>
                  )}

                  <div className="border rounded-lg p-3">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Posted On
                    </h3>
                    <p className="text-foreground">
                      {new Date(application.job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button asChild variant="outline">
                  <NextLink
                    href={`/recruiter/dashboard/postings/${application.job.id}`}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Complete Job Posting
                  </NextLink>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evaluation Card */}
        <Card className="col-span-1 md:col-span-3 shadow-md">
          <CardHeader className="border-b bg-muted/10 p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold tracking-tight">
                Evaluation
              </h2>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Match Score</p>
                  {renderScoreBox(application.score)}
                </div>

                {application.keywords && application.keywords.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2 flex items-center">
                      <Tag className="h-4 w-4 mr-1" /> Keywords
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {application.keywords.map((keyword, index) => (
                        <Badge
                          key={index}
                          className="bg-primary/10 text-primary hover:bg-primary/20"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {application.strength && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2 flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-1" /> Strengths
                    </p>
                    <div className="p-4 bg-green-50 rounded-lg prose prose-sm max-w-none">
                      <Markdown>{application.strength}</Markdown>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {application.weakness && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2 flex items-center">
                      <ThumbsDown className="h-4 w-4 mr-1" /> Weaknesses
                    </p>
                    <div className="p-4 bg-red-50 rounded-lg prose prose-sm max-w-none">
                      <Markdown>{application.weakness}</Markdown>
                    </div>
                  </div>
                )}

                {/* Comments section with edit functionality */}
                <ApplicationDetailsClient application={application} jid={jid} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApplicationDetailsPage;