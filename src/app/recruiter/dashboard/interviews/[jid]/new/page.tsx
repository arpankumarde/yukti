"use client";

import { useState } from "react";
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

  return (
    <div>
      <h1>Create New Interview</h1>
      <form
        action={async (e) => {
          const formData = Object.fromEntries(e.entries());
          const data: Payload = {
            title: formData.title as string,
            type: formData.type as InterviewType,
            conductWithAI: formData.conductWithAI === "on",
            conductOffline: formData.conductOffline === "on",
            scheduledAt: new Date(formData.scheduledAt as string),
            completeBy: formData.completeBy
              ? new Date(formData.completeBy as string)
              : undefined,
            location: formData.location as string,
            jobId: params?.jid,
          };
          console.log(data);

          const { interview } = await createInterview(data);

          if (interview) {
            console.log("Interview created successfully");
            if (data.conductWithAI) {
              router.push(
                `/recruiter/dashboard/interviews/${params.jid}/${interview?.interviewId}/questions`
              );
            } else {
              router.push(
                `/recruiter/dashboard/interviews/${params.jid}/${interview?.interviewId}/applicants`
              );
            }
          } else {
            console.error("Failed to create interview");
          }
        }}
      >
        <div>
          <Label htmlFor="title">Interview Title</Label>
          <Input type="text" id="title" name="title" required />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Select defaultValue="NOCODE" required>
            <SelectTrigger title="type" className="w-[180px]">
              <SelectValue title="type" placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NOCODE">Non Coding Round</SelectItem>
              <SelectItem value="CODE">Coding Round</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="conductWithAI">Conduct with AI</Label>
          <Checkbox
            id="conductWithAI"
            name="conductWithAI"
            checked={conductWithAI}
            onCheckedChange={(checked) =>
              setConductWithAI(checked.valueOf() ? true : false)
            }
          />
        </div>
        {!conductWithAI && (
          <div>
            <Label htmlFor="conductOffline">Conduct Offline</Label>
            <Checkbox
              id="conductOffline"
              name="conductOffline"
              checked={conductOffline}
              onCheckedChange={(checked) =>
                setConductOffline(checked.valueOf() ? true : false)
              }
            />
          </div>
        )}
        {!conductWithAI && (
          <div>
            <Label htmlFor="scheduledAt">Scheduled At</Label>
            <Input type="datetime-local" id="scheduledAt" name="scheduledAt" />
          </div>
        )}
        {conductWithAI && (
          <div>
            <Label htmlFor="completeBy">Complete By</Label>
            <Input type="datetime-local" id="completeBy" name="completeBy" />
          </div>
        )}
        {!conductWithAI && (
          <div>
            <Label htmlFor="location">
              {conductOffline ? "Enter Location" : "Enter Meeting Link"}
            </Label>
            <Input type="text" id="location" name="location" />
          </div>
        )}
        <Button type="submit">Schedule Interview</Button>
      </form>
    </div>
  );
};

export default Page;
