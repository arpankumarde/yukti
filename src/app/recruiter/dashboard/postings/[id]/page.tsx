import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { Job } from "@prisma/client";
import NextLink from "next/link";

const JobDetailsPage = async ({ params }: { params: { id: string } }) => {
  const job: Job | null = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      recruiter: true,
      _count: {
        select: { applications: true },
      },
    },
  });

  if (!job) {
    return <div>Job not found</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-primary">Job Details</h1>
      <table className="min-w-full divide-y divide-gray-200">
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              ID
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {job.id}
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              Title
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {job.title}
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              Description
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {job.description}
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              Experience
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {job.experience}
            </td>
          </tr>
          {/* <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              Recruiter
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {job.recruiter.name}
            </td>
          </tr> */}
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              Total Applications
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {job._count.applications}
              {job._count.applications > 0 && (
                <NextLink href={`/recruiter/dashboard/applications/${job.id}`}>
                  <Button className="px-4 py-2 rounded ml-10">View</Button>
                </NextLink>
              )}
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              Created At
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {new Date(job.createdAt).toLocaleString()}
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              Updated At
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {new Date(job.updatedAt).toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default JobDetailsPage;
