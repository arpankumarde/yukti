import prisma from "@/lib/prisma";
import Questions from "./_components/Questions";

const Page = async ({
  params,
}: {
  params: Promise<{ interviewId: string }>;
}) => {
  const { interviewId } = await params;

  const interview = await prisma.interview.findUnique({
    where: { interviewId },
    include: {
      questions: true,
    },
  });

  if (!interview) {
    return <div>Error: Interview not found for interviewId {interviewId}</div>;
  }

  return (
    <div>
      <h1>Add Questions - {interview?.title}</h1>
      <p>Interview ID: {interviewId}</p>

      <div>
        <h3>Questions:</h3>
        <Questions
          questionProps={interview?.questions}
          interviewId={interviewId}
        />
      </div>
    </div>
  );
};

export default Page;
