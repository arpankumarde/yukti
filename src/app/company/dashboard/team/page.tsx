import { Button } from "@/components/ui/button";
import { Company } from "@/generated/client";
import prisma from "@/lib/prisma";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import Link from "next/link";

const Page = async () => {
  const userCookie = await getCookie("ykcomtoken", { cookies });
  const user = userCookie ? (JSON.parse(userCookie) as Company) : undefined;

  const recruiters = await prisma.recruiter.findMany({
    where: {
      companyId: user?.companyId,
    },
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-primary">
          Recruiters ({recruiters.length})
        </h1>

        <div className="flex gap-2">
          <Button variant={"outline"} asChild>
            <Link href="./team/create">Add Bulk Recruiters</Link>
          </Button>
          <Button asChild>
            <Link href="./team/create">Add Recruiters</Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {recruiters.map((recruiter) => (
          <div key={recruiter.recruiterId} className="p-4 border rounded-md">
            <h2 className="text-xl font-semibold">{recruiter.name}</h2>
            <p>{recruiter.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
