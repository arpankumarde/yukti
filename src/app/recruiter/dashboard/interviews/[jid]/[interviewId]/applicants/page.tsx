import prisma from "@/lib/prisma";
import Applicants from "./_components/Applicants";

const Page = async ({
  params,
}: {
  params: Promise<{ jid: string; interviewId: string }>;
}) => {
  const { jid, interviewId } = await params;

  const applications = await prisma.application.findMany({
    where: { jobId: jid },
    include: {
      applicant: true,
    },
  });

  const interview = await prisma.interview.findUnique({
    where: { interviewId },
  });

  const interviewSessions = await prisma.interviewSession.findMany({
    where: { interviewId },
    include: {
      application: true,
    },
  });

  if (!interview) {
    return <div>Error: Interview not found for interviewId {interviewId}</div>;
  }

  return (
    <div>
      <h1>Choose Applicants - {interview?.title}</h1>
      <p>Interview ID: {interviewId}</p>

      <div>
        <Applicants
          applications={applications}
          interviewSessions={interviewSessions}
          interviewId={interviewId}
          jobId={jid}
        />
      </div>
    </div>
  );
};

export default Page;
