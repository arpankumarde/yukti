import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Calendar } from "lucide-react";
import { cookies } from "next/headers";
import { getCookie } from "cookies-next";
import { Applicant } from "@/generated/prisma";

const Page = async () => {
  const userCookie = await getCookie("ykapptoken", { cookies });
  const user = userCookie ? (JSON.parse(userCookie) as Applicant) : undefined;

  if (!user) {
    redirect("/applicant/login");
  }

  const resumes = await prisma.resume.findMany({
    where: { applicantId: user.applicantId },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6 p-6 md:p-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">My Resumes</h1>
        </div>
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resumes.map((resume) => (
          <Card
            key={resume.resumeId}
            className="bg-background shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{resume.title}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(resume.updatedAt).toLocaleDateString()}
                {resume.isDefault && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {resume.summary || "No summary available"}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {resume.skills.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="text-xs bg-muted px-2 py-0.5 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {resume.skills.length > 3 && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                    +{resume.skills.length - 3} more
                  </span>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/applicant/dashboard/resumes/${resume.resumeId}`}>
                  View Resume
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}

        <Card className="bg-muted/30 border-dashed border-2 flex flex-col items-center justify-center p-6 h-full">
          <Plus className="h-8 w-8 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium mb-1">Create New Resume</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Add a new resume to your profile
          </p>
          <Button asChild>
            <Link href="/applicant/dashboard/resumes/create">
              Create Resume
            </Link>
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Page;
