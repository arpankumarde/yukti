import prisma from "@/lib/prisma";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import { Job } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Plus } from "lucide-react";
import { deleteJob } from "@/actions/recruiter";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { MdDeleteForever } from "react-icons/md";
import ExportCSVButton from "./_components/ExportCSVButton";
import ExportXLSXButton from "./_components/ExportXLSXButton";
import CopyToClipboard from "@/components/block/CopyToClipboard";
import { MdOutlineContentCopy } from "react-icons/md";
import { TbListDetails } from "react-icons/tb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
        <h1 className="text-3xl font-bold text-primary">
          Job Postings ({jobs.length})
        </h1>
        <div className="flex gap-4">
          <ExportXLSXButton jobs={jobs} />
          <ExportCSVButton jobs={jobs} />

          <Button>
            <Link href="/recruiter/dashboard/postings/new">
              <div className="flex items-center justify-center gap-2">
                <Plus className="h-5 w-5" />
                Add Job Posting
              </div>
            </Link>
          </Button>
        </div>
      </div>
      <div className="bg-secondary/20 pb-4 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Applications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Posted At
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                  UID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
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
                    <Link
                      href={`/recruiter/dashboard/postings/${job.id}`}
                      className="text-primary font-medium hover:underline underline-offset-4"
                    >
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Link
                      href={`/recruiter/dashboard/postings/${job.id}`}
                      className="text-primary hover:underline underline-offset-4"
                    >
                      {job.experience}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Button asChild variant="outline" className="w-full">
                      <Link
                        href={`/recruiter/dashboard/applications/${job.id}`}
                      >
                        <Eye />
                        {job._count.applications}
                      </Link>
                    </Button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(job.createdAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <CopyToClipboard text={job.id.toString()}>
                      <Button variant="outline">
                        <MdOutlineContentCopy />
                      </Button>
                    </CopyToClipboard>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex gap-2">
                    <Button asChild>
                      <Link href={`/recruiter/dashboard/postings/${job.id}`}>
                        <TbListDetails />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link
                        href={`/recruiter/dashboard/postings/${job.id}/edit`}
                      >
                        <Pencil />
                      </Link>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive">
                          <MdDeleteForever />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the job posting.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>{" "}
                          <form
                            action={async () => {
                              "use server";
                              const result = await deleteJob(job.id);
                              if (result.success) {
                                revalidatePath("/recruiter/dashboard/postings");
                              }
                            }}
                          >
                            <AlertDialogAction type="submit">
                              Delete Permanently
                            </AlertDialogAction>
                          </form>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
