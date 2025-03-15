"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateJob, getJob } from "@/actions/recruiter";
import NextLink from "next/link";

const EditJobPostingPage = ({ params }: { params: { jid: string } }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [experience, setExperience] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { job, error } = await getJob(params.jid);
        if (error) {
          toast.error("Failed to load job details");
          return;
        }
        if (job) {
          setTitle(job.title);
          setDescription(job.description || "");
          setExperience(job.experience);
        }
      } catch (error) {
        toast.error("Failed to load job details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [params.jid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      id: params.jid,
      title,
      description,
      experience,
    };

    const { job, error } = await updateJob(payload);

    if (error) {
      console.error("err: ", error);
      toast.error("Failed to update job posting");
    } else {
      toast.success("Job posting updated successfully");
      router.push("/recruiter/dashboard/postings");
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden">
            <CardContent className="flex flex-col gap-6">
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">Edit Job Posting</h1>
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
                  <NextLink href="/recruiter/dashboard/postings">
                    <Button type="submit" className="w-full">
                      Update Job Posting
                    </Button>
                  </NextLink>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditJobPostingPage;
