"use client";

import { Applicant, Application, InterviewSession } from "@prisma/client";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  createInterviewSessionAction,
  deleteInterviewSessionAction,
} from "./applicantActions";
import { useRouter } from "next/navigation";

type ExtendedSessions = { application: Application } & InterviewSession;
type ExtendedApplication = { applicant: Applicant } & Application;

const Applicants = ({
  applications,
  interviewSessions,
  interviewId,
  jobId,
}: {
  applications: ExtendedApplication[];
  interviewSessions: ExtendedSessions[];
  interviewId: string;
  jobId: string;
}) => {
  const router = useRouter();
  const [sessionApplicationIds, setSessionApplicationIds] = useState(
    interviewSessions.map((session) => session.application.applicationId)
  );
  const [sessionIds, setSessionIds] = useState(
    interviewSessions.reduce((acc, session) => {
      acc[session.application.applicationId] = session.interviewSessionId;
      return acc;
    }, {} as Record<string, string>)
  );

  const handleCheckboxChange = async (
    applicationId: string,
    checked: boolean
  ) => {
    if (checked) {
      const { interviewSession } = await createInterviewSessionAction({
        applicationId,
        interviewId,
      });
      setSessionApplicationIds((prev) => [...prev, applicationId]);
      setSessionIds((prev) => ({
        ...prev,
        [applicationId]: interviewSession
          ? interviewSession.interviewSessionId
          : "",
      }));
    } else {
      const sessionId = sessionIds[applicationId];
      if (sessionId) {
        await deleteInterviewSessionAction(sessionId);
        setSessionApplicationIds((prev) =>
          prev.filter((id) => id !== applicationId)
        );
        setSessionIds((prev) => {
          const newState = { ...prev };
          delete newState[applicationId];
          return newState;
        });
      }
    }
  };

  const handleConfirmInterviews = () => {
    // show error if no applicants selected
    if (sessionApplicationIds.length === 0) {
      alert("Please select at least one applicant");
      return;
    }

    console.log("Confirming interviews", sessionIds);
    router.push(`/recruiter/dashboard/postings/${jobId}`);
  };

  return (
    <div>
      {applications.map((application) => (
        <div key={application.applicationId}>
          <label>
            <input
              type="checkbox"
              checked={sessionApplicationIds.includes(
                application.applicationId
              )}
              onChange={(e) =>
                handleCheckboxChange(
                  application.applicationId,
                  e.target.checked
                )
              }
            />
            {application?.applicant?.name} - {application?.applicant?.email}
          </label>
        </div>
      ))}

      <Button onClick={handleConfirmInterviews}>
        Confirm Interview Selections
      </Button>
    </div>
  );
};

export default Applicants;
