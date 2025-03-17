import { cookies } from 'next/headers';
import { Briefcase, Calendar, FileText, MessageSquare, Star, User2 } from "lucide-react";
import { cn } from "@/lib/utils";
import prisma from '@/lib/prisma';
import ExportXLSXButton from './_components/ExportXLSXButton';
import ExportCSVButton from './_components/ExportCSVButton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface AuthCookie {
  applicantId: string;
}

export default async function AppliedJobsPage() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('ykapptoken');
  
  if (!authCookie) {
    throw new Error('Authentication required');
  }

  const userData = JSON.parse(authCookie.value) as AuthCookie;
  const applicantId = userData.applicantId;

  const applications = await prisma.application.findMany({
    where: { applicantId },
    select: {
      applicationId: true,
      score: true,
      resume: true,
      cover_letter: true,
      comments: true,
      createdAt: true,
      status: true,
      job: true,
    }
  });

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <User2 className="w-7 h-7 text-primary" />
              My Applied Jobs
            </h1>
            <p className="text-muted-foreground mt-1">
              Track the status of your job applications and stay updated on your career journey
            </p>
          </div>
          
          {/* Export Buttons */}
          <div className="flex gap-3 self-start md:self-auto">
            <ExportXLSXButton applications={applications} />
            <ExportCSVButton applications={applications} />
          </div>
        </div>

        <Separator className="my-6" />

        {/* Applications Grid */}
        <div className="grid gap-6">
          {applications.map((app) => (
            <Card 
              key={app.applicationId}
              className="overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <CardTitle className="text-xl">{app.job.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                    </CardDescription>
                  </div>
                  
                  <Badge 
                    variant={
                      app.status === 'ACCEPTED' ? "success" : 
                      app.status === 'REJECTED' ? "destructive" : 
                      "outline"
                    }
                    className={cn(
                      "px-3 py-1 whitespace-nowrap",
                      app.status === 'PENDING' && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
                      !app.status && "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    )}
                  >
                    {app.status || 'PENDING'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <Separator className="my-4" />
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-foreground">Resume</h4>
                      {app.resume ? (
                        <a 
                          href={app.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          View Resume
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not provided</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-foreground">Comments</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{app.comments || 'No comments yet'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-foreground">Cover Letter</h4>
                      {app.cover_letter ? (
                        <a 
                          href={app.cover_letter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          View Cover Letter
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not provided</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {applications.length === 0 && (
          <Card className="py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No applications yet</h3>
              <p className="text-muted-foreground max-w-md">
                Start applying to jobs to track your applications here
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}