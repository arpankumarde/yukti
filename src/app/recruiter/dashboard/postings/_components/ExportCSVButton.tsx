"use client";

import { Button } from "@/components/ui/button";
import { Job } from "@/generated/prisma";
import CsvDownloader from "react-csv-downloader";
import { FaFileCsv } from "react-icons/fa6";

const ExportCSVButton = ({ jobs }: { jobs: Job[] }) => {
  const data = [
    [
      "id",
      "title",
      "location",
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
      job.location,
      job.salary ?? "",
      job.experience ?? "",
      new Date(job.createdAt).toLocaleDateString("en-US"),
      new Date(job.updatedAt).toLocaleDateString("en-US"),
    ]);
  });

  return (
    <>
      {jobs && jobs.length > 0 && (
        <CsvDownloader datas={data} filename="job_postings">
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
