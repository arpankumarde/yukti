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
        <Card className="max-w-md mx-auto border shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Authentication Required</CardTitle>
            <CardDescription>Please log in to view your interviews</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center pb-6">
            <Button asChild className="shadow-sm">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </CardFooter>
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
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">My Interviews</h1>
          <Card className="border shadow-sm overflow-hidden">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <AlertTriangle className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-medium mb-3">No Interviews Found</h3>
                <p className="text-muted-foreground max-w-md">
                  You don't have any interviews scheduled at the moment. Check back later or contact your recruiter.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Separate interviews into upcoming, past, and attempted
  const now = new Date();
  
  // Get attempted interviews separately
  const attemptedInterviews = interviewSessions.filter(session => 
    session.attempted
  );
  
  // Upcoming interviews that haven't been attempted
  const upcomingInterviews = interviewSessions.filter(session => {
    const completeByDate = session.interview.completeBy;
    const scheduledDate = session.interview.scheduledAt;
    const targetDate = completeByDate || scheduledDate;
    
    return targetDate && !isPast(targetDate) && !session.attempted;
  });
  
  // Expired interviews that haven't been attempted
  const expiredInterviews = interviewSessions.filter(session => {
    const completeByDate = session.interview.completeBy;
    const scheduledDate = session.interview.scheduledAt;
    const targetDate = completeByDate || scheduledDate;
    
    return (!targetDate || isPast(targetDate)) && !session.attempted;
  });

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              My Interviews
            </h1>
            <p className="text-muted-foreground mt-1">
              You have {interviewSessions.length} interview(s) assigned
            </p>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            <span className="text-muted-foreground">Last updated: {format(new Date(), "PPP")}</span>
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <div className="border-b mb-8">
            <TabsList className="w-full md:w-[400px] grid grid-cols-2 mb-0 bg-transparent">
              <TabsTrigger 
                value="upcoming"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Upcoming ({upcomingInterviews.length})
              </TabsTrigger>
              <TabsTrigger 
                value="expired"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Clock className="mr-2 h-4 w-4" />
                Past Interviews ({expiredInterviews.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upcoming">
            <div className="grid grid-cols-1 gap-6">
              {upcomingInterviews.length > 0 ? (
                upcomingInterviews.map((session) => (
                  <InterviewCard 
                    key={session.interviewSessionId} 
                    session={session} 
                    isExpired={false} 
                    showAttemptedButton={false}
                  />
                ))
              ) : (
                <Card className="overflow-hidden border shadow-sm">
                  <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                      <Calendar className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No Upcoming Interviews</h3>
                    <p className="text-muted-foreground max-w-sm">
                      You don't have any upcoming interviews scheduled at the moment.
                    </p>
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
                    showAttemptedButton={false}
                  />
                ))
              ) : (
                <Card className="overflow-hidden border shadow-sm">
                  <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                      <CheckCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No Past Interviews</h3>
                    <p className="text-muted-foreground max-w-sm">
                      You don't have any past interviews in your history.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Attempted Interviews Section */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl opacity-25 dark:opacity-5" />
          
          <div className="relative p-6 rounded-xl border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                <h2 className="text-2xl font-bold">Attempted Interviews</h2>
              </div>
              <p className="text-muted-foreground">
                You have completed {attemptedInterviews.length} interview(s)
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {attemptedInterviews.length > 0 ? (
                attemptedInterviews.map((session) => (
                  <InterviewCard 
                    key={session.interviewSessionId} 
                    session={session} 
                    isExpired={false}
                    showAttemptedButton={true}
                  />
                ))
              ) : (
                <Card className="overflow-hidden border shadow-sm">
                  <CardContent className="py-10 flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                      <CheckCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No Attempted Interviews</h3>
                    <p className="text-muted-foreground max-w-sm">
                      You haven't completed any interviews yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InterviewCard({ session, isExpired, showAttemptedButton }) {
  const interview = session.interview;
  const job = interview.job;
  
  // Determine date to display (complete by or scheduled at)
  const dateToDisplay = interview.conductWithAI 
    ? interview.completeBy 
    : interview.scheduledAt;

  return (
    <Card className="overflow-hidden border hover:shadow-md transition-shadow">
      <CardHeader className="bg-muted/20 border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold">{interview.title}</CardTitle>
            <CardDescription className="mt-1.5">
              <span className="font-medium text-foreground">{job.title}</span>
              <span className="mx-2 text-muted-foreground">•</span>
              <span>{job.location}</span>
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={interview.type === "CODE" ? "secondary" : "default"} 
                  className="shadow-sm">
              {interview.type === "CODE" ? (
                <><Code className="mr-1 h-3 w-3" /> Coding</>
              ) : (
                <><MessageSquare className="mr-1 h-3 w-3" /> Non-Coding</>
              )}
            </Badge>
            
            {interview.conductWithAI && !interview.conductOffline ? (
              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 shadow-sm">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="mr-1 h-3 w-3"
                >
                  <circle cx="8" cy="12" r="1" />
                  <circle cx="16" cy="12" r="1" />
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
                Powered By Yukti AI
              </Badge>
            ) : interview.conductOffline ? (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 shadow-sm">
                <MapPin className="mr-1 h-3 w-3" />
                Offline Interview
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 shadow-sm">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="mr-1 h-3 w-3"
                >
                  <path d="M15 8v8H5V8h10m1-2H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4V7c0-.55-.45-1-1-1z" />
                </svg>
                Video Interview
              </Badge>
            )}
            
            {session.attempted && (
              <Badge variant="outline" className="bg-green-50 text-green-700 shadow-sm">
                <CheckCircle className="mr-1 h-3 w-3" /> Attempted
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        {/* Date information */}
        {dateToDisplay && (
          <div className="flex items-center text-sm rounded-md p-3 bg-muted/10">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>
              <span className="text-muted-foreground">
                {interview.conductWithAI ? "Complete by: " : "Scheduled for: "}
              </span>
              <span className="font-medium text-foreground">
                {format(new Date(dateToDisplay), "PPP")}
              </span>
              {!isExpired && (
                <span className="ml-2 text-xs rounded-full bg-muted px-2 py-0.5">
                  {formatDistanceToNow(new Date(dateToDisplay), { addSuffix: true })}
                </span>
              )}
            </span>
          </div>
        )}
        
        {/* Location for offline interviews */}
        {interview.conductOffline && interview.location && (
          <div className="flex items-center text-sm rounded-md p-3 bg-muted/10">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>
              <span className="text-muted-foreground">Location: </span>
              <span className="font-medium text-foreground">{interview.location}</span>
            </span>
          </div>
        )}
        
        {isExpired && !session.attempted && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive flex items-center">
            <AlertTriangle className="h-5 w-5 mr-3" />
            <p>This interview has expired and was not attempted</p>
          </div>
        )}
      </CardContent>
      
      <Separator />
      
      <CardFooter className="bg-muted/5 p-4">
        <div className="w-full flex justify-end">
          {/* Different button states based on interview type */}
          {!interview.conductOffline && !isExpired && !session.attempted && !showAttemptedButton && (
            <Button asChild className="shadow-sm">
              <Link href={
                interview.conductWithAI 
                  ? `/applicant/dashboard/interview/${session.interviewSessionId}`
                  : interview.location || "#"
              }>
                <span className="flex items-center">
                  Start Interview
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor" 
                    className="ml-2 h-4 w-4"
                  >
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </span>
              </Link>
            </Button>
          )}
          
          {/* Attempted button (grayed out) */}
          {showAttemptedButton && (
            <Button variant="outline" disabled className="text-gray-500 bg-gray-100">
              <CheckCircle className="mr-2 h-4 w-4" /> Attempted
            </Button>
          )}
          
          {interview.conductOffline && !session.attempted && !isExpired && (
            <Button variant="outline" disabled className="shadow-sm">
              <MapPin className="mr-2 h-4 w-4" /> In-person Interview
            </Button>
          )}
          
          {isExpired && !session.attempted && (
            <Button variant="outline" disabled className="shadow-sm">
              <AlertTriangle className="mr-2 h-4 w-4" /> Interview Expired
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}