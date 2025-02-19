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
    if (score <= 20) {
      bgColor = "bg-red-500";
    } else if (score <= 60) {
      bgColor = "bg-yellow-500";
    } else {
      bgColor = "bg-green-500";
    }

    return (
      <div className="relative w-full h-8 bg-gray-200">
        <div
          className={`absolute top-0 left-0 h-full ${bgColor}`}
          style={{ width: `${score}%` }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center text-sm text-white font-bold">
          {score}%
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-primary">
        Application Details for Job ID: {jid} and Application ID: {aid}
      </h1>
      <div className="bg-secondary/20 flex items-start justify-center p-4">
        <div className="w-full">
          <div className="bg-background rounded-lg shadow-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
      <div className="min-h-screen bg-secondary/20 flex items-start justify-center p-4">
        <div className="w-full">
          <div className="bg-background rounded-lg shadow-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    Score
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {renderScoreBox(application.score)}
                    {/* {renderScoreBox(20)} */}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Strengths
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {application.strength}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Weakness
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {application.weakness}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsPage;
