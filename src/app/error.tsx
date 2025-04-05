"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { v6 } from "uuid";

const Error = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-dvh px-4 py-4  sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
      <div className="mx-auto max-w-max">
        <div className="flex items-center justify-center">
          <div className="flex mt-6">
            <p className="text-4xl font-extrabold text-blue600 sm:text-5xl">
              <Image src="/logo.png" alt="Yukti Logo" width={60} height={60} />
            </p>
            <div className="ml-6">
              <div className="pl-6 border-l border-gray500">
                <h2 className="text-3xl font-bold tracking-tight text-gray900 dark:text-white sm:text-4xl">
                  Oops! Something went wrong
                </h2>
                <p className="mt-1 text-lg text-gray500 dark:text-white">
                  An error occurred while processing your request. Please try
                  again.
                </p>
                <p className="pt-4 text-sm">Request ID: {v6()}</p>
              </div>
              <div className="flex mt-10 space-x-3 sm:pl-6">
                <Button onClick={reset}>Try again</Button>
                <Button asChild>
                  <Link href="/">Go back home</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error;
