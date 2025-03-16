import prisma from "@/lib/prisma";
import Link from "next/link";

const Page = async ({
  params,
}: {
  params: Promise<{ interviewId: string }>;
}) => {
  const { interviewId } = await params;

  const interview = await prisma.interview.findUnique({
    where: {
      interviewId,
    },
    include: {
      InterviewSession: {
        include: {
          application: {
            include: {
              applicant: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          questions: true,
        },
      },
    },
  });

  return (
    <div>
      <h1>View Interview Sessions</h1>
      <h2>{interview?.title}</h2>
      <p>
        {interview?.conductWithAI ? "Conducted by AI" : "Not conducted by AI"}
      </p>
      {interview && interview.InterviewSession.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Applicant Name</th>
              <th>Attempted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {interview.InterviewSession.map((session) => (
              <tr key={session.interviewSessionId}>
                <td>{session.application.applicant.name}</td>
                <td>{session.attempted ? "Yes" : "No"}</td>
                <td>
                  {session.attempted && (
                    <Link
                      href={`/recruiter/dashboard/interviews/reports/${interviewId}/${session.interviewSessionId}`}
                    >
                      View Report
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No interview sessions available.</p>
      )}
    </div>
  );
};

export default Page;
