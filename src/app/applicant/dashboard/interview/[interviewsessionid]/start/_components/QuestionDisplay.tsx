"use client";

import React from "react";

interface QuestionDisplayProps {
  question: string;
  questionNumber: number;
}

export default function QuestionDisplay({
  question,
  questionNumber,
}: QuestionDisplayProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
      <h3 className="text-lg font-semibold mb-2">
        Question {questionNumber}
      </h3>
      <p className="text-gray-700">{question || "No question available"}</p>
    </div>
  );
}