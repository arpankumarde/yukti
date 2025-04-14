"use client";

import { Button } from "@/components/ui/button";
import { Job } from "@/generated/prisma";
import { RiFileExcel2Fill } from "react-icons/ri";
import xlsx from "xlsx";

const ExportXLSXButton = ({ jobs }: { jobs: Job[] }) => {
  const data = [
    [
      "id",
      "title",
      "description",
      "location",
      "perks",
      "salary",
      "experience",
      "createdAt",
      "updatedAt",
    ],
  ];

  jobs.forEach((job) => {
    data.push([
      job.id.toString(),
      job.title,
      job.description ?? "",
      job.location,
      job.perks ?? "",
      job.salary ?? "",
      job.experience ?? "",
      new Date(job.createdAt).toLocaleDateString("en-US"),
      new Date(job.updatedAt).toLocaleDateString("en-US"),
    ]);
  });

  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Job Postings");

  const handleExport = () => {
    xlsx.writeFile(workbook, "job_postings.xlsx");
  };

  return (
    <>
      {jobs && jobs.length > 0 && (
        <Button variant={"outline"} onClick={handleExport}>
          <RiFileExcel2Fill size={24} className="text-green-800" />
          Export XLSX
        </Button>
      )}
    </>
  );
};

export default ExportXLSXButton;
