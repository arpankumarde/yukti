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
import { GrTransaction } from "react-icons/gr";
import { RiTeamLine } from "react-icons/ri";
import { FaFileAlt, FaUser } from "react-icons/fa";
import { MdSpaceDashboard } from "react-icons/md";
import { Button } from "../ui/button";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";

export function RecruiterSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        {/* Logo/Header */}
        <div className="p-4">
          <img src="/logo.png" alt="Logo" />
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
                  <Link href="/recruiter/dashboard">
                    <MdSpaceDashboard className="!size-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="py-6 text-lg duration-200 transition-colors"
                  asChild
                >
                  <Link href="/recruiter/dashboard/postings">
                    <GrTransaction className="!size-5" />
                    <span>Job Postings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="py-6 text-lg duration-200 transition-colors"
                  asChild
                >
                  <Link href="/recruiter/dashboard/applications">
                    <FaFileAlt className="!size-5" />
                    <span>Applications</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="py-6 text-lg duration-200 transition-colors"
                  asChild
                >
                  <Link href="/recruiter/dashboard/team">
                    <RiTeamLine className="!size-5" />
                    <span>Team</span>
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
              <Link href="/recruiter/dashboard/profile">
                <FaUser className="!size-5" />
                <span>My Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button
                onClick={() => {
                  deleteCookie("ykrectoken");
                  router.push("/recruiter/login");
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
