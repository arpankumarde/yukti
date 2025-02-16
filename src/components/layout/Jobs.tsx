import { PrismaClient } from "@prisma/client";
import React from "react";
import { Briefcase, Building2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const prisma = new PrismaClient();

export default async function Jobs({ searchQuery }: { searchQuery?: string }) {
  const searchTerms = searchQuery
    ?.trim()
    .split(/\s+/)
    .filter(term => term.length > 0) || [];

  const jobs = await prisma.job.findMany({
    where: searchTerms.length > 0 ? {
      OR: searchTerms.flatMap(term => [
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } }
      ])
    } : undefined,
    include: { recruiter: true },
  });

  return (
    <div className="min-h-screen bg-secondary/20 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            <Briefcase className="w-8 h-8 text-primary" />
            Available Positions
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover your next career opportunity among our curated list of positions
          </p>
        </div>

        {/* Search Form */}
        <form action="" className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              className={cn(
                "block w-full pl-10 pr-3 py-3 rounded-lg transition-all duration-200",
                "bg-background/80 backdrop-blur-sm",
                "border border-input",
                "focus:ring-2 focus:ring-ring focus:border-transparent"
              )}
              placeholder="Search positions by title or description..."
            />
            <button
              type="submit"
              className={cn(
                "absolute inset-y-1 right-1 px-4 rounded-md transition-colors duration-200",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90"
              )}
            >
              Search
            </button>
          </div>
        </form>

        {jobs.length > 0 ? (
          <>
            {searchTerms.length > 0 && (
              <div className="text-center mb-8">
                <p className="text-muted-foreground">
                  Found {jobs.length} {jobs.length === 1 ? 'position' : 'positions'}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>
            )}

            {/* Jobs Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className={cn(
                    "bg-background rounded-xl overflow-hidden transition-all duration-200",
                    "border border-border",
                    "shadow-sm hover:shadow-md",
                    "hover:border-border group"
                  )}
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                      {job.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      Experience: {job.experience || "Not specified"}
                    </p>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm">
                        {job.recruiter ? job.recruiter.name : "Company not specified"}
                      </span>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-muted border-t border-border">
                    <button className={cn(
                      "w-full py-2 px-4 rounded-lg transition-colors duration-200 font-medium text-sm",
                      "bg-primary/10 hover:bg-primary/20 text-primary"
                    )}>
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-background rounded-xl shadow-sm border border-border">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerms.length > 0
                ? `No positions found matching "${searchQuery}"`
                : "No positions available"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerms.length > 0
                ? "Try adjusting your search terms or browse all available positions"
                : "Check back later for new opportunities"}
            </p>
            {searchTerms.length > 0 && (
              <a 
                href="/"
                className={cn(
                  "mt-4 inline-block px-4 py-2 rounded-lg transition-colors duration-200 font-medium text-sm",
                  "bg-primary/10 hover:bg-primary/20 text-primary"
                )}
              >
                View all positions
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}