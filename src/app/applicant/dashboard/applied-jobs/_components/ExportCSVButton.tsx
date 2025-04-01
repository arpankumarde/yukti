"use client";

import { Button } from "@/components/ui/button";
import CsvDownloader from "react-csv-downloader";
import { FaFileCsv } from "react-icons/fa6";

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

const ExportCSVButton = ({
  applications,
}: {
  applications: ApplicationWithJob[];
}) => {
  const data = [
    [
      "Job Title",
      "Application ID",
      "Status",
      "Score",
      "Comments",
      "Applied On",
    ],
  ];

  applications.forEach((application) => {
    data.push([
      application.job.title,
      application.applicationId,
      application.status || "PENDING",
      application.score?.toString() || "N/A",
      application.comments || "No comments",
      new Date(application.createdAt).toLocaleDateString("en-US"),
    ]);
  });

  return (
    <>
      {applications && applications.length > 0 && (
        <CsvDownloader datas={data} filename="my_applications">
          <Button variant={"outline"}>
            <FaFileCsv size={24} className="text-green-800 mr-2" />
            Export CSV
          </Button>
        </CsvDownloader>
      )}
    </>
  );
};

export default ExportCSVButton;
