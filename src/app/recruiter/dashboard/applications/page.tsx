import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import Link from "next/link";
import { TiEye } from "react-icons/ti";
import { MdDeleteForever } from "react-icons/md";
import { revalidatePath } from "next/cache";

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
  });

  return (
    <div className="space-y-6 p-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Applications</h1>
      </div>
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
                  Applied At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application ID
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
                    {application.status || "Pending"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(application.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.applicationId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex gap-2">
                    <Button asChild>
                      <Link
                        href={`/recruiter/dashboard/applications/${application.jobId}/${application.applicationId}`}
                      >
                        Details
                      </Link>
                    </Button>
                    <form
                      action={async () => {
                        "use server";
                        const result = await prisma.application.delete({
                          where: { applicationId: application.applicationId },
                        });
                        if (result) {
                          revalidatePath(`/recruiter/dashboard/applications`);
                        }
                      }}
                    >
                      <Button type="submit" variant="destructive">
                        <MdDeleteForever className="h-5 w-5" />
                      </Button>
                    </form>
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
