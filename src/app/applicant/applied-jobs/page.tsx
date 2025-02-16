// Language: tsx
import { PrismaClient } from "@prisma/client";
import React from "react";

const prisma = new PrismaClient();

export default async function AppliedJobsPage() {
  // Replace with your actual authentication/session logic.
  const applicantId = "cm77crure0001rbuv6rfxj6ui";

  const applications = await prisma.application.findMany({
    where: { applicantId },
    include: { job: true }, 
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Applied Jobs</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Application ID</th>
            <th className="border p-2">Job Title</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Comments</th>
            <th className="border p-2">Resume</th>
            <th className="border p-2">Score</th>
            <th className="border p-2">Applied On</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.applicationId}>
              <td className="border p-2">{app.applicationId}</td>
              <td className="border p-2">{app.job.title || "N/A"}</td>
              <td className="border p-2">{app.status || "N/A"}</td>
              <td className="border p-2">{app.comments || "N/A"}</td>
              <td className="border p-2">{app.resume || "N/A"}</td>
              <td className="border p-2">{app.score ?? "N/A"}</td>
              <td className="border p-2">
                {new Date(app.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}