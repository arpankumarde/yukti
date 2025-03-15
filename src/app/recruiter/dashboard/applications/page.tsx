import prisma from "@/lib/prisma";
import { Application } from "@prisma/client";
import { Button } from "@/components/ui/button";
import NextLink from "next/link";
import { cn } from "@/lib/utils";

export const dynamicParams = true;
export const revalidate = 0;

const Page = async () => {
  const applications = await prisma.application.findMany({
    include: {
      applicant: true,
      job: true,
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-primary">Applications</h1>
      <div className="min-h-screen bg-secondary/20 flex items-start justify-center p-4">
        <div className="w-full">
          <div className="bg-background rounded-lg shadow-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Index
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
                  <th className="px-16 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated At
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resume
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((application, index) => (
                  <tr key={application.applicationId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {application.applicant.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {application.job.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {application.status}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 break-words">
                      {application.comments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {application.score}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(application.createdAt).toLocaleString()}
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(application.updatedAt).toLocaleString()}
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {application.applicationId}
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
                    <td>
                      <NextLink
                        href={`/recruiter/dashboard/applications/${application.applicationId}`}
                      >
                        <Button
                          className={cn(
                            "inline-block py-3 px-6 rounded-lg transition-colors duration-200",
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
    </div>
  );
};

export default Page;
