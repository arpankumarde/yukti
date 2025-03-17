import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { format } from "date-fns";
import { User, Mail, Phone, Calendar, Edit, Shield } from "lucide-react";

interface AuthCookie {
  applicantId: string;
}

export default async function ProfilePage() {
  // Get the current user information from cookies
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("ykapptoken");
  
  if (!authCookie) {
    notFound();
  }

  try {
    const userData = JSON.parse(authCookie.value) as AuthCookie;
    const applicantId = userData.applicantId;

    // Fetch applicant data from database
    const applicant = await prisma.applicant.findUnique({
      where: { applicantId },
      select: {
        applicantId: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        applications: {
          select: {
            applicationId: true,
          }
        }
      }
    });

    if (!applicant) {
      notFound();
    }

    // Count of applications
    const applicationCount = applicant.applications.length;

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
                  <CardTitle className="text-2xl">{applicant.name}</CardTitle>
                  <CardDescription className="text-muted-foreground mt-1">
                    Account details and profile information
                  </CardDescription>
                </div>
                <Badge variant="outline" className="px-3 py-1 bg-primary/10 text-primary w-fit">
                  Applicant
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
                      <p className="font-medium text-lg">{applicant.name}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Email Address</h3>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <p className="font-medium">{applicant.email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone Number</h3>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <p className="font-medium">{applicant.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Account Created</h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <p className="font-medium">{format(new Date(applicant.createdAt), "PP")}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Applications Submitted</h3>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <p className="font-medium">{applicationCount}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Profile ID</h3>
                    <p className="text-sm text-muted-foreground font-mono">{applicant.applicantId}</p>
                  </div>
                </div>
              </div>
            </CardContent>

            <Separator />

            <CardFooter className="p-6 flex justify-end bg-muted/5">
              <Button asChild className="gap-2">
                <Link href="/applicant/dashboard/profile/edit">
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
              <p className="mt-2">There was an error loading your profile information. Please try again later.</p>
              <Button className="mt-4" asChild>
                <Link href="/applicant/dashboard">Return to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}