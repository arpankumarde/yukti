import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import Link from "next/link";
import { MdOutlineContentCopy } from "react-icons/md";
import CopyToClipboard from "@/components/block/CopyToClipboard";
import ExportXLSXButton from "./_components/ExportXLSXButton";
import ExportCSVButton from "./_components/ExportCSVButton";

export const dynamicParams = true;
export const revalidate = 0;

const Page = async () => {
  const userCookie = await getCookie("ykrectoken", { cookies });
  const user = userCookie ? JSON.parse(userCookie) : undefined;

  const applications = await prisma.application.findMany({
    include: {
      applicant: true,
      job: true,
    },
    where: {
      job: {
        companyId: user?.companyId,
      },
    },
  });

  return (
    <div className="space-y-6 p-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">
          Applications ({applications.length})
        </h1>
        <div className="flex gap-4">
          <ExportXLSXButton applications={applications} />
          <ExportCSVButton applications={applications} />
        </div>
      </div>
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
                  Applied At
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider">
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
                    {application.status || "Pending"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(application.createdAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <CopyToClipboard text={application.applicantId.toString()}>
                      <Button variant="outline">
                        <MdOutlineContentCopy />
                      </Button>
                    </CopyToClipboard>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex gap-2">
                    <Button asChild>
                      <Link
                        href={`/recruiter/dashboard/applications/${application.jobId}/${application.applicationId}`}
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
