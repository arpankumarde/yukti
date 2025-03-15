import React from "react";
import { PrismaClient } from "@prisma/client";
import NextLink from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const prisma = new PrismaClient();

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
    return <div>Application not found</div>;
  }

  const renderScoreBox = (score: number) => {
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
      <div className="flex items-center gap-2 max-w-[200px]">
        <div className="relative w-full h-6 bg-gray-100 rounded-md overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full ${bgColor} transition-all duration-300`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div
          className={`w-[5px] h-[5px] ${bgColor} rounded-sm flex-shrink-0`}
        />
        <span className={`text-sm font-medium ${textColor} flex-shrink-0`}>
          {score}%
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-xl md:text-2xl font-semibold text-primary break-words">
        Application Details for Job ID: {jid}
      </h1>

      <div className="grid gap-6">
        <div className="overflow-x-auto rounded-lg shadow-lg bg-background">
          <div className="min-w-full divide-y divide-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Field
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Application ID
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {application.applicationId}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Applicant Name
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {application.applicant.name}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Applicant Email
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {application.applicant.email}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Job Title
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {application.job.title}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Status
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {application.status}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Comments
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {application.comments}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Resume
                  </td>
                  <td>
                    <NextLink target="_blank" href={`${application.resume}`}>
                      <Button
                        className={cn(
                          "inline-block py-3 px-6 rounded-lg transition-colors duration-200",
                          "bg-primary text-primary-foreground font-medium",
                          "hover:bg-primary/90"
                        )}
                      >
                        View
                      </Button>
                    </NextLink>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Created At
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {application.createdAt.toISOString()}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Updated At
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {application.updatedAt.toISOString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-primary">
        Additional Details
      </h2>
      <div className="overflow-x-auto rounded-lg shadow-lg bg-background">
        <div className="min-w-full divide-y divide-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-500">Score</td>
                <td className="px-4 py-3">
                  {renderScoreBox(application.score)}
                  {/* {renderScoreBox(35)} */}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-500">Strengths</td>
                <td className="px-4 py-3 text-sm text-gray-500 break-words">
                  {application.strength}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-500">Weakness</td>
                <td className="px-4 py-3 text-sm text-gray-500 break-words">
                  {application.weakness}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsPage;
