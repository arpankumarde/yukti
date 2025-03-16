"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Star, Trophy, ArrowLeft, Home } from 'lucide-react';
import { getInterviewSession } from '@/actions/interview';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.interviewsessionid as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        if (!sessionId) return;
        
        const { session, error } = await getInterviewSession(sessionId);
        
        if (error) {
          throw new Error(error);
        }
        
        setLoading(false);
        setShowConfetti(true);

        // Show rating toast after a delay
        setTimeout(() => {
          toast("Please rate your interview experience", {
            duration: 10000,
            position: "bottom-right",
            action: {
              label: (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 cursor-pointer ${
                        rating && rating >= star
                          ? rating < 3
                            ? "fill-red-500 text-red-500"
                            : rating === 3
                            ? "fill-yellow-500 text-yellow-500"
                            : "fill-green-500 text-green-500"
                          : "text-gray-300"
                      }`}
                      onClick={() => {
                        setRating(star);
                        toast.success(`Thank you for your ${star}-star rating!`, {
                          position: "bottom-right",
                        });
                      }}
                    />
                  ))}
                </div>
              ),
            },
          });
        }, 2000);
      } catch (err) {
        console.error("Error fetching session:", err);
        setError("Error loading interview session. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchSession();
  }, [sessionId]);
  
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-muted-foreground">Loading your results...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-red-500 gap-2">
        <CheckCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg">{error}</p>
        <Button variant="outline" onClick={() => router.push('/applicant/dashboard')} className="mt-4">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-16 px-4">
      <Card className="border-2 border-primary/10 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Trophy className="h-16 w-16 text-primary" />
            </div>
          </div>
          <Badge variant="outline" className="px-3 py-1 bg-primary/10 text-primary mx-auto mb-4">
            Interview Complete
          </Badge>
          <CardTitle className="text-3xl font-bold text-center">Congratulations!</CardTitle>
          <CardDescription className="text-lg mt-2">
            You have successfully completed your interview
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center pt-4">
          <div className="p-6 bg-green-50 border border-green-100 rounded-lg">
            <p className="text-green-700">
              Your responses have been recorded and will be evaluated. Check back later for detailed feedback.
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Interview progress</p>
            <Progress value={100} className="h-2" />
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4 pt-6">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 flex-1"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            
            <Button 
              className="flex items-center gap-2 flex-1 bg-primary hover:bg-primary/90"
              onClick={() => router.push('/applicant/dashboard')}
            >
              <Home className="h-4 w-4" /> Go to Dashboard
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}