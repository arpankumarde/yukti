"use client";

import { InterviewQA, Job } from "@/generated/prisma";
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
import {
  Pencil,
  Plus,
  Trash2,
  Sparkles,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import {
  addQuestionAction,
  deleteQuestionAction,
  updateQuestionAction,
} from "./questionActions";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AIQuestion {
  question: string;
  answer: string;
}

const Questions = ({
  questionProps,
  interviewId,
  job,
  interviewTitle,
}: {
  questionProps: InterviewQA[];
  interviewId: string;
  job: Job;
  interviewTitle: string;
}) => {
  const router = useRouter();
  const [questions, setQuestions] = useState<InterviewQA[]>(questionProps);
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [addQuestion, setAddQuestion] = useState<{
    question: string;
    answer: string;
    interviewId: string;
  }>({ question: "", answer: "", interviewId: interviewId });
  const [editingQuestion, setEditingQuestion] = useState<InterviewQA>();

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

  const openEditModal = (question: InterviewQA) => {
    setEditingQuestion(question);
    setOpen2(true);
  };

  const handleEditQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        question: editingQuestion?.question || "",
        answer: editingQuestion?.answer || "",
        interviewQAId: editingQuestion?.interviewQAId || "",
      };

      const { question } = await updateQuestionAction(payload);
      console.log("Question updated", question?.interviewQAId);

      setQuestions((prev) =>
        prev.map((q) =>
          q.interviewQAId === question?.interviewQAId ? question : q
        )
      );
      setEditingQuestion(undefined);
      setOpen2(false);
    } catch (error) {
      console.error(error);
      alert("Failed to update question");
    }
  };

  const handleDeleteQuestion = async (interviewQAId: string) => {
    try {
      const { question } = await deleteQuestionAction(interviewQAId);
      console.log("Question deleted", question?.interviewQAId);
      setQuestions((prev) =>
        prev.filter((q) => q.interviewQAId !== question?.interviewQAId)
      );
    } catch (error) {
      console.error(error);
      alert("Failed to delete question");
    }
  };

  const handlePageForward = () => {
    if (questions.length < 5) {
      alert("Please add at least 5 questions to proceed");
      return;
    }

    router.push(`applicants`);
    console.log("Navigating to the next page");
  };

  const generateQuestions = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/question-creation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: job.title,
          description: job.description,
          experience: job.experience.toString(),
          interviewTitle: interviewTitle,
        }),
      });

      if (!response.ok) {
        console.error("Failed to generate questions");
        return;
      }

      const jsonRes: AIQuestion[] = await response.json();
      console.log("Questions generated", jsonRes);

      for (const q of jsonRes) {
        try {
          const questionCont = await addQuestionAction({
            question: q.question,
            answer: q.answer,
            interviewId: interviewId,
          });
          if (questionCont?.question) {
            setQuestions((prev) => [...prev, questionCont.question]);
          }
        } catch (error) {
          console.error(error);
        }
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Failed to generate questions");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add New Question</SheetTitle>
              <SheetDescription>
                The applicant will need to answer this question during the
                interview
              </SheetDescription>

              <form onSubmit={handleAddQuestion} className="space-y-4 mt-4">
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
                    className="focus-visible:ring-indigo-500"
                  />
                </div>
                <div>
                  <Label htmlFor="answer">Sample or Expected Answer</Label>
                  <Input
                    id="answer"
                    defaultValue={addQuestion?.answer || ""}
                    onChange={(e) =>
                      setAddQuestion({
                        ...addQuestion,
                        answer: e.target.value,
                      })
                    }
                    className="focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <SheetClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </SheetClose>
                  <Button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Add Question
                  </Button>
                </div>
              </form>
            </SheetHeader>
          </SheetContent>
        </Sheet>

        <Button
          variant={"outline"}
          onClick={generateQuestions}
          disabled={isGenerating}
          className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating with AI...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate with AI
            </>
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">No questions available</p>
            <p className="text-sm text-gray-400 mt-1">
              Add questions manually or generate them with AI
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {questions.map((question, index) => (
              <Card
                key={question.interviewQAId}
                className="border-gray-200 hover:border-indigo-200 transition-all"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-2">
                    <Badge
                      variant="outline"
                      className="mt-1 bg-indigo-50 text-indigo-700 border-indigo-200"
                    >
                      Q{index + 1}
                    </Badge>
                    <div className="space-y-3 w-full">
                      <h4 className="font-medium text-gray-800">
                        {question.question}
                      </h4>
                      {question.answer && (
                        <div className="pl-4 border-l-2 border-green-200 text-gray-600 text-sm">
                          <p className="text-xs font-medium text-green-600 mb-1">
                            Sample Answer:
                          </p>
                          {question.answer}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 py-3 px-5 flex justify-end gap-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(question)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDeleteQuestion(question.interviewQAId)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Sheet open={open2} onOpenChange={setOpen2}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Question</SheetTitle>
            <SheetDescription>
              Update the interview question and sample answer
            </SheetDescription>

            <form onSubmit={handleEditQuestion} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  defaultValue={editingQuestion?.question || ""}
                  onChange={(e) =>
                    setEditingQuestion((prev) =>
                      prev
                        ? {
                            ...prev,
                            question: e.target.value,
                          }
                        : undefined
                    )
                  }
                  required
                  className="focus-visible:ring-indigo-500"
                />
              </div>
              <div>
                <Label htmlFor="answer">Sample or Expected Answer</Label>
                <Input
                  id="answer"
                  defaultValue={editingQuestion?.answer || ""}
                  onChange={(e) =>
                    setEditingQuestion((prev) =>
                      prev
                        ? {
                            ...prev,
                            answer: e.target.value,
                          }
                        : undefined
                    )
                  }
                  className="focus-visible:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <SheetClose asChild>
                  <Button variant="outline">Cancel</Button>
                </SheetClose>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Update Question
                </Button>
              </div>
            </form>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <div className="mt-8 flex justify-end">
        <Button onClick={handlePageForward} className=" gap-2" size="lg">
          Proceed to Candidate Selection
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Questions;
