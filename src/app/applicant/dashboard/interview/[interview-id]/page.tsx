"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lightbulb, WebcamIcon } from "lucide-react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInterviewSession } from "@/actions/interview";

interface InterviewSession {
  interviewSessionId: string;
  attempted: boolean;
  interview: {
    title: string;
    job: {
      title: string;
      description: string;
      experience: string;
    };
  };
}

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(null);
  const [webCamEnabled, setWebCamEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterviewDetails = async () => {
      try {
        const sessionId = params.interviewsessionid as string;
        if (!sessionId) return;

        const { session, error } = await getInterviewSession(sessionId);
        
        if (error) {
          throw new Error(error);
        }
        
        setInterviewSession(session);
      } catch (err) {
        console.error("Error fetching interview details:", err);
        setError("Error loading interview. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewDetails();
  }, [params.interviewsessionid]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading interview details...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  }

  if (!interviewSession) {
    return <div className="flex justify-center items-center min-h-screen">Interview not found</div>;
  }

  return (
    <div className="container mx-auto my-10 max-w-4xl">
      <h1 className="font-bold text-3xl mb-6">Let's Get Started</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                <strong>Job Role:</strong> {interviewSession.interview.job.title}
              </p>
              <p>
                <strong>Description:</strong> {interviewSession.interview.job.description}
              </p>
              <p>
                <strong>Experience Required:</strong> {interviewSession.interview.job.experience}
              </p>
              {interviewSession.attempted && (
                <p className="text-amber-600 font-medium">
                  You have already attempted this interview
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-700">
                <Lightbulb className="mr-2" />
                Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-yellow-700">
              <p className="mb-3">Please sit in a quiet place and record your answers.</p>
              <p>Your answers will be saved and evaluated. Make sure your microphone and camera are working properly.</p>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col items-center justify-center">
          {webCamEnabled ? (
            <Webcam
              onUserMedia={() => setWebCamEnabled(true)}
              onUserMediaError={() => setWebCamEnabled(false)}
              mirrored={true}
              className="rounded-lg shadow-lg"
              style={{
                height: 300,
                width: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <Card className="w-full">
              <CardContent className="flex flex-col items-center p-6">
                <WebcamIcon className="h-40 w-40 text-gray-400 mb-4" />
                <Button variant="primary" className="w-full" onClick={() => setWebCamEnabled(true)}>
                  Enable Web Cam and Microphone
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <div className="flex justify-end mt-8">
        <Link href={`/dashboard/interview/${params.interviewsessionid}/start`}>
          <Button 
            className="py-2 px-4 rounded-lg transition-colors duration-200 font-medium text-sm bg-primary/10 hover:bg-primary/20 text-primary"
            disabled={interviewSession.attempted}
          >
            {interviewSession.attempted ? "Review Interview" : "Start Interview"}
          </Button>
        </Link>
      </div>
    </div>
  );
}