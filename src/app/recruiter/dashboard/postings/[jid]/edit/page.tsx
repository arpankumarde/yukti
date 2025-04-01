"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateJob, getJob } from "@/actions/recruiter";
import Link from "next/link";
import { ArrowLeft, Building2, MapPin, Coins, Briefcase } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const EditJobPostingPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [perks, setPerks] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const params = useParams<{ jid: string }>();

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
          setLocation(job.location);
          setSalary(job.salary || "");
          setPerks(job.perks || "");
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to load job details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [params.jid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        id: params.jid,
        title,
        description,
        experience,
        location,
        salary,
        perks,
      };

      const { job, error } = await updateJob(payload);

      if (error) {
        toast.error("Failed to update job posting");
      } else {
        toast.success("Job posting updated successfully");
        router.push(`/recruiter/dashboard/postings/${job?.id}`);
      }
    } catch (error) {
      console.error("Error updating job posting: ", error);
      toast.error("Something went wrong");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/recruiter/dashboard/postings/${params.jid}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Edit Job Posting</h1>
        </div>
        <Briefcase className="h-6 w-6 text-muted-foreground" />
      </div>

      <Card className="bg-background shadow-xl border-muted">
        <CardHeader className="border-b bg-muted/10 p-6">
          <h2 className="text-xl font-semibold tracking-tight">Job Details</h2>
          <p className="text-sm text-muted-foreground">
            Update the information below to modify your job posting
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div className="grid gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-medium inline-flex items-center gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  Job Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="location"
                    className="text-sm font-medium inline-flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    Location <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-sm font-medium">
                    Experience <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="text"
                    required
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="salary"
                  className="text-sm font-medium inline-flex items-center gap-2"
                >
                  <Coins className="h-4 w-4" />
                  Salary Range
                </Label>
                <Input
                  id="salary"
                  name="salary"
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Job Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[200px] resize-y transition-all focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Include key responsibilities, required skills, and
                  qualifications
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="perks" className="text-sm font-medium">
                  Perks & Benefits
                </Label>
                <Textarea
                  id="perks"
                  name="perks"
                  value={perks}
                  onChange={(e) => setPerks(e.target.value)}
                  className="min-h-[150px] resize-y transition-all focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Be specific about the benefits to attract the best
                  candidates
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Updating...
                  </div>
                ) : (
                  "Update Job Posting"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditJobPostingPage;
