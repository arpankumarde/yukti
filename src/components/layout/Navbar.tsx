import { Home, User, Briefcase, Building } from "lucide-react";
import { NavBar } from "@/components/ui/tubelight-navbar";

const Navbar = () => {
  const navItems = [
    { name: "Home", url: "/", icon: Home },
    { name: "Company", url: "/company", icon: Building },
    { name: "Recruiter", url: "/recruiter", icon: User },
    { name: "Applicant", url: "/applicant", icon: Briefcase },
  ];

  return <NavBar items={navItems} />;
};

export default Navbar;
