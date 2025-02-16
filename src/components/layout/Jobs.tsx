import { PrismaClient } from "@prisma/client";
import React from "react";
import { Briefcase, Building2, Search } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Briefcase className="w-8 h-8 text-indigo-600" />
            Available Positions
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover your next career opportunity among our curated list of positions
          </p>
        </div>

        {/* Search Form */}
        <form action="" className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
              placeholder="Search positions by title or description..."
            />
            <button
              type="submit"
              className="absolute inset-y-1 right-1 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
            >
              Search
            </button>
          </div>
        </form>

        {jobs.length > 0 ? (
          <>
            {searchTerms.length > 0 && (
              <div className="text-center mb-8">
                <p className="text-gray-600">
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
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 hover:border-indigo-100 group"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-200">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      Experience: {job.experience || "Not specified"}
                    </p>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm">
                        {job.recruiter ? job.recruiter.name : "Company not specified"}
                      </span>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <button className="w-full py-2 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors duration-200 font-medium text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerms.length > 0
                ? `No positions found matching "${searchQuery}"`
                : "No positions available"}
            </h3>
            <p className="text-gray-500">
              {searchTerms.length > 0
                ? "Try adjusting your search terms or browse all available positions"
                : "Check back later for new opportunities"}
            </p>
            {searchTerms.length > 0 && (
              <a 
                href="/"
                className="mt-4 inline-block px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors duration-200 font-medium text-sm"
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