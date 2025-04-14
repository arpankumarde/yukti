"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createInterview } from "@/actions/recruiter";
import { InterviewType } from "@/generated/prisma";
import { useParams, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  CalendarIcon,
  Clock,
  Code,
  MapPin,
  MessageSquare,
  Video,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Link from "next/link";

interface Payload {
  title: string;
  type: InterviewType;
  conductWithAI: boolean;
  conductOffline: boolean;
  scheduledAt: Date;
  completeBy?: Date;
  location?: string;
  jobId: string;
}

const Page = () => {
  const router = useRouter();
  const params = useParams<{ jid: string }>();
  const [conductWithAI, setConductWithAI] = useState(true);
  const [conductOffline, setConductOffline] = useState(false);
  const [interviewType, setInterviewType] = useState<InterviewType>("NOCODE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate minimum date for dates (next day)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const minDate = tomorrow.toISOString().slice(0, 16);

  // Effect to handle interview type change
  useEffect(() => {
    // If coding round is selected, AI interviews aren't available
    if (interviewType === "CODE") {
      setConductWithAI(false);
    }
  }, [interviewType]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const formEntries = Object.fromEntries(formData.entries());

    // Get the date values
    const scheduledAtValue = formEntries.scheduledAt as string | undefined;
    const completeByValue = formEntries.completeBy as string | undefined;

    // Check if scheduledAt is in the future for non-AI interviews
    if (!conductWithAI && scheduledAtValue) {
      const scheduledDate = new Date(scheduledAtValue);
      if (scheduledDate <= new Date()) {
        toast.error("Interview date must be in the future");
        setIsSubmitting(false);
        return;
      }
    }

    const data: Payload = {
      title: formEntries.title as string,
      type: interviewType,
      conductWithAI: formEntries.conductWithAI === "on",
      conductOffline: formEntries.conductOffline === "on",
      scheduledAt: scheduledAtValue ? new Date(scheduledAtValue) : new Date(),
      completeBy: completeByValue ? new Date(completeByValue) : undefined,
      location: formEntries.location as string,
      jobId: params?.jid,
    };

    try {
      const { interview, error } = await createInterview(data);

      if (interview) {
        toast.success("Interview created successfully!");

        // Navigate after a brief delay to show the notification
        setTimeout(() => {
          if (data.conductWithAI) {
            router.push(
              `/recruiter/dashboard/interviews/${params.jid}/${interview?.interviewId}/questions`
            );
          } else {
            router.push(
              `/recruiter/dashboard/interviews/${params.jid}/${interview?.interviewId}/applicants`
            );
          }
        }, 1500);
      } else {
        throw new Error(error || "Failed to create interview");
      }
    } catch (error) {
      toast.error("Failed to create interview. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 md:p-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/recruiter/dashboard/postings/${params.jid}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Create New Interview</h1>
        </div>
        <Video className="h-6 w-6 text-muted-foreground" />
      </div>

      <Card className="bg-background shadow-xl border-muted">
        <CardHeader className="border-b bg-muted/10 p-6">
          <CardTitle>Interview Details</CardTitle>
          <CardDescription>
            Configure your interview settings and invite candidates
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div className="grid gap-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-primary">
                Basic Information
              </h3>
              <Separator />

              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-medium inline-flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Interview Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Frontend Developer Interview"
                  required
                  className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="type"
                  className="text-sm font-medium inline-flex items-center gap-2"
                >
                  <Code className="h-4 w-4" />
                  Interview Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  defaultValue="NOCODE"
                  onValueChange={(value) =>
                    setInterviewType(value as InterviewType)
                  }
                >
                  <SelectTrigger
                    id="type"
                    name="type"
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                  >
                    <SelectValue placeholder="Select interview type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOCODE">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>Non Coding Round</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="CODE">
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        <span>Coding Round</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Interview Mode */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-primary">
                Interview Mode
              </h3>
              <Separator />

              <div className="space-y-4 p-4 bg-muted/10 rounded-lg border border-muted">
                {/* Only show "Conduct with AI" option for NOCODE interviews */}
                {interviewType === "NOCODE" && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="conductWithAI"
                      name="conductWithAI"
                      checked={conductWithAI}
                      onCheckedChange={(checked) => {
                        const isChecked = checked === true;
                        setConductWithAI(isChecked);
                        // If AI is selected, automatically uncheck offline
                        if (isChecked) {
                          setConductOffline(false);
                        }
                      }}
                      className="transition-all focus:ring-2 focus:ring-primary/20"
                    />
                    <Label
                      htmlFor="conductWithAI"
                      className="font-medium cursor-pointer"
                    >
                      Conduct with AI{" "}
                      <span className="text-sm text-primary">
                        (Automated interview process)
                      </span>
                    </Label>
                  </div>
                )}

                {!conductWithAI && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="conductOffline"
                      name="conductOffline"
                      checked={conductOffline}
                      onCheckedChange={(checked) => {
                        const isChecked = checked === true;
                        setConductOffline(isChecked);
                        // If offline is selected, automatically uncheck AI
                        if (isChecked) {
                          setConductWithAI(false);
                        }
                      }}
                      className="transition-all focus:ring-2 focus:ring-primary/20"
                    />
                    <Label
                      htmlFor="conductOffline"
                      className="font-medium cursor-pointer"
                    >
                      Conduct Offline{" "}
                      <span className="text-sm text-primary">
                        (In-person interview)
                      </span>
                    </Label>
                  </div>
                )}
              </div>
            </div>

            {/* Scheduling Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-primary">
                Scheduling Details
              </h3>
              <Separator />

              <div className="grid gap-6 md:grid-cols-2">
                {!conductWithAI && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="scheduledAt"
                      className="text-sm font-medium inline-flex items-center gap-2"
                    >
                      <Clock className="h-4 w-4" />
                      Interview Date & Time{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="datetime-local"
                      id="scheduledAt"
                      name="scheduledAt"
                      className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                      required={!conductWithAI}
                      min={minDate}
                    />
                    <p className="text-xs text-muted-foreground">
                      Interview must be scheduled for a future date
                    </p>
                  </div>
                )}

                {conductWithAI && (
                  <div className="space-y-2 col-span-2">
                    <Label
                      htmlFor="completeBy"
                      className="text-sm font-medium inline-flex items-center gap-2"
                    >
                      <CalendarIcon className="h-4 w-4" />
                      Complete By Date
                    </Label>
                    <Input
                      type="datetime-local"
                      id="completeBy"
                      name="completeBy"
                      className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                      min={minDate}
                    />
                    <p className="text-xs text-muted-foreground">
                      Candidates must complete the AI interview by this date
                      (must be at least tomorrow)
                    </p>
                  </div>
                )}

                {!conductWithAI && (
                  <div className="space-y-2 col-span-2">
                    <Label
                      htmlFor="location"
                      className="text-sm font-medium inline-flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      {conductOffline
                        ? "Physical Location"
                        : "Meeting Link"}{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="location"
                      name="location"
                      placeholder={
                        conductOffline
                          ? "e.g. Office Meeting Room 3"
                          : "e.g. https://meet.google.com/..."
                      }
                      className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                      required={!conductWithAI}
                    />
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-[50%]"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                className="w-[50%] bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating...
                  </div>
                ) : (
                  "Schedule Interview"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Page;
