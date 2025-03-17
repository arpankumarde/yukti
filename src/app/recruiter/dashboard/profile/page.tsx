import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { format } from "date-fns";
import { User, Mail, Briefcase, Calendar, Edit, Shield } from "lucide-react";

interface AuthCookie {
  recruiterId: string;
}

export default async function ProfilePage() {
  // Get the current user information from cookies
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("ykrecauth");
  
  if (!authCookie) {
    notFound();
  }

  try {
    const userData = JSON.parse(authCookie.value) as AuthCookie;
    const recruiterId = userData.recruiterId;

    // Fetch recruiter data from database
    const recruiter = await prisma.recruiter.findUnique({
      where: { recruiterId },
      select: {
        recruiterId: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            jobs: true
          }
        }
      }
    });

    if (!recruiter) {
      notFound();
    }

    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-6 flex items-center gap-2">
            <User className="h-8 w-8" />
            My Profile
          </h1>

          <Card className="shadow-md border-muted">
            <CardHeader className="bg-muted/20 border-b">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl">{recruiter.name}</CardTitle>
                  <CardDescription className="text-muted-foreground mt-1">
                    Account details and recruiter information
                  </CardDescription>
                </div>
                <Badge variant="outline" className="px-3 py-1 bg-primary/10 text-primary w-fit">
                  Recruiter
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Full Name</h3>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <p className="font-medium text-lg">{recruiter.name}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Email Address</h3>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <p className="font-medium">{recruiter.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Account Created</h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <p className="font-medium">{format(new Date(recruiter.createdAt), "PP")}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Job Postings</h3>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <p className="font-medium">{recruiter._count.jobs}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Profile ID</h3>
                    <p className="text-sm text-muted-foreground font-mono">{recruiter.recruiterId}</p>
                  </div>
                </div>
              </div>
            </CardContent>

            <Separator />

            <CardFooter className="p-6 flex justify-end bg-muted/5">
              <Button asChild className="gap-2">
                <Link href="/recruiter/dashboard/profile/edit">
                  <Edit className="h-4 w-4" /> Edit Profile
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching profile:", error);
    return (
      <div className="container mx-auto py-10 px-4">
        <Card className="max-w-4xl mx-auto shadow-md">
          <CardContent className="p-6">
            <div className="text-center py-10">
              <h2 className="text-2xl font-bold text-destructive">Error Loading Profile</h2>
              <p className="mt-2">There was an error loading your recruiter information. Please try again later.</p>
              <Button className="mt-4" asChild>
                <Link href="/recruiter/dashboard">Return to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}