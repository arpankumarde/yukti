import { Briefcase, Building2, MapPin, Coins, Gift, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AuthCookie {
  applicantId: string;
}

export default async function Jobs({ searchQuery }: { searchQuery?: string }) {
  // Parse search query
  const searchTerms =
    searchQuery
      ?.trim()
      .split(/\s+/)
      .filter((term) => term.length > 0) || [];
      
  // Check if user is authenticated
  const cookieStore = cookies();
  const authCookie =  (await cookieStore).get('ykapptoken');
  const isAuthenticated = !!authCookie;
  
  // Get applicant ID if authenticated
  let applicantId: string | undefined;
  if (isAuthenticated) {
    try {
      const userData = JSON.parse(authCookie.value) as AuthCookie;
      applicantId = userData.applicantId;
    } catch (error) {
      console.error("Error parsing auth cookie:", error);
    }
  }
  
  // Fetch all jobs
  const jobs = await prisma.job.findMany({
    where:
      searchTerms.length > 0
        ? {
            OR: searchTerms.flatMap((term) => [
              { title: { contains: term, mode: "insensitive" } },
              { description: { contains: term, mode: "insensitive" } },
            ]),
          }
        : undefined,
    include: { recruiter: true },
  });
  
  // Fetch applications for the logged-in user
  const applications = applicantId ? await prisma.application.findMany({
    where: { applicantId },
    select: { jobId: true },
  }) : [];
  
  // Create a set of applied job IDs for efficient lookup
  const appliedJobIds = new Set(applications.map(app => app.jobId));
  
  // Separate jobs into applied and available
  const appliedJobs = jobs.filter(job => appliedJobIds.has(job.id));
  const availableJobs = jobs.filter(job => !appliedJobIds.has(job.id));
  
  return (
    <div className="min-h-screen bg-secondary/10 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            <Briefcase className="w-8 h-8 text-primary" />
            Available Positions
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover your next career opportunity among our curated list of
            positions
          </p>
        </div>

        {/* Search results count */}
        {searchTerms.length > 0 && (
          <div className="text-center mb-8">
            <p className="text-muted-foreground">
              Found {jobs.length}{" "}
              {jobs.length === 1 ? "position" : "positions"}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
        )}

        {/* If authenticated and has applied jobs, show applied jobs section */}
        {isAuthenticated && appliedJobs.length > 0 && (
          <>
            <h2 className="text-2xl font-semibold mb-6">Applied Jobs</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
              {appliedJobs.map((job) => (
                <Card 
                  key={job.id} 
                  className="border-border overflow-hidden opacity-70"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-semibold text-muted-foreground">
                      {job.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {job.recruiter ? job.recruiter.name : "Company not specified"}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{job.location}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Posted {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-primary/5 opacity-80">
                          {job.experience || "Not specified"}
                        </Badge>
                        
                        {job.salary && (
                          <Badge variant="secondary" className="flex items-center gap-1 opacity-80">
                            <Coins className="w-3 h-3" />
                            {job.salary}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="bg-muted/20 border-t pt-4">
                    <div className="w-full">
                      <div className="py-2 text-center text-sm">
                        Already applied. <Link href="/applicant/dashboard/applied-jobs" className="text-primary hover:underline">Track status</Link>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {availableJobs.length > 0 && (
              <>
                <Separator className="mb-8" />
                <h2 className="text-2xl font-semibold mb-6">Available Jobs</h2>
              </>
            )}
          </>
        )}

        {/* Jobs Grid - For available jobs or all jobs if not authenticated */}
        {(isAuthenticated ? availableJobs : jobs).length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(isAuthenticated ? availableJobs : jobs).map((job) => (
              <Card 
                key={job.id} 
                className="transition-all duration-200 hover:shadow-md overflow-hidden border-border group h-full flex flex-col"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors duration-200">
                    {job.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {job.recruiter ? job.recruiter.name : "Company not specified"}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{job.location}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-primary/5">
                        {job.experience || "Not specified"}
                      </Badge>
                      
                      {job.salary && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Coins className="w-3 h-3" />
                          {job.salary}
                        </Badge>
                      )}
                      
                      {job.perks && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">
                          <Gift className="w-3 h-3 mr-1" />
                          Perks Included
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="bg-muted/20 border-t pt-4">
                  <Link
                    href={`/applicant/dashboard/jobs/${job.id}`}
                    className="w-full"
                  >
                    <div className="bg-primary/10 hover:bg-primary/20 text-primary py-2 rounded-md text-center font-medium transition-colors">
                      View Details
                    </div>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12 border border-border">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-muted rounded-full">
                  <Briefcase className="w-12 h-12 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-foreground mb-2">
                {searchTerms.length > 0
                  ? `No positions found matching "${searchQuery}"`
                  : "No positions available"}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchTerms.length > 0
                  ? "Try adjusting your search terms or browse all available positions"
                  : "Check back later for new opportunities"}
              </p>
              {searchTerms.length > 0 && (
                <div className="mt-6">
                  <Link
                    href="/applicant/dashboard/jobs"
                    className="px-4 py-2 rounded-md transition-colors duration-200 font-medium bg-primary/10 hover:bg-primary/20 text-primary"
                  >
                    View all positions
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}