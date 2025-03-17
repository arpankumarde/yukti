"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Lightbulb, MicIcon, WebcamIcon, XCircle } from "lucide-react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { protectInterviewRoute } from "@/actions/protectInterviewRoute";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
    questions: any[];
  };
  application: {
    applicant: {
      firstName: string;
      lastName: string;
    };
  };
}

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(null);
  const [webCamEnabled, setWebCamEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterviewDetails = async () => {
      try {
        const sessionId = params.interviewsessionid as string;
        if (!sessionId) return;

        // Use protectInterviewRoute instead of getInterviewSession
        const session = await protectInterviewRoute(sessionId);
        
        setInterviewSession(session);
        // Update document title with interview title
        if (session?.interview?.title) {
          document.title = session.interview.title;
        }
      } catch (err) {
        console.error("Error fetching interview details:", err);
        setError("Error loading interview. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewDetails();
  }, [params.interviewsessionid]);

  const checkMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicEnabled(true);
      // Stopping the stream after checking
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setMicEnabled(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mr-3"></div>
      <p className="text-lg">Loading interview details...</p>
    </div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen flex-col">
      <XCircle className="h-12 w-12 text-red-500 mb-2" />
      <p className="text-red-500 text-lg">{error}</p>
    </div>;
  }

  if (!interviewSession) {
    return <div className="flex justify-center items-center min-h-screen">Interview not found</div>;
  }

  return (
    <div className="container mx-auto my-10 max-w-5xl px-4">
      <div className="mb-8 text-center">
        <h1 className="font-bold text-3xl mb-1">{interviewSession.interview.title}</h1>
        <p className="text-muted-foreground">Prepare yourself for your virtual interview experience</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left side - Job details */}
        <div className="space-y-6">
          <Card className="border-l-4 border-l-primary shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Job Details</CardTitle>
              <CardDescription>Position information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Role</h3>
                <p className="font-semibold text-lg">{interviewSession.interview.job.title}</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Experience Required</h3>
                <Badge variant="outline" className="bg-primary/10 text-primary font-medium">
                  {interviewSession.interview.job.experience}
                </Badge>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Job Description</h3>
                <p className="text-sm">{interviewSession.interview.job.description}</p>
              </div>
              
              {interviewSession.attempted && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-amber-600 font-medium flex items-center">
                    <Check className="h-4 w-4 mr-2" /> You have already attempted this interview
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-50 border border-yellow-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-yellow-700 text-lg">
                <Lightbulb className="mr-2 h-5 w-5" />
                Important Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-yellow-700">
              <ul className="space-y-2 list-disc list-inside text-sm">
                <li>Find a quiet place with good lighting for the interview</li>
                <li>Make sure your camera and microphone are working properly</li>
                <li>Your answers will be recorded and evaluated afterward</li>
                <li>Speak clearly and maintain eye contact with the camera</li>
                <li>Ensure you have a stable internet connection</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        
        {/* Right side - Camera and controls */}
        <div className="flex flex-col space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Camera Preview</CardTitle>
              <CardDescription>Check how you appear on camera</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {webCamEnabled ? (
                <div className="relative w-full">
                  <Webcam
                    onUserMedia={() => setWebCamEnabled(true)}
                    onUserMediaError={() => setWebCamEnabled(false)}
                    mirrored={true}
                    className="rounded-lg border shadow-inner w-full"
                    style={{
                      height: 300,
                      width: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <Badge className="absolute top-3 right-3 bg-black/50 text-white">
                    Camera Active
                  </Badge>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] w-full border-2 border-dashed rounded-lg bg-muted/20">
                  <WebcamIcon className="h-20 w-20 text-gray-400 mb-4" />
                  <p className="text-muted-foreground text-sm mb-4">Camera preview will appear here</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 w-full mt-6">
                <Button 
                  variant={webCamEnabled ? "outline" : "default"}
                  className={`flex items-center justify-center ${webCamEnabled ? "border-green-500 text-green-600" : ""}`} 
                  onClick={() => setWebCamEnabled(!webCamEnabled)}
                >
                  <WebcamIcon className="h-4 w-4 mr-2" />
                  {webCamEnabled ? "Camera On" : "Enable Camera"}
                </Button>
                
                <Button 
                  variant={micEnabled ? "outline" : "default"}
                  className={`flex items-center justify-center ${micEnabled ? "border-green-500 text-green-600" : ""}`} 
                  onClick={checkMicrophone}
                >
                  <MicIcon className="h-4 w-4 mr-2" />
                  {micEnabled ? "Mic Working" : "Test Microphone"}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Link href={`/applicant/dashboard/interview/${params.interviewsessionid}/start`}>
              <Button 
                className="py-2.5 px-6 rounded-lg transition-colors font-medium bg-primary hover:bg-primary/90 text-white"
                disabled={interviewSession.attempted || !webCamEnabled || !micEnabled}
              >
                {interviewSession.attempted ? "Review Interview" : "Start Interview"}
              </Button>
            </Link>
          </div>
          
          {(!webCamEnabled || !micEnabled) && (
            <p className="text-sm text-muted-foreground text-center">
              Please enable both camera and microphone before proceeding
            </p>
          )}
        </div>
      </div>
    </div>
  );
}