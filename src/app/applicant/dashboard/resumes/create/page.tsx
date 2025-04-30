import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCookie } from "cookies-next";
import { Applicant } from "@/generated/prisma";
import ResumeForm from "./ResumeForm";

const Page = async () => {
  const userCookie = await getCookie("ykapptoken", { cookies });
  const user = userCookie ? (JSON.parse(userCookie) as Applicant) : undefined;

  if (!user) {
    redirect("/applicant/login");
  }

  return <ResumeForm applicantId={user.applicantId} />;
};

export default Page;
