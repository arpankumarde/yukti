"use client";

import { InterviewQA } from "@prisma/client";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";
import { addQuestionAction } from "./questionActions";

const Questions = ({
  questionProps,
  interviewId,
}: {
  questionProps: InterviewQA[];
  interviewId: string;
}) => {
  let [questions, setQuestions] = useState<InterviewQA[]>(questionProps);
  const [open, setOpen] = useState(false);
  const [addQuestion, setAddQuestion] = useState<{
    question: string;
    answer: string;
    interviewId: string;
  }>({ question: "", answer: "", interviewId: interviewId });
  const [editingQuestion, setEditingQuestion] = useState<InterviewQA | null>(
    null
  );

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { question } = await addQuestionAction(addQuestion);
      console.log("Question added", question?.interviewQAId);

      {
        question && setQuestions([...questions, question]);
      }
      setAddQuestion({ question: "", answer: "", interviewId: interviewId });
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("Failed to add question");
    }
  };

  return (
    <div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button>
            <Plus />
            <span>Add Offer</span>
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add Question</SheetTitle>
            <SheetDescription>
              The Applicant would have to answer this question
            </SheetDescription>

            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  defaultValue={addQuestion?.question || ""}
                  onChange={(e) =>
                    setAddQuestion({
                      ...addQuestion,
                      question: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="answer">Sample or Expected Answer</Label>
                <Input
                  id="answer"
                  defaultValue={editingQuestion?.answer || ""}
                  onChange={(e) =>
                    setAddQuestion({
                      ...addQuestion,
                      answer: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <SheetClose asChild>
                  <Button variant="outline">
                    <span>Cancel</span>
                  </Button>
                </SheetClose>
                <Button type="submit">
                  <span>
                    {editingQuestion ? "Update Question" : "Add Question"}
                  </span>
                </Button>
              </div>
            </form>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      {questions.length === 0 ? (
        <p>No questions available.</p>
      ) : (
        questions.map((question) => (
          <div key={question.interviewQAId}>
            <p>{question.question}</p>
            <p>{question.answer || "Sample answer not provided"}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Questions;
