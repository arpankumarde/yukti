import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";
import Link from "next/link";
import NextLink from "next/link";

const JobDetailsPage = async ({
  params,
}: {
  params: Promise<{ jid: string }>;
}) => {
  const { jid } = await params;
  const job = await prisma.job.findUnique({
    where: { id: jid },
    include: {
      recruiter: true,
      interviews: true,
      _count: {
        select: { applications: true, interviews: true },
      },
    },
  });

  if (!job) {
    return <div>Job not found</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-primary">Job Details</h1>
      <div className="min-h-screen bg-secondary/20 flex items-start justify-center p-4">
        <div className="w-full">
          <div className="bg-background rounded-lg shadow-lg">
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
                  <td>
                    <NextLink
                      href={`/recruiter/dashboard/postings/${job.id}/edit`}
                    >
                      <Button
                        className={cn(
                          "inline-block py-3 px-6 rounded-lg transition-colors duration-200",
                          "bg-primary text-primary-foreground font-medium",
                          "hover:bg-primary/90"
                        )}
                      >
                        Edit
                      </Button>
                    </NextLink>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Description
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.description}
                  </td>
                  <td>
                    <NextLink
                      href={`/recruiter/dashboard/postings/${job.id}/edit`}
                    >
                      <Button
                        className={cn(
                          "inline-block py-3 px-6 rounded-lg transition-colors duration-200",
                          "bg-primary text-primary-foreground font-medium",
                          "hover:bg-primary/90"
                        )}
                      >
                        Edit
                      </Button>
                    </NextLink>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Experience
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.experience}
                  </td>
                  <td>
                    <NextLink
                      href={`/recruiter/dashboard/postings/${job.id}/edit`}
                    >
                      <Button
                        className={cn(
                          "inline-block py-3 px-6 rounded-lg transition-colors duration-200",
                          "bg-primary text-primary-foreground font-medium",
                          "hover:bg-primary/90"
                        )}
                      >
                        Edit
                      </Button>
                    </NextLink>
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
                  </td>
                  <td>
                    {job._count.applications > 0 && (
                      <NextLink
                        href={`/recruiter/dashboard/applications/${job.id}`}
                      >
                        <Button
                          className={cn(
                            "inline-block py-3 px-5 rounded-lg transition-colors duration-200",
                            "bg-primary text-primary-foreground font-medium",
                            "hover:bg-primary/90"
                          )}
                        >
                          View
                        </Button>
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

          <div>
            <h2 className="text-xl font-semibold mt-4">Interviews</h2>
            <div className="mt-2">
              <p>No scheduled interviews at this time.</p>
              {/* Placeholder for interview scheduling functionality */}

              <Button asChild>
                <Link href={`/recruiter/dashboard/interviews/${job.id}/new`}>
                  Schedule Interviews
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
