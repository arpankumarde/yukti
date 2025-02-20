import { cookies } from 'next/headers';
import { Briefcase, Calendar, FileText, MessageSquare, Star, User2 } from "lucide-react";
import { cn } from "@/lib/utils";
import prisma from '@/lib/prisma';

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
    <div className="min-h-screen bg-secondary/20 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            <User2 className="w-8 h-8 text-primary" />
            My Applied Jobs
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track the status of your job applications and stay updated on your career journey
          </p>
        </div>

        {/* Applications Grid */}
        <div className="grid gap-6">
          {applications.map((app) => (
            <div
              key={app.applicationId}
              className={cn(
                "bg-background rounded-xl shadow-sm hover:shadow-md",
                "transition-all duration-200 overflow-hidden",
                "border border-border"
              )}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {app.job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium",
                      {
                        'bg-warning/20 text-warning': app.status === 'PENDING',
                        'bg-success/20 text-success': app.status === 'ACCEPTED',
                        'bg-destructive/20 text-destructive': app.status === 'REJECTED',
                        'bg-muted text-muted-foreground': !app.status
                      }
                    )}>
                      {app.status || 'PENDING'}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="flex items-start gap-2">
                    <FileText className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Resume</h4>
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

                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Comments</h4>
                      <p className="text-sm text-muted-foreground">{app.comments || 'No comments yet'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Star className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Cover Letter</h4>
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
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {applications.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No applications yet</h3>
            <p className="text-muted-foreground">Start applying to jobs to track your applications here</p>
          </div>
        )}
      </div>
    </div>
  );
}