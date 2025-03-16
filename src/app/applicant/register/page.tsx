"use client";

import { createApplicant } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { toast } from "sonner";

const Page = () => {
  const router = useRouter();

  interface Payload {
    name: string;
    email: string;
    phone: string;
    password: string;
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden">
            <CardContent className="grid p-0 md:grid-cols-2">
              <form
                className="p-6 md:p-8"
                action={async (e) => {
                  const formData = Object.fromEntries(e.entries());

                  const payload: Payload = {
                    name: formData["name"] as string,
                    email: formData["email"] as string,
                    phone: formData["phone"] as string,
                    password: formData["password"] as string,
                  };

                  const { applicant, error } = await createApplicant(payload);

                  if (error) {
                    console.error("err: ", error);
                    toast.error("Invalid credentials");
                    return;
                  } else {
                    setCookie("ykapptoken", applicant, {
                      maxAge: 60 * 60 * 24 * 7,
                    });

                    toast.success("Account created successfully");

                    router.push("/applicant/dashboard");
                  }
                }}
              >
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">Welcome to Yukti</h1>
                    <p className="text-balance text-muted-foreground">
                      Create a new Applicant Account
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create an Account
                  </Button>
                  <div className="text-center text-sm">
                    Already have an account?{" "}
                    <Link
                      href="/applicant/login"
                      className="underline underline-offset-4"
                    >
                      Login
                    </Link>
                  </div>
                </div>
              </form>
              <div className="relative hidden bg-white md:block">
                <Image
                  src="/logo-square.png"
                  alt="Image"
                  className="absolute inset-0 w-full my-auto object-contain dark:brightness-[0.2] dark:grayscale"
                  width={800}
                  height={800}
                />
              </div>
            </CardContent>
          </Card>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            By clicking continue, you agree to our{" "}
            <Link href="/">Terms of Service</Link> and{" "}
            <Link href="/">Privacy Policy</Link>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
