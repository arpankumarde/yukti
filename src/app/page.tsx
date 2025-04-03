"use client";

import { LayoutGroup, motion } from "motion/react";
import { TextRotate } from "@/components/ui/text-rotate";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Briefcase,
  Users,
  ChartBar,
  Shield,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

const Page = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl"
        >
          <div className="inline-block px-4 py-1.5 mb-6 bg-primary/10 text-primary rounded-full font-medium text-sm">
            Transform Your Hiring Process
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            <LayoutGroup>
              <motion.div
                className="flex flex-wrap justify-center gap-2"
                layout
              >
                <motion.span layout>Hire </motion.span>
                <TextRotate
                  texts={["faster!", "fairer!", "better!"]}
                  mainClassName="text-white px-3 bg-primary overflow-hidden py-2 rounded-lg"
                  staggerFrom={"last"}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2000}
                />
              </motion.div>
            </LayoutGroup>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Yukti is an AI-powered platform that streamlines your recruitment
            process, connecting top talent with great opportunities.
          </p>

          <div className="flex justify-center">
            <Button asChild size="lg" className="font-medium">
              <Link href="/company/register">Get Started</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Why Choose Yukti
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              Our comprehensive platform offers powerful tools for both
              recruiters and job seekers
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Briefcase className="h-6 w-6" />,
                title: "Smart Job Matching",
                description:
                  "AI-powered job matching connects candidates with the right opportunities based on skills and experience.",
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "Virtual Interviews",
                description:
                  "Conduct AI-assisted interviews to efficiently evaluate candidates remotely.",
              },
              {
                icon: <ChartBar className="h-6 w-6" />,
                title: "Resume Analysis",
                description:
                  "Get instant feedback and improve your resume's effectiveness with our AI analysis tool.",
              },
              {
                icon: <Shield className="h-6 w-6" />,
                title: "Unbiased Hiring",
                description:
                  "Promote diversity and inclusion with our fair evaluation process.",
              },
              {
                icon: <CheckCircle className="h-6 w-6" />,
                title: "Application Tracking",
                description:
                  "Keep track of all your applications or candidates in one organized dashboard.",
              },
              {
                icon: <ArrowRight className="h-6 w-6" />,
                title: "Streamlined Process",
                description:
                  "Simplify your hiring journey from application to offer with our integrated tools.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                className="bg-background rounded-xl p-6 shadow-sm border border-border/40 hover:shadow-md transition-shadow"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-primary/10 rounded-3xl p-8 md:p-12 text-center max-w-5xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to transform your hiring experience?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of recruiters and job seekers who are already
            benefiting from our platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="font-medium">
              <Link href="/company/register">Create an Account</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-medium">
              <Link href="/company/login">Sign In</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/20 border-t border-border py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Yukti. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Page;
