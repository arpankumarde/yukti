"use client";

import { Button } from "@/components/ui/button";
import { Applicant, Application, Job } from "@prisma/client";
import { RiFileExcel2Fill } from "react-icons/ri";
import xlsx from "xlsx";

type extendedApplication = Application & { job: Job } & {
  applicant: Applicant;
};

const ExportXLSXButton = ({
  applications,
}: {
  applications: extendedApplication[];
}) => {
  const data = [
    [
      "Applicant ID",
      "Applicant Name",
      "Applicant Email",
      "Job ID",
      "Job Title",
      "Status",
      "Resume",
      "Cover Letter",
      "Created At",
      "Updated At",
    ],
  ];

  applications.forEach((application) => {
    data.push([
      application.applicantId,
      application.applicant.name,
      application.applicant.email,
      application.jobId,
      application.job.title,
      application.status ?? "",
      application.resume ?? "",
      application.cover_letter ?? "",
      new Date(application.createdAt).toLocaleDateString("en-US"),
      new Date(application.updatedAt).toLocaleDateString("en-US"),
    ]);
  });

  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Job Applications");

  const handleExport = () => {
    xlsx.writeFile(workbook, "job_applications.xlsx");
  };

  return (
    <>
      {applications && applications.length > 0 && (
        <Button variant={"outline"} onClick={handleExport}>
          <RiFileExcel2Fill size={24} className="text-green-800" />
          Export XLSX
        </Button>
      )}
    </>
  );
};

export default ExportXLSXButton;
