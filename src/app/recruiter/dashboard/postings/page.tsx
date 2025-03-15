import prisma from "@/lib/prisma";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import { Job } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import NextLink from "next/link";
import { cn } from "@/lib/utils";

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
        <NextLink href="/recruiter/dashboard/postings/new">
          <Button
            type="button"
            className={cn(
              "inline-block py-3 px-6 rounded-lg transition-colors duration-200",
              "bg-primary text-primary-foreground font-medium",
              "hover:bg-primary/90"
            )}
          >
            <div className=" flex items-center justify-center gap-2">
              <Plus />
              Add Job Posting
            </div>
          </Button>
        </NextLink>
      </div>
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
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated At
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job, index) => (
                  <tr key={job.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
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
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(job.updatedAt).toLocaleString()}
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {/* <NextLink
                        href={`/recruiter/dashboard/postings/${job.id}`}
                      > */}
                      {job.id}
                      {/* </NextLink> */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button
                        type="button"
                        className={cn(
                          "inline-block py-3 px-6 rounded-lg transition-colors duration-200",
                          "bg-red-500 text-primary-foreground font-medium",
                          "hover:bg-primary/90"
                        )}
                      >
                        <div className=" flex items-center justify-center gap-2">
                          Delete
                        </div>
                      </Button>
                    </td>
                    <td>
                      <NextLink
                        href={`/recruiter/dashboard/postings/${job.id}`}
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
