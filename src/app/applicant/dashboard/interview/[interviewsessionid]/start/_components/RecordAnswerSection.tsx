"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic, StopCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { saveAnswer } from "@/actions/interview";
import { InterviewQA } from "@prisma/client";
// Remove Clerk import
// import { useUser } from "@clerk/nextjs";
import { getCookie } from "cookies-next";

// Define AuthCookie interface based on your app's cookie structure
interface AuthCookie {
  applicantId: string;
}

// Helper function to call OpenAI for feedback
async function getAIFeedback(question: string, userAnswer: string) {
  try {
    const feedbackPrompt = `Evaluate the user's answer to the interview question below. Assign a rating (1-10) based on these guidelines:
- 1-3: Empty, irrelevant, or nonsensical response.
- 4-6: Partially addresses the question but lacks depth, structure, or clarity.
- 7-8: Relevant and coherent but missing key details or examples.
- 9-10: Clear, structured, and comprehensive with specific examples.

Consider accuracy, completeness, and articulation. Penalize empty answers with a 1-3 rating.

Question: ${question}
User Answer: ${userAnswer}

Provide strictly formatted JSON:
{
  "rating": [insert score],
  "feedback": "[concise evaluation of gaps/strengths]"
}`;

    const response = await fetch("/api/ai/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: feedbackPrompt }),
    });
    
    const data = await response.json();
    
    // Parse the JSON response
    if (data.result) {
      let jsonResult;
      try {
        // Clean the response if needed
        const cleanedResponse = data.result.replace(/```json|```/g, "").trim();
        jsonResult = JSON.parse(cleanedResponse);
      } catch (error) {
        console.error("Failed to parse AI feedback:", error);
        return { rating: 5, feedback: "Unable to generate detailed feedback" };
      }
      
      return jsonResult;
    }
    return { rating: 5, feedback: "Unable to generate detailed feedback" };
  } catch (error) {
    console.error("Error getting AI feedback:", error);
    return { rating: 5, feedback: "Unable to generate feedback due to an error" };
  }
}

interface RecordAnswerSectionProps {
  questions: InterviewQA[];
  activeQuestionIndex: number;
  interviewData: any;
  sessionId: string;
  webcamRef?: any;
  setWebcamRef?: (ref: any) => void;
  showWebcam?: boolean;
  webcamOnly?: boolean;
  controlsOnly?: boolean;
}

