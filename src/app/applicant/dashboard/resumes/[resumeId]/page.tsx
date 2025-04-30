import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { cookies } from "next/headers";
import { getCookie } from "cookies-next";
import { Applicant } from "@/generated/prisma";

const Page = async ({ params }: { params: Promise<{ resumeId: string }> }) => {
  const { resumeId } = await params;
  const userCookie = await getCookie("ykapptoken", { cookies });
  const user = userCookie ? (JSON.parse(userCookie) as Applicant) : undefined;

  if (!user) {
    redirect("/applicant/login");
  }

  const resume = await prisma.resume.findUnique({
    where: {
      resumeId,
      applicantId: user.applicantId,
    },
  });

  if (!resume) {
    notFound();
  }

  return (
    <div className="space-y-6 p-6 md:p-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/applicant/dashboard/resumes">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">{resume.title}</h1>
          {resume.isDefault && (
            <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Default
            </span>
          )}
        </div>
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>

      <Card className="bg-background shadow-xl border-muted">
        <CardHeader className="border-b bg-muted/10 p-6">
          <CardTitle>Resume Details</CardTitle>
          <CardDescription className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Last updated: {new Date(resume.updatedAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {/* Summary Section */}
          {resume.summary && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Summary</h2>
              <p className="text-muted-foreground">{resume.summary}</p>
              <Separator />
            </div>
          )}

          {/* Skills Section */}
          {resume.skills.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {resume.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-muted px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <Separator />
            </div>
          )}

          {/* Experience Section */}
          {resume.experience.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Experience
              </h2>
              <div className="space-y-6">
                {resume.experience.map((exp: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <h3 className="text-lg font-medium">{exp.title}</h3>
                    <p className="text-primary">{exp.company}</p>
                    <p className="text-sm text-muted-foreground">
                      {exp.startDate} - {exp.endDate || "Present"}
                    </p>
                    <p className="text-muted-foreground">{exp.description}</p>
                  </div>
                ))}
              </div>
              <Separator />
            </div>
          )}

          {/* Education Section */}
          {resume.education.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education
              </h2>
              <div className="space-y-6">
                {resume.education.map((edu: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <h3 className="text-lg font-medium">{edu.degree}</h3>
                    <p className="text-primary">{edu.institution}</p>
                    <p className="text-sm text-muted-foreground">
                      {edu.startDate} - {edu.endDate || "Present"}
                    </p>
                    {edu.description && (
                      <p className="text-muted-foreground">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
              <Separator />
            </div>
          )}

          {/* Certifications Section */}
          {resume.certifications.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certifications
              </h2>
              <div className="space-y-6">
                {resume.certifications.map((cert: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <h3 className="text-lg font-medium">{cert.name}</h3>
                    <p className="text-primary">{cert.issuer}</p>
                    <p className="text-sm text-muted-foreground">
                      Issued: {cert.issueDate}{" "}
                      {cert.expiryDate && `- Expires: ${cert.expiryDate}`}
                    </p>
                    {cert.description && (
                      <p className="text-muted-foreground">
                        {cert.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <Separator />
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" asChild>
              <Link href={`/applicant/dashboard/resumes/${resumeId}/edit`}>
                Edit Resume
              </Link>
            </Button>
            <Button asChild>
              <Link href="/applicant/dashboard/resumes">Back to Resumes</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
