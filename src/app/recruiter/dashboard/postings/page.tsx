import prisma from "@/lib/prisma";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import { Job } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import NextLink from "next/link";

export const dynamicParams = true;
export const revalidate = 0;

const Page = async () => {
  const userCookie = await getCookie("ykrectoken", { cookies });
  const user = userCookie ? (JSON.parse(userCookie) as Job) : undefined;

  const jobs = await prisma.job.findMany({
    where: {
      recruiterId: user?.recruiterId,
    },
    include: {
      _count: {
        select: { applications: true },
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-primary">Jobs</h1>
        <NextLink href="/recruiter/dashboard/postings/new-job-posting">
          <Button type="button" className="w-auto">
            <Plus />
            Add Job Posting
          </Button>
        </NextLink>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Applications
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Experience
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
          {jobs.map((job) => (
            <tr key={job.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <NextLink href={`/recruiter/dashboard/postings/${job.id}`}>
                  {job.id}
                </NextLink>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {job.title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {job._count.applications}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {job.experience}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(job.createdAt).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(job.updatedAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
