"use client";

import { InterviewQA } from "@/generated/prisma";
import { Lightbulb, Volume2 } from "lucide-react";

interface QuestionsSectionProps {
  questions: InterviewQA[];
  activeQuestionIndex: number;
}

export default function QuestionsSection({
  questions,
  activeQuestionIndex,
}: QuestionsSectionProps) {
  const textToSpeech = (text: string) => {
    if ("speechSynthesis" in window) {
      const speech = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(speech);
    } else {
      alert("Sorry, Your browser does not support text to speech");
    }
  };

  if (!questions || questions.length === 0) {
    return <div>No questions available</div>;
  }

  return (
    <div className="p-5 border rounded-lg my-10">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {questions.map((question, index) => (
          <h2
            key={question.interviewQAId}
            className={`p-2 border rounded-full text-xs md:text-sm text-center cursor-pointer 
              ${
                activeQuestionIndex === index
                  ? "bg-primary text-white"
                  : "bg-secondary text-dark"
              }`}
          >
            Question #{index + 1}
          </h2>
        ))}
      </div>

      <h2 className="my-5 text-md md:text-lg">
        {questions[activeQuestionIndex]?.question}
      </h2>
      <Volume2
        className="cursor-pointer"
        onClick={() => textToSpeech(questions[activeQuestionIndex]?.question)}
      />

      <div className="border rounded-lg p-5 bg-secondary mt-20">
        <h2 className="flex gap-2 items-center text-primary">
          <Lightbulb />
          <strong>Note:</strong>
        </h2>
        <h2 className="text-sm text-primary my-2">
          {process.env.NEXT_PUBLIC_QUESTION_NOTE ||
            "Answer clearly and concisely"}
        </h2>
        <p className="text-sm text-primary">
          Please record your answers while sitting in a quiet room.
        </p>
      </div>
    </div>
  );
}
