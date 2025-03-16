"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createInterview } from "@/actions/recruiter";
import { InterviewType } from "@prisma/client";
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
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  CalendarIcon,
  CheckCircle2,
  Clock,
  Code,
  MapPin,
  MessageSquare,
  Video,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formEntries = Object.fromEntries(formData.entries());

    const data: Payload = {
      title: formEntries.title as string,
      type: interviewType,
      conductWithAI: formEntries.conductWithAI === "on",
      conductOffline: formEntries.conductOffline === "on",
      scheduledAt: formEntries.scheduledAt
        ? new Date(formEntries.scheduledAt as string)
        : new Date(),
      completeBy: formEntries.completeBy
        ? new Date(formEntries.completeBy as string)
        : undefined,
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
    }
  };

  return (
    <div className="container mx-auto max-w-3xl py-10">
      <Card className="border shadow-lg">
        <CardHeader className="space-y-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Create New Interview
          </CardTitle>
          <CardDescription className="text-gray-600">
            Configure your interview settings and invite candidates
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 pt-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2 text-indigo-700">
                <MessageSquare className="h-5 w-5" />
                Basic Information
              </h3>
              <Separator className="bg-indigo-100" />

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-700">
                    Interview Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g. Frontend Developer Interview"
                    required
                    className="w-full focus-visible:ring-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-gray-700">
                    Interview Type
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
                      className="w-full focus-visible:ring-indigo-500"
                    >
                      <SelectValue placeholder="Select interview type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NOCODE">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-indigo-500" />
                          <span>Non Coding Round</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="CODE">
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4 text-indigo-500" />
                          <span>Coding Round</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Interview Mode Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2 text-indigo-700">
                <Video className="h-5 w-5" />
                Interview Mode
              </h3>
              <Separator className="bg-indigo-100" />

              <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="conductWithAI"
                    name="conductWithAI"
                    checked={conductWithAI}
                    onCheckedChange={(checked) =>
                      setConductWithAI(checked === true)
                    }
                    className="border-indigo-300 text-indigo-600 focus-visible:ring-indigo-500"
                  />
                  <Label
                    htmlFor="conductWithAI"
                    className="font-medium cursor-pointer text-gray-800"
                  >
                    Conduct with AI{" "}
                    <span className="text-sm text-indigo-600">
                      (Automated interview process)
                    </span>
                  </Label>
                </div>

                {!conductWithAI && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="conductOffline"
                      name="conductOffline"
                      checked={conductOffline}
                      onCheckedChange={(checked) =>
                        setConductOffline(checked === true)
                      }
                      className="border-indigo-300 text-indigo-600 focus-visible:ring-indigo-500"
                    />
                    <Label
                      htmlFor="conductOffline"
                      className="font-medium cursor-pointer text-gray-800"
                    >
                      Conduct Offline{" "}
                      <span className="text-sm text-indigo-600">
                        (In-person interview)
                      </span>
                    </Label>
                  </div>
                )}
              </div>
            </div>

            {/* Scheduling Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2 text-indigo-700">
                <CalendarIcon className="h-5 w-5" />
                Scheduling Details
              </h3>
              <Separator className="bg-indigo-100" />

              <div className="grid gap-6 md:grid-cols-2">
                {!conductWithAI && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="scheduledAt"
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <Clock className="h-4 w-4 text-indigo-500" />
                      Interview Date & Time
                    </Label>
                    <Input
                      type="datetime-local"
                      id="scheduledAt"
                      name="scheduledAt"
                      className="w-full focus-visible:ring-indigo-500"
                      required={!conductWithAI}
                    />
                  </div>
                )}

                {conductWithAI && (
                  <div className="space-y-2 col-span-2">
                    <Label
                      htmlFor="completeBy"
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <Clock className="h-4 w-4 text-indigo-500" />
                      Complete By Date
                    </Label>
                    <Input
                      type="datetime-local"
                      id="completeBy"
                      name="completeBy"
                      className="w-full focus-visible:ring-indigo-500"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    <p className="text-sm text-indigo-600">
                      Candidates must complete the AI interview by this date
                    </p>
                  </div>
                )}

                {!conductWithAI && (
                  <div className="space-y-2 col-span-2">
                    <Label
                      htmlFor="location"
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <MapPin className="h-4 w-4 text-indigo-500" />
                      {conductOffline ? "Physical Location" : "Meeting Link"}
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
                      className="w-full focus-visible:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-gray-50 py-4 rounded-b-lg">
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5"
            >
              Schedule Interview
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Page;
