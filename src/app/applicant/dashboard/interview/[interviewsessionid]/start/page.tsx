"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { getInterviewSession, completeInterview } from "@/actions/interview";
import { CircleCheckBig, Loader2 } from "lucide-react";
import QuestionDisplay from "./_components/QuestionDisplay";
import RecordAnswerSection from "./_components/RecordAnswerSection";
import InterviewProgress from "./_components/InterviewProgress";

export default function InterviewPage({ params }: { params: { interviewsessionid: string } }) {
  const [interviewData, setInterviewData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const sessionId = params.interviewsessionid;

  useEffect(() => {
    async function fetchInterviewData() {
      try {
        const result = await getInterviewSession(sessionId);
        
        if (result.error) {
          toast.error(result.error);
          return;
        }
        
        if (!result.session) {
          toast.error("Failed to load interview");
          return;
        }
        
        setInterviewData(result.session);
        setQuestions(result.session.interview.questions);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching interview data:", error);
        toast.error("Failed to load interview session");
      }
    }
    
    fetchInterviewData();
  }, [sessionId]);

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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading interview...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {interviewData?.interview?.title || "Interview Session"}
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <InterviewProgress
          currentQuestion={activeQuestionIndex + 1}
          totalQuestions={questions.length}
        />
        
        <div className="mb-6">
          <QuestionDisplay
            question={questions[activeQuestionIndex]?.question}
            questionNumber={activeQuestionIndex + 1}
          />
        </div>

        <RecordAnswerSection
          questions={questions}
          activeQuestionIndex={activeQuestionIndex}
          interviewData={interviewData}
          sessionId={sessionId}
        />

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevQuestion}
            disabled={activeQuestionIndex === 0}
          >
            Previous Question
          </Button>
          
          {activeQuestionIndex < questions.length - 1 ? (
            <Button onClick={handleNextQuestion}>
              Next Question
            </Button>
          ) : (
            <Button 
              onClick={handleCompleteInterview}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing Interview...
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
    </div>
  );
}