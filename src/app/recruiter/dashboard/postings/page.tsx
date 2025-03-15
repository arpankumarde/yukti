import prisma from "@/lib/prisma";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import { Job } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { deleteJob } from "@/actions/recruiter";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { MdDeleteForever } from "react-icons/md";
import { TiEye } from "react-icons/ti";

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
    <div className="space-y-6 p-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Job Postings</h1>
        <Button>
          <Link href="/recruiter/dashboard/postings/new">
            <div className="flex items-center justify-center gap-2">
              <Plus className="h-5 w-5" />
              Add Job Posting
            </div>
          </Link>
        </Button>
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
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posted At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job, index) => (
                <tr key={job.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Button asChild variant="outline" className="gap-2">
                      <Link
                        href={`/recruiter/dashboard/applications/${job.id}`}
                      >
                        {job._count.applications}
                        <TiEye className="h-5 w-5" />
                      </Link>
                    </Button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.experience}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(job.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex gap-2">
                    <Button asChild>
                      <Link href={`/recruiter/dashboard/postings/${job.id}`}>
                        Details
                      </Link>
                    </Button>
                    <form
                      action={async () => {
                        "use server";
                        const result = await deleteJob(job.id);
                        if (result.success) {
                          revalidatePath("/recruiter/dashboard/postings");
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