export default function RecordAnswerSection({
  questions,
  activeQuestionIndex,
  interviewData,
  sessionId,
  webcamRef,
  setWebcamRef,
  showWebcam = true,
  webcamOnly = false,
  controlsOnly = false
}: RecordAnswerSectionProps) {
  const [userAnswer, setUserAnswer] = useState("");
  // Replace Clerk's useUser with cookie-based auth
  // const { user } = useUser();
  const [applicant, setApplicant] = useState<AuthCookie | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = React.useRef<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Get applicant data from cookie
  useEffect(() => {
    const cookieValue = getCookie('ykapptoken');
    if (cookieValue) {
      try {
        const userData = JSON.parse(cookieValue as string) as AuthCookie;
        setApplicant(userData);
      } catch (error) {
        console.error("Error parsing auth cookie:", error);
        toast.error("Authentication error. Please log in again.");
      }
    } else {
      console.error("Auth cookie not found");
      toast.error("Please log in to continue");
    }
  }, []);

  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  useEffect(() => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      toast.error(
        "Speech recognition is not supported in this browser. Please use Chrome."
      );
    }
  }, []);

  useEffect(() => {
    if (error) {
      console.error("Speech to text error:", error);
      toast.error("Error recording speech: " + error.message);
      stopSpeechToText();
    }
  }, [error, stopSpeechToText]);

  useEffect(() => {
    if (results?.length > 0) {
      results.forEach((result) => {
        setUserAnswer((prevAns) => {
          const newAnswer = prevAns + result.transcript;
          return newAnswer;
        });
      });
    }
  }, [results]);

  useEffect(() => {
    // Reset recording time and answer when changing questions
    setRecordingTime(0);
    setUserAnswer("");
    setResults([]);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [activeQuestionIndex, setResults]);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);
      return true;
    } catch (error) {
      console.error("Microphone permission error:", error);
      toast.error("Please allow microphone access to record your answer");
      return false;
    }
  };

  const handleStartRecording = async () => {
    const permissionGranted = await requestMicrophonePermission();
    if (permissionGranted) {
      setHasRecorded(true);
      setRecordingTime(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      await startSpeechToText();
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    }
  };

  const handleStopRecording = () => {
    stopSpeechToText();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSaveAnswer = async () => {
    setIsSaving(true);
    try {
      if (!applicant) {
        toast.error("Authentication error. Please log in again.");
        setIsSaving(false);
        return;
      }
      
      if (!userAnswer.trim()) {
        toast.error("Please provide an answer before submitting");
        setIsSaving(false);
        return;
      }
      
      const currentQuestion = questions[activeQuestionIndex];
      
      // Get AI feedback on the answer
      const aiResponse = await getAIFeedback(
        currentQuestion.question,
        userAnswer
      );
      
      // Save the answer to the database
      const { success, error } = await saveAnswer({
        sessionId,
        questionId: currentQuestion.interviewQAId,
        question: currentQuestion.question,
        userAnswer,
        correctAnswer: currentQuestion.answer || "No model answer provided",
        feedback: aiResponse.feedback,
        rating: aiResponse.rating,
      });
      
      if (success) {
        toast.success("Answer recorded successfully");
        setUserAnswer("");
        setResults([]);
      } else {
        toast.error(error || "Failed to save answer");
      }
    } catch (error) {
      console.error("Error in saving answer:", error);
      toast.error(
        "Failed to save answer: " + (error.message || "Unknown error occurred")
      );
    } finally {
      setIsSaving(false);
    }
  };

  // For webcam only display
  if (webcamOnly && showWebcam) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Webcam
          audio={false}
          ref={setWebcamRef}
          mirrored={true}
          videoConstraints={{
            width: 720,
            height: 405,
            facingMode: "user"
          }}
          className="w-full h-auto rounded-md shadow-md"
        />
      </div>
    );
  }

  // For controls only display
  if (controlsOnly) {
    return (
      <div className="w-full">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Your Answer</label>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full p-3 border rounded-lg h-24 focus:ring-2 focus:ring-primary/50 focus:border-primary"
            placeholder="Your answer will appear here as you speak..."
            disabled={isRecording}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-center font-mono font-bold text-lg">
            {isRecording ? (
              <span className="text-red-600 animate-pulse">{formatTime(recordingTime)}</span>
            ) : (
              <span className="text-gray-700">{formatTime(recordingTime)}</span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              disabled={isSaving}
              variant={isRecording ? "destructive" : "outline"}
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className="my-2"
            >
              {isRecording ? (
                <span className="flex gap-2 items-center">
                  <StopCircle className="h-4 w-4" /> Stop Recording
                </span>
              ) : (
                <span className="text-primary flex gap-2 items-center">
                  <Mic className="h-4 w-4" /> Record Answer
                </span>
              )}
            </Button>
            
            <Button
              type="button"
              onClick={handleSaveAnswer}
              disabled={recordingTime > 0 || isRecording || isSaving || !userAnswer.trim()}
              className="my-2"
            >
              <span className="flex gap-2 items-center">
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Answer"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Default full component
  return (
    <div className="w-full">
      <div className="flex justify-center mb-4">
        {showWebcam && (
          <div className="relative">
            <Webcam
              audio={true}
              ref={setWebcamRef}
              mirrored={true}
              videoConstraints={{
                width: 720,
                height: 405,
                facingMode: "user"
              }}
              className="w-full h-auto rounded-md shadow-md"
            />
            <Image
              src="/webcam.png"
              width={200}
              height={200}
              className="absolute"
              alt="webcam overlay"
            />
          </div>
        )}
      </div>
      
      <div className="w-full space-y-4">
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className="w-full p-3 border rounded-lg h-24"
          placeholder="Your answer will appear here as you speak..."
          disabled={isRecording}
        />
        
        <div className="text-center font-mono font-bold text-lg">
          {isRecording ? (
            <span className="text-red-600 animate-pulse">{formatTime(recordingTime)}</span>
          ) : (
            <span className="text-gray-700">{formatTime(recordingTime)}</span>
          )}
        </div>
        
        <div className="flex justify-between">
          <Button
            disabled={isSaving}
            variant={isRecording ? "destructive" : "outline"}
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className="my-2"
          >
            {isRecording ? (
              <span className="flex gap-2 items-center">
                <StopCircle className="h-4 w-4" /> Stop Recording
              </span>
            ) : (
              <span className="text-primary flex gap-2 items-center">
                <Mic className="h-4 w-4" /> Record Answer
              </span>
            )}
          </Button>
          
          <Button
            type="button"
            onClick={handleSaveAnswer}
            disabled={recordingTime > 0 || isRecording || isSaving || !userAnswer.trim()}
            className="my-2"
          >
            {isSaving ? "Saving..." : "Save Answer"}
          </Button>
        </div>
      </div>
    </div>
  );
}