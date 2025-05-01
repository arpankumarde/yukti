"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createJob } from "@/actions/recruiter";
import { getCookie } from "cookies-next";
import { Card, CardHeader } from "@/components/ui/card";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Coins,
  Gift,
  Building2,
  Users,
  CalendarRange,
  Tags,
  Info,
} from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobStatus } from "@/generated/prisma";

const NewJobPostingPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [perks, setPerks] = useState("");
  const [vacancy, setVacancy] = useState<number>(1);
  const [skills, setSkills] = useState<string>("");
  const [jobType, setJobType] = useState("Full Time");
  const [status, setStatus] = useState<JobStatus>("ACTIVE");
  const [applyBy, setApplyBy] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const recruiterCookie = getCookie("ykrectoken");
      const recruiter = recruiterCookie
        ? JSON.parse(recruiterCookie as string)
        : null;

      if (!recruiter) {
        toast.error("You must be logged in to create a job posting");
        return;
      }

      // Convert skills string to array
      const skillsArray = skills
        ? skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean)
        : [];

      const payload = {
        title,
        description,
        experience,
        location,
        salary,
        perks,
        companyId: recruiter.companyId,
        vacancy: Number(vacancy),
        skills: skillsArray,
        status: status as any,
        jobType,
        applyBy: applyBy ? new Date(applyBy) : undefined,
      };

      const { job, error } = await createJob(payload);

      if (error) {
        console.error("err: ", error);
        toast.error("Failed to create job posting");
      } else {
        toast.success("Job posting created successfully");
        router.push(`/recruiter/dashboard/postings/${job?.id}`);
      }
    } catch (error) {
      console.error("Error creating job posting:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 md:p-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/recruiter/dashboard/postings">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Post a New Job</h1>
        </div>
        <Briefcase className="h-6 w-6 text-muted-foreground" />
      </div>

      <Card className="bg-background shadow-xl border-muted">
        <CardHeader className="border-b bg-muted/10 p-6">
          <h2 className="text-xl font-semibold tracking-tight">Job Details</h2>
          <p className="text-sm text-muted-foreground">
            Fill in the information below to create your job posting
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
                  placeholder="e.g. Senior Software Engineer"
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
                    placeholder="e.g. Remote, New York, NY (Hybrid)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="experience"
                    className="text-sm font-medium inline-flex items-center gap-2"
                  >
                    Experience <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="text"
                    required
                    placeholder="e.g. Fresher, 2-3 years"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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
                    placeholder="e.g. $80,000 - $120,000/year"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="vacancy"
                    className="text-sm font-medium inline-flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Number of Vacancies{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="vacancy"
                    name="vacancy"
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 5"
                    value={vacancy}
                    onChange={(e) => setVacancy(parseInt(e.target.value) || 1)}
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="jobType"
                    className="text-sm font-medium inline-flex items-center gap-2"
                  >
                    <Info className="h-4 w-4" />
                    Job Type
                  </Label>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full Time">Full Time</SelectItem>
                      <SelectItem value="Part Time">Part Time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="status"
                    className="text-sm font-medium inline-flex items-center gap-2"
                  >
                    <Info className="h-4 w-4" />
                    Status
                  </Label>
                  <Select
                    value={status}
                    onValueChange={(value) => setStatus(value as JobStatus)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="applyBy"
                    className="text-sm font-medium inline-flex items-center gap-2"
                  >
                    <CalendarRange className="h-4 w-4" />
                    Apply By
                  </Label>
                  <Input
                    id="applyBy"
                    name="applyBy"
                    type="date"
                    value={applyBy}
                    onChange={(e) => setApplyBy(e.target.value)}
                    className="w-48 transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="skills"
                  className="text-sm font-medium inline-flex items-center gap-2"
                >
                  <Tags className="h-4 w-4" />
                  Skills (comma separated)
                </Label>
                <Input
                  id="skills"
                  name="skills"
                  type="text"
                  placeholder="e.g. React, TypeScript, Node.js"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground">
                  Enter skills separated by commas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Job Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  placeholder="Describe the role, responsibilities, and requirements..."
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
                <Label
                  htmlFor="perks"
                  className="text-sm font-medium inline-flex items-center gap-2"
                >
                  <Gift className="h-4 w-4" />
                  Perks & Benefits
                </Label>
                <Textarea
                  id="perks"
                  name="perks"
                  placeholder="List the perks and benefits (e.g. health insurance, PTO, remote work options)..."
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
                  "Create Job Posting"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewJobPostingPage;
