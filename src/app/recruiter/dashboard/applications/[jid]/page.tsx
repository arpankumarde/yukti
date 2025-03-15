import prisma from "@/lib/prisma";
import { Application } from "@prisma/client";
import { Button } from "@/components/ui/button";
import NextLink from "next/link";
import { cn } from "@/lib/utils";

const ApplicationForJob = async ({
  params,
}: {
  params: Promise<{ jid: string }>;
}) => {
  const { jid } = await params;
  const applications = await prisma.application.findMany({
    where: {
      jobId: { equals: jid },
    },
    include: {
      applicant: true,
      job: true,
    },
  });

  if (applications.length === 0) {
    return <div>No applications found for this job</div>;
  }

  return (
    <div className="space-y-6 p-10">
      <h1 className="text-3xl font-bold text-primary">
        Applications for Job ID: {jid}
      </h1>
      <div className="bg-secondary/20 p-6 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resume
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((application, index) => (
                <tr key={application.applicationId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.applicant.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.job.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.status || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.score || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(application.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.applicationId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <NextLink target="_blank" href={`${application.resume}`}>
                      <Button
                        className={cn(
                          "inline-block py-2 px-4 rounded-lg transition-colors duration-200",
                          "bg-primary text-primary-foreground font-medium",
                          "hover:bg-primary/90"
                        )}
                      >
                        View
                      </Button>
                    </NextLink>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <NextLink
                      href={`/recruiter/dashboard/applications/${jid}/${application.applicationId}`}
                    >
                      <Button
                        className={cn(
                          "inline-block py-2 px-4 rounded-lg transition-colors duration-200",
                          "bg-primary text-primary-foreground font-medium",
                          "hover:bg-primary/90"
                        )}
                      >
                        Details
                      </Button>
                    </NextLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForJob;
