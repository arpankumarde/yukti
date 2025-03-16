"use client";

import { Button } from "@/components/ui/button";
import { Applicant, Application, Job } from "@prisma/client";
import CsvDownloader from "react-csv-downloader";
import { FaFileCsv } from "react-icons/fa6";

type extendedApplication = Application & { job: Job } & {
  applicant: Applicant;
};

const ExportCSVButton = ({
  applications,
}: {
  applications: extendedApplication[];
}) => {
  const data: any[] = [];
  data.push([
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
  ]);

  applications.forEach((application) => {
    data.push([
      application.applicantId,
      application.applicant.name,
      application.applicant.email,
      application.jobId,
      application.job.title,
      application.status,
      application.resume ?? "",
      application.cover_letter ?? "",
      new Date(application.createdAt).toLocaleDateString("en-US"),
      new Date(application.updatedAt).toLocaleDateString("en-US"),
    ]);
  });

  return (
    <>
      {applications && applications.length > 0 && (
        <CsvDownloader datas={data} filename="job_applications">
          <Button variant={"outline"}>
            <FaFileCsv size={24} className="text-green-800" />
            Export CSV
          </Button>
        </CsvDownloader>
      )}
    </>
  );
};

export default ExportCSVButton;
