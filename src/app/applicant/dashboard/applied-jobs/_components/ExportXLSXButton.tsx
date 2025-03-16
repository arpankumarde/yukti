"use client";

import { Button } from "@/components/ui/button";
import { RiFileExcel2Fill } from "react-icons/ri";
import xlsx from "xlsx";

type ApplicationWithJob = {
  applicationId: string;
  score?: number | null;
  resume?: string | null;
  cover_letter?: string | null;
  comments?: string | null;
  createdAt: Date;
  status?: string | null;
  job: {
    title: string;
    id: string;
  };
};

const ExportXLSXButton = ({
  applications,
}: {
  applications: ApplicationWithJob[];
}) => {
  const data: any[] = [];

  data.push([
    "Job Title",
    "Application ID",
    "Status",
    "Score",
    "Comments",
    "Applied On",
  ]);

  applications.forEach((application) => {
    data.push([
      application.job.title,
      application.applicationId,
      application.status || "PENDING",
      application.score || "N/A",
      application.comments || "No comments",
      new Date(application.createdAt).toLocaleDateString("en-US"),
    ]);
  });

  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "My Applications");

  const handleExport = () => {
    xlsx.writeFile(workbook, "my_applications.xlsx");
  };

  return (
    <>
      {applications && applications.length > 0 && (
        <Button variant={"outline"} onClick={handleExport}>
          <RiFileExcel2Fill size={24} className="text-green-800 mr-2" />
          Export XLSX
        </Button>
      )}
    </>
  );
};

export default ExportXLSXButton;