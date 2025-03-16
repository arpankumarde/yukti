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
import {
  CheckCircle,
  UserCheck,
  Mail,
  ChevronDown,
  ChevronUp,
  Star,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openStrengths, setOpenStrengths] = useState<Record<string, boolean>>(
    {}
  );
  const [openWeaknesses, setOpenWeaknesses] = useState<Record<string, boolean>>(
    {}
  );

  const toggleStrength = (applicationId: string) => {
    setOpenStrengths((prev) => ({
      ...prev,
      [applicationId]: !prev[applicationId],
    }));
  };

  const toggleWeakness = (applicationId: string) => {
    setOpenWeaknesses((prev) => ({
      ...prev,
      [applicationId]: !prev[applicationId],
    }));
  };

  const handleCheckboxChange = async (
    applicationId: string,
    checked: boolean
  ) => {
    if (checked) {
      try {
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
      } catch (error) {
        console.error(error);
      }
    } else {
      const sessionId = sessionIds[applicationId];
      if (sessionId) {
        try {
          await deleteInterviewSessionAction(sessionId);
          setSessionApplicationIds((prev) =>
            prev.filter((id) => id !== applicationId)
          );
          setSessionIds((prev) => {
            const newState = { ...prev };
            delete newState[applicationId];
            return newState;
          });
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  const handleConfirmInterviews = () => {
    if (sessionApplicationIds.length === 0) {
      alert("Please select at least one applicant");
      return;
    }

    setIsSubmitting(true);
    console.log("Confirming interviews", sessionIds);
    router.push(`/recruiter/dashboard/postings/${jobId}`);
  };

  return (
    <div className="space-y-6">
      {applications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No applicants available for this job posting.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((application) => (
            <Card
              key={application.applicationId}
              className={`overflow-hidden transition-all duration-200 ${
                sessionApplicationIds.includes(application.applicationId)
                  ? "border-indigo-300 shadow-md bg-indigo-50"
                  : "hover:border-gray-300"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10 border border-indigo-100">
                    <AvatarFallback className="bg-indigo-100 text-indigo-700">
                      {application.applicant.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 truncate">
                      {application.applicant.name}
                    </h4>
                    <div className="flex items-center text-sm text-gray-500 gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">
                        {application.applicant.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {application.status && (
                    <Badge
                      variant="outline"
                      className="bg-indigo-50 text-indigo-700"
                    >
                      {application.status}
                    </Badge>
                  )}
                  {application.keywords?.slice(0, 2).map((keyword, i) => (
                    <Badge key={i} variant="secondary" className="bg-gray-100">
                      {keyword}
                    </Badge>
                  ))}
                </div>

                {application.strength && (
                  <div className="mb-2">
                    <button
                      onClick={() => toggleStrength(application.applicationId)}
                      className="flex items-center justify-between w-full py-1.5 px-2 text-sm font-medium bg-green-50 hover:bg-green-100 rounded-md text-green-700 transition"
                    >
                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4" />
                        <span>Strengths</span>
                      </div>
                      {openStrengths[application.applicationId] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    {openStrengths[application.applicationId] && (
                      <div className="mt-1 ml-2 pl-2 border-l-2 border-green-200 text-sm text-green-600">
                        {application.strength}
                      </div>
                    )}
                  </div>
                )}

                {application.weakness && (
                  <div>
                    <button
                      onClick={() => toggleWeakness(application.applicationId)}
                      className="flex items-center justify-between w-full py-1.5 px-2 text-sm font-medium bg-amber-50 hover:bg-amber-100 rounded-md text-amber-700 transition"
                    >
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Areas to improve</span>
                      </div>
                      {openWeaknesses[application.applicationId] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    {openWeaknesses[application.applicationId] && (
                      <div className="mt-1 ml-2 pl-2 border-l-2 border-amber-200 text-sm text-amber-600">
                        {application.weakness}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={application.applicationId}
                    checked={sessionApplicationIds.includes(
                      application.applicationId
                    )}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        application.applicationId,
                        checked === true
                      )
                    }
                    className="border-indigo-300 text-indigo-600"
                  />
                  <label
                    htmlFor={application.applicationId}
                    className="text-sm font-medium cursor-pointer"
                  >
                    Select for interview
                  </label>
                </div>

                {sessionApplicationIds.includes(application.applicationId) && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="pt-6 flex justify-end">
        <Button
          onClick={handleConfirmInterviews}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium gap-2"
          size="lg"
          disabled={isSubmitting}
        >
          <UserCheck className="h-4 w-4" />
          {isSubmitting ? "Confirming..." : "Confirm Selected Applicants"}
        </Button>
      </div>
    </div>
  );
};

export default Applicants;
