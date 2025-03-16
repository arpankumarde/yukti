"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { saveAnswer } from "@/actions/interview";
import { InterviewQA } from "@prisma/client";
import { useUser } from "@clerk/nextjs";

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
}

export default function RecordAnswerSection({
  questions,
  activeQuestionIndex,
  interviewData,
  sessionId,
}: RecordAnswerSectionProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);

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
    if (!isRecording && hasRecorded) {
      console.log(
        "Recording stopped, triggering UpdateUserAnswer with answer:",
        userAnswer
      );
      handleSaveAnswer();
      setHasRecorded(false);
    }
  }, [isRecording]);

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

  const handleRecording = async () => {
    try {
      if (isRecording) {
        stopSpeechToText();
      } else {
        const permissionGranted = await requestMicrophonePermission();
        if (permissionGranted) {
          setHasRecorded(true);
          await startSpeechToText();
        }
      }
    } catch (error) {
      console.error("Recording error:", error);
      toast.error("Error starting recording");
    }
  };

  const handleSaveAnswer = async () => {
    try {
      setLoading(true);
      
      if (!userAnswer.trim()) {
        toast.error("Please provide an answer before submitting");
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
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5">
        <Image
          src="/webcam.png"
          width={200}
          height={200}
          className="absolute"
          alt="webcam overlay"
        />
        <Webcam
          mirrored={true}
          style={{ height: 500, width: 500, zIndex: 10 }}
          audio={false}
        />
      </div>
      
      <div className="w-full mt-6 space-y-4">
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className="w-full p-3 border rounded-lg h-24"
          placeholder="Your answer will appear here as you speak..."
          disabled={isRecording}
        />
        
        <div className="flex justify-between">
          <Button
            disabled={loading}
            variant="outline"
            className="my-2"
            onClick={handleRecording}
          >
            {isRecording ? (
              <span className="text-red-600 animate-pulse flex gap-2 items-center">
                <StopCircle /> Stop Recording
              </span>
            ) : (
              <span className="text-primary flex gap-2 items-center">
                <Mic /> Record Answer
              </span>
            )}
          </Button>
          
          <Button
            disabled={loading || isRecording || !userAnswer.trim()}
            onClick={handleSaveAnswer}
          >
            {loading ? "Saving..." : "Save Answer"}
          </Button>
        </div>
      </div>
    </div>
  );
}