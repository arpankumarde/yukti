import prisma from "@/lib/prisma";
import { Application } from "@prisma/client";
import { Button } from "@/components/ui/button";
import NextLink from "next/link";

const ApplicationDetailsPage = async ({
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
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-primary">
        Applications for Job ID: {jid}
      </h1>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
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
              Comments
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Resume
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created At
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Updated At
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {applications.map((application) => (
            <tr key={application.applicationId}>
              
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <NextLink
                  href={`/recruiter/dashboard/applications/${application.applicationId}`}
                >
                  {application.applicationId}
                </NextLink>
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {application.applicationId}
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {application.comments}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {application.resume}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {application.score}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(application.createdAt).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(application.updatedAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicationDetailsPage;
