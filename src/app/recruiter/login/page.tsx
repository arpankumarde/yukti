"use client";

import { loginHR } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Turnstile } from "@/components/block/turnstile";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { toast } from "sonner";
import { useState } from "react";

const Page = () => {
  const router = useRouter();
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  interface Payload {
    email: string;
    password: string;
    turnstileToken: string; // Add this field
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

                  // Check if turnstile token exists
                  if (!turnstileToken) {
                    toast.error("Please complete the captcha");
                    return;
                  }

                  const payload: Payload = {
                    email: formData["email"] as string,
                    password: formData["password"] as string,
                    turnstileToken: turnstileToken,
                  };

                  const { recruiter, error } = await loginHR(payload);

                  if (error) {
                    console.error("err: ", error);
                    toast.error(error);
                    return;
                  } else {
                    setCookie("ykrectoken", recruiter, {
                      maxAge: 60 * 60 * 24 * 7,
                    });

                    toast.success("Welcome back! Glad to see you here!");

                    router.push("/recruiter/dashboard");
                  }
                }}
              >
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-balance text-muted-foreground">
                      Login to your Yukti HR Account
                    </p>
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

                  {/* Add Turnstile component */}
                  <Turnstile
                    siteKey={
                      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
                      "1x00000000000000000000AA"
                    }
                    onVerify={(token) => setTurnstileToken(token)}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!turnstileToken}
                  >
                    Login
                  </Button>
                </div>
              </form>
              <div className="relative hidden bg-white md:block">
                <Image
                  src="/logo-square.png"
                  alt="Image"
                  className="absolute inset-0 w-full my-auto object-cover dark:brightness-[0.2] dark:grayscale h-full"
                  width={800}
                  height={800}
                  priority
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Page;
