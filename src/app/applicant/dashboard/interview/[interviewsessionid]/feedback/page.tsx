"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Star, ArrowLeft, Home } from 'lucide-react';
import { getInterviewSession } from '@/actions/interview';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.interviewsessionid as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const ratingShownRef = useRef(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        if (!sessionId) return;
        
        const { session, error } = await getInterviewSession(sessionId);
        
        if (error) {
          throw new Error(error);
        }
        
        setLoading(false);
        
        // Show rating dialog only once after a delay
        if (!ratingShownRef.current) {
          const timer = setTimeout(() => {
            setShowRatingDialog(true);
            ratingShownRef.current = true;
          }, 1500);
          
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error("Error fetching session:", err);
        setError("Error loading interview session. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchSession();
  }, [sessionId]);
  
  const handleRatingSubmit = (rating: number) => {
    setRating(rating);
    setShowRatingDialog(false);
    toast.success(`Thank you for your feedback!`, {
      position: "bottom-right",
    });
  };
  
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
    <>
      <div className="container max-w-2xl mx-auto py-20 px-4">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-3 pb-2">
            <Badge className="mx-auto bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1">
              <CheckCircle className="h-3.5 w-3.5 mr-2" /> Interview Complete
            </Badge>
            
            <CardTitle className="text-3xl font-bold">
              Congratulations!
            </CardTitle>
            <CardDescription className="text-lg">
              Your interview has been successfully submitted
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6 pb-8">
            <div className="p-6 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-slate-700 text-center">
                Your responses have been recorded and will be evaluated by the recruiter.
                You'll receive feedback on your performance soon.
              </p>
            </div>
            
            {rating && (
              <div className="flex justify-center mt-6">
                <div className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-slate-100">
                  <span className="font-medium text-slate-700">Your Rating:</span> 
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < rating ? "fill-amber-500 text-amber-500" : "text-slate-300"}`} 
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between pt-4 pb-6 px-6 border-t border-slate-100">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            
            <Button 
              className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              onClick={() => router.push('/applicant/dashboard')}
            >
              <Home className="h-4 w-4" /> Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Star Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={(open) => {
        // If closing, mark as shown so it doesn't reappear
        if (!open) ratingShownRef.current = true;
        setShowRatingDialog(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3 pb-2">
            <DialogTitle className="text-xl font-semibold text-center">
              How was your experience?
            </DialogTitle>
            <DialogDescription className="text-center">
              Please rate your interview experience with us
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingSubmit(star)}
                  className="transition-all hover:scale-110 focus:outline-none"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star 
                    className={`h-9 w-9 cursor-pointer ${
                      rating && rating >= star
                        ? "fill-amber-500 text-amber-500"
                        : "text-slate-200 hover:text-amber-400"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <DialogFooter className="border-t border-slate-100 pt-4">
            <Button
              variant="ghost"
              onClick={() => setShowRatingDialog(false)}
              className="mx-auto"
            >
              Maybe later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}