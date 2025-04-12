import prisma from "@/lib/prisma";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import { Recruiter } from "@prisma/client";
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
  const user = userCookie ? (JSON.parse(userCookie) as Recruiter) : undefined;

  const jobs = await prisma.job.findMany({
    where: {
      companyId: user?.companyId,
    },
    include: {
      _count: {
        select: { Application: true }, // Changed from "applications" to "Application"
      },
      company: {
        select: { name: true },
      },
    },
    orderBy: {
      createdAt: "desc",
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

          <Button asChild>
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
                {/* <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Company
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Vacancy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Skills
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Apply By
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
                <tr key={job.id} className="hover:bg-gray-50">
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
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.company?.name}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.salary || "Not specified"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.jobType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.vacancy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        job.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : job.status === "CLOSED"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.experience}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-wrap gap-1">
                      {job.skills.map((skill, i) => (
                      // {job.skills.slice(0, 3).map((skill, i) => (
                        <span
                          key={i}
                          className="bg-gray-100 px-2 py-1 text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {/* {job.skills.length > 3 && (
                        <span className="bg-gray-100 px-2 py-1 text-xs rounded">
                          +{job.skills.length - 3} more
                        </span>
                      )} */}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.applyBy
                      ? new Date(job.applyBy).toLocaleDateString("en-US")
                      : "No deadline"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Button asChild variant="outline" className="w-full">
                      <Link
                        href={`/recruiter/dashboard/applications/${job.id}`}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        {job._count.Application}
                      </Link>
                    </Button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(job.createdAt).toLocaleDateString("en-US", {
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    <Button asChild>
                      <Link href={`/recruiter/dashboard/postings/${job.id}`}>
                        <TbListDetails className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link
                        href={`/recruiter/dashboard/postings/${job.id}/edit`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive">
                          <MdDeleteForever className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the job posting and all associated
                            applications.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
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

              {jobs.length === 0 && (
                <tr>
                  <td
                    colSpan={15}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <svg
                        className="h-12 w-12 text-gray-400 mb-3"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="font-medium mb-1">No job postings found</p>
                      <p className="text-gray-400">
                        Create your first job posting to get started
                      </p>
                      <Button asChild className="mt-4">
                        <Link href="/recruiter/dashboard/postings/new">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Job Posting
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Page;
