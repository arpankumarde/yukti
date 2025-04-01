"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { deleteCookie } from "cookies-next";
import { MdDashboard } from "react-icons/md";
import {
  FaBriefcase,
  FaClipboardCheck,
  FaUserTie,
  FaFileAlt,
  FaUser,
} from "react-icons/fa";
import Image from "next/image";

export function ApplicantSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        {/* Logo/Header */}
        <div className="p-4">
          <Image src="/logo.png" alt="Logo" width={400} height={400} />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="py-6 text-lg duration-200 transition-colors"
                  asChild
                >
                  <Link href="/applicant/dashboard">
                    <MdDashboard className="!size-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="py-6 text-lg duration-200 transition-colors"
                  asChild
                >
                  <Link href="/applicant/dashboard/jobs">
                    <FaBriefcase className="!size-5" />
                    <span>Job hunting</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="py-6 text-lg duration-200 transition-colors"
                  asChild
                >
                  <Link href="/applicant/dashboard/applied-jobs">
                    <FaClipboardCheck className="!size-5" />
                    <span>Applied jobs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="py-6 text-lg duration-200 transition-colors"
                  asChild
                >
                  <Link href="/applicant/dashboard/interview">
                    <FaUserTie className="!size-5" />
                    <span>Interviews</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  className="py-6 text-lg duration-200 transition-colors"
                  asChild
                >
                  <Link href="/applicant/dashboard/resume-analyser">
                    <FaFileAlt className="!size-5" />
                    <span>Resume Analyser</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/applicant/dashboard/profile">
                <FaUser className="!size-5" />
                <span>My Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button
                onClick={() => {
                  deleteCookie("ykapptoken");
                  router.push("/applicant/login");
                }}
              >
                Logout
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
