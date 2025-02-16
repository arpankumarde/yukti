import { Home, User, Briefcase, FileText } from "lucide-react";
import { NavBar } from "@/components/ui/tubelight-navbar";

const Navbar = () => {
  const navItems = [
    { name: "Home", url: "/", icon: Home },
    { name: "Recruiter", url: "/recruiter/login", icon: User },
    { name: "Applicant", url: "/applicant/login", icon: Briefcase },
  ];

  return <NavBar items={navItems} />;
};

export default Navbar;
