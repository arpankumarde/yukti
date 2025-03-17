import { cookies } from 'next/headers';
import Link from 'next/link';
import { Calendar, Clock, Code, MapPin, MessageSquare, CheckCircle, AlertTriangle } from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatDistanceToNow, isPast, format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AuthCookie {
  applicantId: string;
}

export default async function InterviewsPage() {

  const cookieStore = await cookies();
  const authCookie = cookieStore.get('ykapptoken');
  
  if (!authCookie) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view your interviews</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const userData = JSON.parse(authCookie.value) as AuthCookie;
  const applicantId = userData.applicantId;

  // Fetch all interview sessions for this applicant
  const interviewSessions = await prisma.interviewSession.findMany({
    where: {
      application: {
        applicantId: applicantId,
      }
    },
    include: {
      interview: {
        include: {
          job: true,
        }
      },
      application: true,
    },
    orderBy: {
      createdAt: 'desc',
    }
  });

  // No interviews case
  if (interviewSessions.length === 0) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Interviews</h1>
          <Card>
            <CardContent className="py-8">
              <div className="flex flex-col items-center justify-center text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Interviews Found</h3>
                <p className="text-muted-foreground">
                  You don't have any interviews scheduled at the moment.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Separate interviews into upcoming and past
  const now = new Date();
  
  const upcomingInterviews = interviewSessions.filter(session => {
    const completeByDate = session.interview.completeBy;
    const scheduledDate = session.interview.scheduledAt;
    const targetDate = completeByDate || scheduledDate;
    
    return targetDate && !isPast(targetDate);
  });
  
  const expiredInterviews = interviewSessions.filter(session => {
    const completeByDate = session.interview.completeBy;
    const scheduledDate = session.interview.scheduledAt;
    const targetDate = completeByDate || scheduledDate;
    
    return !targetDate || isPast(targetDate);
  });

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold">My Interviews</h1>
          <p className="text-muted-foreground">
            You have {interviewSessions.length} interview(s) assigned
          </p>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid grid-cols-2 w-[400px] mb-6">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingInterviews.length})
            </TabsTrigger>
            <TabsTrigger value="expired">
              Past Interviews ({expiredInterviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <div className="grid grid-cols-1 gap-6">
              {upcomingInterviews.length > 0 ? (
                upcomingInterviews.map((session) => (
                  <InterviewCard 
                    key={session.interviewSessionId} 
                    session={session} 
                    isExpired={false} 
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="py-8">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-medium mb-2">No Upcoming Interviews</h3>
                      <p className="text-muted-foreground">
                        You don't have any upcoming interviews scheduled at the moment.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="expired">
            <div className="grid grid-cols-1 gap-6">
              {expiredInterviews.length > 0 ? (
                expiredInterviews.map((session) => (
                  <InterviewCard 
                    key={session.interviewSessionId} 
                    session={session} 
                    isExpired={true} 
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="py-8">
                    <div className="flex flex-col items-center justify-center text-center">
                      <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-medium mb-2">No Past Interviews</h3>
                      <p className="text-muted-foreground">
                        You don't have any past interviews in your history.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function InterviewCard({ session, isExpired }) {
  const interview = session.interview;
  const job = interview.job;
  
  // Determine date to display (complete by or scheduled at)
  const dateToDisplay = interview.conductWithAI 
    ? interview.completeBy 
    : interview.scheduledAt;

  return (
    <Card className="overflow-hidden border">
      <CardHeader className="bg-muted/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-xl">{interview.title}</CardTitle>
            <CardDescription className="mt-1.5">
              <span className="font-medium text-foreground">{job.title}</span>
              <span className="mx-2">•</span>
              <span>{job.location}</span>
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={interview.type === "CODE" ? "secondary" : "default"}>
              {interview.type === "CODE" ? (
                <><Code className="mr-1 h-3 w-3" /> Coding</>
              ) : (
                <><MessageSquare className="mr-1 h-3 w-3" /> Non-Coding</>
              )}
            </Badge>
            
            <Badge variant={interview.conductWithAI ? "outline" : "destructive"} className={interview.conductWithAI ? "bg-blue-50 text-blue-700" : ""}>
              {interview.conductWithAI ? "AI Interview" : "Manual Interview"}
            </Badge>
            
            {session.attempted && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <CheckCircle className="mr-1 h-3 w-3" /> Attempted
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Date information */}
          {dateToDisplay && (
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">
                {interview.conductWithAI ? "Complete by: " : "Scheduled for: "}
                <span className="font-medium text-foreground">
                  {format(new Date(dateToDisplay), "PPP")}
                </span>
                {!isExpired && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({formatDistanceToNow(new Date(dateToDisplay), { addSuffix: true })})
                  </span>
                )}
              </span>
            </div>
          )}
          
          {/* Location for offline interviews */}
          {interview.conductOffline && interview.location && (
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">
                Location: <span className="font-medium text-foreground">{interview.location}</span>
              </span>
            </div>
          )}
          
          {isExpired && !session.attempted && (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 inline-block mr-2" />
              This interview has expired and was not attempted
            </div>
          )}
        </div>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="bg-muted/5 p-4">
        <div className="w-full flex justify-end">
          {/* Different button states based on interview type */}
          {!interview.conductOffline && !isExpired && !session.attempted && (
            <Button asChild>
              <Link href={
                interview.conductWithAI 
                  ? `/applicant/dashboard/interview/${session.interviewSessionId}`
                  : interview.location || "#"
              }>
                Start Interview
              </Link>
            </Button>
          )}
          
          {session.attempted && (
            <Button variant="secondary" asChild>
              <Link href={`/applicant/dashboard/interview/${session.interviewSessionId}/feedback`}>
                View Feedback
              </Link>
            </Button>
          )}
          
          {interview.conductOffline && !session.attempted && !isExpired && (
            <Button variant="outline" disabled>
              In-person Interview
            </Button>
          )}
          
          {isExpired && !session.attempted && (
            <Button variant="outline" disabled>
              Interview Expired
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}