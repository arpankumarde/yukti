// filepath: /workspaces/yukti/src/app/dashboard/interview/[interviewsessionid]/feedback/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronsUpDown } from 'lucide-react';
import { getInterviewSession } from '@/actions/interview';

interface TranscriptEntry {
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  feedback: string;
  rating: number;
  timestamp: string;
}

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.interviewsessionid as string;
  const [feedbackList, setFeedbackList] = useState<TranscriptEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        if (!sessionId) return;
        
        const { session, error } = await getInterviewSession(sessionId);
        
        if (error) {
          throw new Error(error);
        }
        
        // Cast transcript to the expected format
        const transcript = session.transcript as TranscriptEntry[];
        setFeedbackList(transcript || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError("Error loading feedback. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchFeedback();
  }, [sessionId]);
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading feedback...</div>;
  }
  
  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  }

  return (
    <div className='container mx-auto p-10'>
      {feedbackList?.length === 0 ? (
        <h2 className='font-bold text-xl text-gray-500'>
          No Interview Feedback Record Found
        </h2>
      ) : (
        <>
          <h2 className='text-3xl font-bold text-green-500'>Congratulations!</h2>
          <h2 className='font-bold text-2xl'>Here is your interview feedback</h2>
          <h2 className='text-sm text-gray-500 mb-6'>
            Find below interview questions with correct answers, your answers, and feedback
            for improvement
          </h2>
          
          {feedbackList.map((item, index) => (
            <Collapsible key={index} className='mt-7'>
              <CollapsibleTrigger className='p-2 bg-secondary rounded-lg flex justify-between my-2 text-left gap-7 w-full'>
                {item.question} <ChevronsUpDown className='h-5 w-5'/>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className='flex flex-col gap-2'>
                  <h2 className='text-red-500 p-2 border rounded-lg'>
                    <strong>Rating:</strong> {item.rating}/10
                  </h2>
                  <h2 className='p-2 border rounded-lg bg-red-50 text-sm text-red-900'>
                    <strong>Your Answer: </strong>{item.userAnswer}
                  </h2>
                  <h2 className='p-2 border rounded-lg bg-green-50 text-sm text-green-900'>
                    <strong>Correct Answer: </strong>{item.correctAnswer}
                  </h2>
                  <h2 className='p-2 border rounded-lg bg-blue-50 text-sm text-primary'>
                    <strong>Feedback: </strong>{item.feedback}
                  </h2>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </>
      )}
      <Button onClick={() => router.push('/dashboard')} className="mt-8">Go Home</Button>
    </div>
  );
}