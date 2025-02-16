import { PrismaClient } from "@prisma/client";
import React from "react";

const prisma = new PrismaClient();

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    include: { recruiter: true },
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Available Jobs</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 text-center">Title</th>
            <th className="border p-2 text-center">Description</th>
            <th className="border p-2 text-center">Recruiter</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td className="border p-2 text-center">{job.title}</td>
              <td className="border p-2 text-center">{job.description || "N/A"}</td>
              <td className="border p-2 text-center">
                {job.recruiter ? job.recruiter.name : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}