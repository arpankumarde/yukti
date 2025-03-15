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
} from "lucide-react";
import Link from "next/link";

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
    if (score === null) {
      return (
        <div className="flex items-center gap-2">
          <div className="relative w-full h-6 bg-gray-100 rounded-md overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gray-200"
              style={{ width: "0%" }}
            />
          </div>
          <span className="text-sm font-medium text-gray-500">Not scored</span>
        </div>
      );
    }

    let bgColor = "bg-gray-200";
    let textColor = "text-gray-500";

    if (score <= 20) {
      bgColor = "bg-red-500";
      textColor = "text-red-500";
    } else if (score <= 40) {
      bgColor = "bg-orange-500";
      textColor = "text-orange-500";
    } else if (score <= 60) {
      bgColor = "bg-yellow-500";
      textColor = "text-yellow-600";
    } else if (score <= 80) {
      bgColor = "bg-lime-500";
      textColor = "text-lime-600";
    } else {
      bgColor = "bg-green-500";
      textColor = "text-green-600";
    }

    return (
      <div className="flex items-center gap-2">
        <div className="relative w-full h-6 bg-gray-100 rounded-md overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full ${bgColor} transition-all duration-300`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className={`text-sm font-medium ${textColor}`}>{score}%</span>
      </div>
    );
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return "bg-gray-100 text-gray-500";

    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "under review":
        return "bg-blue-100 text-blue-800";
      case "shortlisted":
        return "bg-lime-100 text-lime-800";
      case "selected":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-500";
    }
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

        <Card className="col-span-1 md:col-span-2 shadow-md">
          <CardHeader className="border-b bg-muted/10 p-6">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold tracking-tight">
                Job Details
              </h2>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-500">Position</p>
              <p className="font-medium">{application.job.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Experience Required</p>
              <p className="font-medium">{application.job.experience}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{application.job.location}</p>
            </div>
          </CardContent>
        </Card>

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
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm">{application.strength}</p>
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
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-sm">{application.weakness}</p>
                    </div>
                  </div>
                )}

                {application.comments && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" /> Comments
                    </p>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm">{application.comments}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <Button variant="outline" asChild>
          <NextLink href={`/recruiter/dashboard/applications/${jid}`}>
            Back to Applications
          </NextLink>
        </Button>
        <Button asChild>
          <NextLink
            href={`/recruiter/dashboard/applications/${jid}/${aid}/interviews/new`}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Interview
          </NextLink>
        </Button>
      </div>
    </div>
  );
};

export default ApplicationDetailsPage;
