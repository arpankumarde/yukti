"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createJob } from "@/actions/recruiter";
import { getCookie } from "cookies-next";

const NewJobPostingPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [experience, setExperience] = useState("Fresher");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const recruiterCookie = getCookie("ykrecauth");
    const recruiter = recruiterCookie
      ? JSON.parse(recruiterCookie as string)
      : null;

    if (!recruiter) {
      toast.error("You must be logged in to create a job posting");
      return;
    }

    const payload = {
      title,
      description,
      experience,
      recruiterId: recruiter.recruiterId,
    };

    const { job, error } = await createJob(payload);

    if (error) {
      console.error("err: ", error);
      toast.error("Failed to create job posting");
    } else {
      toast.success("Job posting created successfully");
      router.push("/recruiter/dashboard/postings");
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden">
            <CardContent className="grid p-0 md:grid-cols-2">
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">Add New Job Posting</h1>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1 block w-full"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 block w-full"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="experience">Experience</Label>
                    <Input
                      id="experience"
                      name="experience"
                      type="text"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="mt-1 block w-full"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Add Job Posting
                  </Button>
                </div>
              </form>
              <div className="relative hidden bg-primary md:block">
                {/* <Image
                  src="/logo.jpg"
                  alt="Image"
                  className="absolute inset-0 w-full my-auto object-cover dark:brightness-[0.2] dark:grayscale"
                  width={600}
                  height={800}
                /> */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewJobPostingPage;
