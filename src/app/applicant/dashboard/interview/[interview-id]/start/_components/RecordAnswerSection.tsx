"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "@/utils/OpenAiModel";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";

function RecordAnswerSection({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
}) {
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);

  useEffect(() => {
    console.log("Component Props:", {
      mockInterviewQuestion,
      activeQuestionIndex,
      interviewData,
    });
  }, [mockInterviewQuestion, activeQuestionIndex, interviewData]);

  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults,
  } = useSpeechToText({
    continuous: false,
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
      console.log("New speech results:", results);
      results.forEach((result) => {
        setUserAnswer((prevAns) => {
          const newAnswer = prevAns + result.transcript;
          console.log("Updated user answer:", newAnswer);
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
      UpdateUserAnswer();
      setHasRecorded(false);
    }
  }, [isRecording]);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);
      console.log("Microphone permission granted");
      return true;
    } catch (error) {
      console.error("Microphone permission error:", error);
      toast.error("Please allow microphone access to record your answer");
      return false;
    }
  };

  const StartStopRecording = async () => {
    try {
      if (isRecording) {
        console.log("Stopping recording");
        stopSpeechToText();
      } else {
        console.log("Starting recording");
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

  const UpdateUserAnswer = async () => {
    try {
      console.log("Starting UpdateUserAnswer with:", userAnswer);
      setLoading(true);

      const feedbackPrompt = `Evaluate the user's answer to the interview question below. Assign a rating (1-10) based on these guidelines:
- **1-3**: Empty, irrelevant, or nonsensical response.
- **4-6**: Partially addresses the question but lacks depth, structure, or clarity.
- **7-8**: Relevant and coherent but missing key details or examples.
- **9-10**: Clear, structured, and comprehensive with specific examples.

Consider accuracy, completeness, and articulation. Penalize empty answers with a 1-3 rating.

Question: ${mockInterviewQuestion[activeQuestionIndex]?.question}
User Answer: ${userAnswer}

Provide strictly formatted JSON:
{
  "rating": [insert score],
  "feedback": "[concise evaluation of gaps/strengths]"
}`;
      console.log("Feedback prompt prepared:", feedbackPrompt);

      console.log("Before calling OpenAI with feedback prompt");
      const result = await chatSession.sendMessage(feedbackPrompt);
      console.log("After receiving response from OpenAI:", result);

      let JsonFeedbackResp;
      try {
        const mockJsonResp = result.replace(/```json|```/g, "").trim();
        console.log("Cleaned JSON response:", mockJsonResp);
        JsonFeedbackResp = JSON.parse(mockJsonResp);
        console.log("Parsed feedback:", JsonFeedbackResp);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", result, parseError);
        toast.error("Failed to parse feedback from AI");
        return;
      }

      const values = {
        mockIdRef: (interviewData && interviewData.mockId) || "unknown",
        question: mockInterviewQuestion[activeQuestionIndex]?.question,
        correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
        userAns: userAnswer,
        feedback: JsonFeedbackResp?.feedback,
        rating: JsonFeedbackResp?.rating,
        userEmail: "anonymous",
        createdAt: moment().format("DD-MM-yyyy"),
      };

      console.log("Before inserting into database, values:", values);
      const resp = await db.insert(UserAnswer).values(values);
      console.log("After database insertion, response:", resp);

      if (resp) {
        toast.success("User Answer recorded successfully");
        setUserAnswer("");
        setResults([]);
      }
    } catch (error) {
      console.error("Error in UpdateUserAnswer:", {
        error,
        message: error.message,
        stack: error.stack,
      });
      toast.error(
        "Failed to save answer: " + (error?.message || "Unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5">
        <Image
          src={"/webcam.png"}
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
      <Button
        disabled={loading}
        variant="outline"
        className="my-10"
        onClick={() => StartStopRecording()}
      >
        {isRecording ? (
          <h2 className="text-red-600 animate-pulse flex gap-2 items-center">
            <StopCircle /> Stop Recording
          </h2>
        ) : (
          <h2 className="text-primary flex gap-2 items-center">
            <Mic /> Record Answer
          </h2>
        )}
      </Button>
    </div>
  );
}

export default RecordAnswerSection;
