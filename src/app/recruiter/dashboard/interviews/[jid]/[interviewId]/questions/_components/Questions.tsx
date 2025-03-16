"use client";

import { InterviewQA, Job } from "@prisma/client";
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
import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import {
  addQuestionAction,
  deleteQuestionAction,
  updateQuestionAction,
} from "./questionActions";
import { useRouter } from "next/navigation";

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
  let [questions, setQuestions] = useState<InterviewQA[]>(questionProps);
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
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
      alert("Please add atleast 5 questions to proceed");
      return;
    }

    router.push(`applicants`);

    console.log("Navigating to the next page");
  };

  const generateQuestions = async () => {
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

    jsonRes.forEach(async (q) => {
      try {
        const questionCont = await addQuestionAction({
          question: q.question,
          answer: q.answer,
          interviewId: interviewId,
        });
        if (questionCont?.question) {
          setQuestions((prev) => [...prev, questionCont.question]);
        }
        console.log("Question added", questionCont?.question?.interviewQAId);
      } catch (error) {
        console.error(error);
        alert("Failed to add question");
      }
    });
  };

  return (
    <div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button>
            <Plus />
            <span>Add QnA</span>
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {editingQuestion ? "Edit Question" : "Add Question"}
            </SheetTitle>
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
                  defaultValue={addQuestion?.answer || ""}
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

      <Sheet open={open2} onOpenChange={setOpen2}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {editingQuestion ? "Edit Question" : "Add Question"}
            </SheetTitle>
            <SheetDescription>
              The Applicant would have to answer this question
            </SheetDescription>

            <form onSubmit={handleEditQuestion} className="space-y-4">
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
                />
              </div>
              <div className="flex justify-end gap-2">
                <SheetClose asChild>
                  <Button variant="outline">
                    <span>Cancel</span>
                  </Button>
                </SheetClose>
                <Button type="submit">Update Question</Button>
              </div>
            </form>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <Button variant={"outline"} onClick={generateQuestions}>
        Generate Questions
      </Button>

      {questions.length === 0 ? (
        <p>No questions available.</p>
      ) : (
        questions.map((question) => (
          <div key={question.interviewQAId}>
            <p>{question.question}</p>
            <p>{question.answer || "Sample answer not provided"}</p>

            <Button onClick={() => openEditModal(question)}>
              <Pencil />
              Edit QnA
            </Button>

            <Button
              variant={"destructive"}
              onClick={() => handleDeleteQuestion(question.interviewQAId)}
            >
              Delete
            </Button>
          </div>
        ))
      )}

      <Button variant={"secondary"} onClick={handlePageForward}>
        Proceed to Candidate Selection
      </Button>
    </div>
  );
};

export default Questions;
