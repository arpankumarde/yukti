"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { completeInterview } from "@/actions/interview";
import { CircleCheckBig, Loader2, Clock } from "lucide-react";
import QuestionDisplay from "./_components/QuestionDisplay";
import InterviewProgress from "./_components/InterviewProgress";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import { protectInterviewRoute } from "@/actions/protectInterviewRoute";

// Fix for "navigator is not defined" error - Import with SSR disabled
const RecordAnswerSection = dynamic(
  () => import('./_components/RecordAnswerSection'),
  { ssr: false }
);

export default function InterviewPage({ params }: { params: { interviewsessionid: string } }) {
  const [interviewData, setInterviewData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(59 * 60); // 59 minutes in seconds
  const router = useRouter();
  const sessionId = params.interviewsessionid;
  const webcamRef = useRef(null);
  const setWebcamRef = (ref: any) => {
    webcamRef.current = ref;
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchInterviewData() {
      try {
        // Use protectInterviewRoute instead of getInterviewSession
        const session = await protectInterviewRoute(sessionId);
        
        setInterviewData(session);
        setQuestions(session.interview.questions);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching interview data:", error);
        toast.error("Failed to load interview session");
        router.push('/applicant/dashboard');
      }
    }
    
    fetchInterviewData();
  }, [sessionId, router]);

  const handleNextQuestion = () => {
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleCompleteInterview = async () => {
    setIsSubmitting(true);
    try {
      const result = await completeInterview(sessionId);
      if (result.success) {
        toast.success("Interview completed successfully!");
        router.push(`/applicant/dashboard/interview/${sessionId}/feedback`);
      } else {
        toast.error(result.error || "Failed to complete interview");
      }
    } catch (error) {
      console.error("Error completing interview:", error);
      toast.error("An error occurred while completing the interview");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-2 font-medium">Loading interview...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-start mb-6">
        {/* Left side: Title */}
        <h1 className="text-2xl font-bold">
          {interviewData?.interview?.title || "Interview Session"}
        </h1>
        
        {/* Right side: Badge and Timer */}
        <div className="flex flex-col items-end">
          <Badge 
            variant="outline" 
            className="px-3 py-1 bg-primary/10 text-primary"
          >
            AI Powered Interview
          </Badge>
          
          {/* Timer display below badge with spacing - UPDATED: SMALLER SIZE */}
          <div className="mt-2 bg-white shadow-sm rounded-full px-3 py-1 flex items-center space-x-1 border border-gray-200 text-sm">
            <Clock className="h-3.5 w-3.5 text-red-500" />
            <div className={`font-mono font-medium text-sm ${timeRemaining < 300 ? 'text-red-600' : ''}`}>
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <InterviewProgress
          currentQuestion={activeQuestionIndex + 1}
          totalQuestions={questions.length}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Left Column: Questions and Controls */}
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h2 className="text-xl">Interview Question</h2>
            </div>
            
            <QuestionDisplay
              question={questions[activeQuestionIndex]?.question}
              questionNumber={activeQuestionIndex + 1}
            />
            
            <div className="bg-gray-50 rounded-lg p-4 border">
              <RecordAnswerSection
                questions={questions}
                activeQuestionIndex={activeQuestionIndex}
                interviewData={interviewData}
                sessionId={sessionId}
                webcamRef={webcamRef}
                setWebcamRef={setWebcamRef}
                showWebcam={false}
                controlsOnly={true}
              />
            </div>
            
            <div className="flex justify-between mt-2">
              <Button
                variant="outline"
                onClick={handlePrevQuestion}
                disabled={activeQuestionIndex === 0}
                className="flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                  <path d="m15 18-6-6 6-6"></path>
                </svg>
                Previous
              </Button>
              
              {activeQuestionIndex < questions.length - 1 ? (
                <Button onClick={handleNextQuestion} className="flex items-center">
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-4 w-4">
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>
                </Button>
              ) : (
                <Button 
                  onClick={handleCompleteInterview}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CircleCheckBig className="mr-2 h-4 w-4" />
                      Complete Interview
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
          
          {/* Right Column: Webcam */}
          <div>
            <div className="border-b pb-2 mb-4">
              <h2 className="text-xl">Webcam View</h2>
            </div>
            <div className="webcam-container w-full aspect-video bg-muted/20 rounded-lg border overflow-hidden flex items-center justify-center">
              <RecordAnswerSection
                questions={questions}
                activeQuestionIndex={activeQuestionIndex}
                interviewData={interviewData}
                sessionId={sessionId}
                webcamRef={webcamRef}
                setWebcamRef={setWebcamRef}
                showWebcam={true}
                webcamOnly={true}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Please ensure you're in a well-lit, quiet environment for the best interview experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}