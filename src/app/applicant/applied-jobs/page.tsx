import { PrismaClient } from "@prisma/client";
import { Briefcase, Calendar, FileText, MessageSquare, Star, User2 } from "lucide-react";

const prisma = new PrismaClient();

export default async function AppliedJobsPage() {
  // Replace with your actual authentication/session logic
  const applicantId = "cm77crure0001rbuv6rfxj6ui";

  const applications = await prisma.application.findMany({
    where: { applicantId },
    include: { job: true },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <User2 className="w-8 h-8 text-indigo-600" />
            My Applied Jobs
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track the status of your job applications and stay updated on your career journey
          </p>
        </div>

        {/* Applications Grid */}
        <div className="grid gap-6">
          {applications.map((app) => (
            <div
              key={app.applicationId}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {app.job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                      app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {app.status || 'PENDING'}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="flex items-start gap-2">
                    <FileText className="w-5 h-5 text-indigo-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Resume</h4>
                      <p className="text-sm text-gray-600">{app.resume || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Comments</h4>
                      <p className="text-sm text-gray-600">{app.comments || 'No comments yet'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Star className="w-5 h-5 text-indigo-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Score</h4>
                      <p className="text-sm text-gray-600">{app.score ?? 'Not scored'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {applications.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500">Start applying to jobs to track your applications here</p>
          </div>
        )}
      </div>
    </div>
  );
}