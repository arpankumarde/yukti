import { InterviewTypeChart } from "./_components/InterviewTypeChart";
import { ApplicationsByMonth } from "./_components/ApplicationsByMonth";
import { ApplicationVsInterview } from "./_components/ApplicationVsInterview";
import { ApplicationsLongChart } from "./_components/ApplicationsLongChart";

const Page = async () => {
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
          <ApplicationVsInterview />
        </div>
        <div>
          <ApplicationsByMonth />
        </div>
      </div>

      <div>
        <ApplicationsLongChart />
      </div>
    </div>
  );
};

export default Page;
