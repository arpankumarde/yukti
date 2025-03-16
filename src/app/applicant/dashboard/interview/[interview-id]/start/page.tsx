"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from "next/navigation";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import QuestionsSection from './_components/QuestionsSection';
import RecordAnswerSection from './_components/RecordAnswerSection';
import { getInterviewSession, startInterview } from '@/actions/interview';
import { InterviewQA } from '@prisma/client';

export default function StartInterview() {
  const params = useParams();
  const sessionId = params.interviewsessionid as string;
  const [interviewData, setInterviewData] = useState<any>(null);
  const [questions, setQuestions] = useState<InterviewQA[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchInterviewDetails = async () => {
      try {
        if (!sessionId) return;
        
        // Get session details
        const { session, error } = await getInterviewSession(sessionId);
        
        if (error) {
          throw new Error(error);
        }
        
        // Mark interview as attempted
        await startInterview(sessionId);
        
        setInterviewData(session);
        setQuestions(session.interview.questions);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching interview details:", err);
        setError("Error loading interview. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchInterviewDetails();
  }, [sessionId]);
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading interview questions...</div>;
  }
  
  if (error || !interviewData) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error || "Interview not found"}</div>;
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
        {/* Questions Section */}
        <QuestionsSection 
          questions={questions}
          activeQuestionIndex={activeQuestionIndex}
        />
        
        {/* Recording Section */}
        <RecordAnswerSection
          questions={questions}
          activeQuestionIndex={activeQuestionIndex}
          interviewData={interviewData}
          sessionId={sessionId}
        />
      </div>
      
      <div className='flex justify-end gap-6 mt-8'>
        {activeQuestionIndex > 0 && (
          <Button onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}>
            Previous Question
          </Button>
        )}
        
        {activeQuestionIndex !== questions.length - 1 && (
          <Button onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}>
            Next Question
          </Button>
        )}
        
        {activeQuestionIndex === questions.length - 1 && (
          <Link href={`/dashboard/interview/${sessionId}/feedback`}>
            <Button>End Interview</Button>
          </Link>
        )}
      </div>
    </div>
  );
}