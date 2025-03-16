"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";

interface InterviewProgressProps {
  currentQuestion: number;
  totalQuestions: number;
}

export default function InterviewProgress({
  currentQuestion,
  totalQuestions,
}: InterviewProgressProps) {
  // Calculate percentage
  const progressPercentage = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2 text-sm text-gray-500">
        <span>Question {currentQuestion} of {totalQuestions}</span>
        <span>{Math.round(progressPercentage)}% Complete</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
}