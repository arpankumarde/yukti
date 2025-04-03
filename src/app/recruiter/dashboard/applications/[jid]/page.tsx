import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import CopyToClipboard from "@/components/block/CopyToClipboard";
import { MdOutlineContentCopy } from "react-icons/md";
import Link from "next/link";

export const dynamicParams = true;
export const revalidate = 0;

const Page = async ({ params }: { params: Promise<{ jid: string }> }) => {
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
      <div className="bg-secondary/20 pb-4 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Applicant Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  Applied At
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                  AID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
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
                    <CopyToClipboard text={application.applicationId}>
                      <Button variant="outline">
                        <MdOutlineContentCopy />
                      </Button>
                    </CopyToClipboard>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Button asChild>
                      <Link
                        href={`/recruiter/dashboard/applications/${jid}/${application.applicationId}`}
                      >
                        Details
                      </Link>
                    </Button>
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

export default Page;
