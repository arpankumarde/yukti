import prisma from "@/lib/prisma";

interface TranscriptEntry {
  rating: number;
  feedback: string;
  question: string;
  timestamp: string;
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
}

const Page = async ({
  params,
}: {
  params: Promise<{ interviewId: string; interviewSessionId: string }>;
}) => {
  const { interviewSessionId } = await params;

  const interviewSession = await prisma.interviewSession.findUnique({
    where: {
      interviewSessionId,
    },
    include: {
      interview: true,
      application: {
        include: {
          applicant: true,
        },
      },
    },
  });

  if (!interviewSession) {
    return <div>Error: Interview session not found</div>;
  }

  return (
    <div>
      <h1>View Interview Session</h1>
      <h2>Interview ID: {interviewSession.interviewId}</h2>
      <h3>Session ID: {interviewSession.interviewSessionId}</h3>
      <p>Applicant Name: {interviewSession.application.applicant.name}</p>
      <p>Applicant Email: {interviewSession.application.applicant.email}</p>
      <p>Attempted: {interviewSession.attempted ? "Yes" : "No"}</p>
      <p>Overall Rating: {interviewSession.rating ?? "Not rated yet"}</p>
      <p>
        Overall Feedback: {interviewSession.feedback ?? "No feedback provided"}
      </p>

      <h3>Transcript</h3>
      {interviewSession.transcript && interviewSession.transcript.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Question</th>
              <th>User Answer</th>
              <th>Correct Answer</th>
              <th>Rating</th>
              <th>Feedback</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {interviewSession.transcript.map(
              (entry: TranscriptEntry, index) => (
                <tr key={index}>
                  <td>{entry?.question}</td>
                  <td>{entry.userAnswer}</td>
                  <td>{entry.correctAnswer}</td>
                  <td>{entry.rating}</td>
                  <td>{entry.feedback}</td>
                  <td>{new Date(entry.timestamp).toLocaleString()}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      ) : (
        <p>No transcript available.</p>
      )}
    </div>
  );
};

export default Page;
