"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCookie, setCookie } from "cookies-next";
import { toast } from "sonner";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, ArrowLeft, Save, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Applicant {
  applicantId: string;
  name: string;
  email: string;
  phone: string;
}

// Server action to update applicant profile
async function updateApplicantProfile(
  applicantId: string,
  data: { name: string; phone: string }
) {
  try {
    const response = await axios.patch("/api/applicant/profile", {
      applicantId,
      name: data.name,
      phone: data.phone,
    });

    if (response.status !== 200) {
      throw new Error("Failed to update profile");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return { success: false, error: error.message };
  }
}

export default function EditProfilePage() {
  const router = useRouter();
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  useEffect(() => {
    const loadProfile = () => {
      try {
        const cookieValue = getCookie("ykapptoken");
        if (cookieValue) {
          const userData = JSON.parse(cookieValue as string);
          setApplicant(userData);
          setName(userData.name || "");
          setEmail(userData.email || "");
          setPhone(userData.phone || "");
        } else {
          router.push("/applicant/login");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setError("Unable to load profile information");
      }
    };

    loadProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!applicant?.applicantId) {
      setError("Missing applicant information");
      setLoading(false);
      return;
    }

    try {
      const result = await updateApplicantProfile(applicant.applicantId, {
        name,
        phone,
      });

      if (result.success) {
        // Update cookie with new data
        const updatedApplicant = {
          ...applicant,
          name,
          phone,
        };
        setCookie("ykapptoken", JSON.stringify(updatedApplicant));

        toast.success("Profile updated successfully");
        router.push("/applicant/dashboard/profile");
      } else {
        setError(result.error ?? "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Password update would be implemented here
    toast.info("Password update functionality is coming soon!");
  };

  if (!applicant) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[300px]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-3 text-muted-foreground">
            Loading profile information...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/applicant/dashboard/profile">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <User className="h-7 w-7" />
            Edit Profile
          </h1>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8">
          {/* Basic Information Card */}
          <Card className="shadow-md border-muted">
            <CardHeader className="bg-muted/20 border-b">
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      value={email}
                      disabled
                      className="h-11 bg-muted/30 cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email address cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </CardContent>

              <Separator />

              <CardFooter className="p-6 flex justify-between bg-muted/5">
                <Button variant="outline" type="button" asChild>
                  <Link href="/applicant/dashboard/profile">Cancel</Link>
                </Button>
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Password Update Card */}
          <Card className="shadow-md border-muted">
            <CardHeader className="bg-muted/20 border-b">
              <CardTitle>Update Password</CardTitle>
              <CardDescription>Change your account password</CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordUpdate}>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="current-password"
                      className="text-sm font-medium"
                    >
                      Current Password
                    </Label>
                    <Input
                      id="current-password"
                      name="current-password"
                      type="password"
                      value={passwordCurrent}
                      onChange={(e) => setPasswordCurrent(e.target.value)}
                      className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="new-password"
                        className="text-sm font-medium"
                      >
                        New Password
                      </Label>
                      <Input
                        id="new-password"
                        name="new-password"
                        type="password"
                        value={passwordNew}
                        onChange={(e) => setPasswordNew(e.target.value)}
                        className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="confirm-password"
                        className="text-sm font-medium"
                      >
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>

              <Separator />

              <CardFooter className="p-6 flex justify-end bg-muted/5">
                <Button type="submit" variant="outline" className="gap-2">
                  Update Password
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
