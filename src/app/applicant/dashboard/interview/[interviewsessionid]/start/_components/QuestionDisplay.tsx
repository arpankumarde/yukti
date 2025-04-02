"use client";

import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface QuestionDisplayProps {
  question: string;
  questionNumber: number;
}

export default function QuestionDisplay({
  question,
  questionNumber,
}: QuestionDisplayProps) {
  const textToSpeech = () => {
    if ("speechSynthesis" in window) {
      const speech = new SpeechSynthesisUtterance(
        question || "No question available"
      );
      window.speechSynthesis.speak(speech);
    } else {
      toast.error("Sorry, your browser does not support text to speech");
    }
  };

  return (
    <div className="bg-gray-50 p-5 rounded-md border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Question {questionNumber}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={textToSpeech}
          className="h-8 w-8 p-0"
          title="Listen to question"
        >
          <Volume2 className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-gray-700 text-lg">
        {question ?? "No question available"}
      </p>
    </div>
  );
}
