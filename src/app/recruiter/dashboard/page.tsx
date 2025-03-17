// import prisma from "@/lib/prisma";
import { InterviewTypeChart } from "./_components/InterviewTypeChart";
import { JobApplicationsLongChart } from "./_components/JobApplicationsLongChart";
import { JobPostByMonth } from "./_components/JobPostByMonth";
import { JobVsPostings } from "./_components/JobVsPostings";

const Page = async () => {
  // const interviews = await prisma.interview.findMany({
  //   select: {
  //     conductOffline: true,
  //     conductWithAI: true,
  //   },
  // });

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-4xl font-semibold text-primary">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <InterviewTypeChart />
        </div>
        <div>
          <JobVsPostings />
        </div>
        <div>
          <JobPostByMonth />
        </div>
      </div>

      <div>
        <JobApplicationsLongChart />
      </div>
    </div>
  );
};

export default Page;
