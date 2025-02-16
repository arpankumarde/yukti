// language: TypeScript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a recruiter
  const recruiter = await prisma.recruiter.create({
    data: {
      name: 'Alice Recruiter',
      email: 'alice.recruiter@example.com',
      password: 'hashedpassword',
    },
  })

  // Create an applicant
  const applicant = await prisma.applicant.create({
    data: {
      name: 'Bob Applicant',
      email: 'bob.applicant@example.com',
      password: 'hashedpassword',
    },
  })

  // Create a job linked to the recruiter
  const job = await prisma.job.create({
    data: {
      title: 'Software Engineer',
      description: 'Develop awesome features',
      recruiter: { connect: { recruiterId: recruiter.recruiterId } },
    },
  })

  // Create an application linking applicant to job
  const application = await prisma.application.create({
    data: {
      applicant: { connect: { applicantId: applicant.applicantId } },
      job: { connect: { id: job.id } },
      status: 'Pending',
      comments: 'Looking forward to this opportunity',
      resume: 'resume_link.pdf',
      score: 0,
    },
  })

  // Create an interview schedule for the job (optional recruiter)
  const interviewSchedule = await prisma.interviewSchedule.create({
    data: {
      scheduledAt: new Date(),
      location: 'Online',
      comments: 'First round interview',
      job: { connect: { id: job.id } },
      recruiter: { connect: { recruiterId: recruiter.recruiterId } },
    },
  })

  // Create a mock interview linked to the applicant (and optional recruiter)
  const mockInterview = await prisma.mockInterview.create({
    data: {
      scheduledAt: new Date(),
      location: 'Conference Room A',
      feedback: 'Good performance',
      applicant: { connect: { applicantId: applicant.applicantId } },
      recruiter: { connect: { recruiterId: recruiter.recruiterId } },
    },
  })

  // Create a mock interview QA linked to the mock interview
  const mockInterviewQA = await prisma.mockInterviewQA.create({
    data: {
      question: 'Explain closures in JavaScript.',
      answer: 'A closure is ...',
      answerFeedback: 'Detailed explanation required.',
      mockInterview: { connect: { mockInterviewId: mockInterview.mockInterviewId } },
    },
  })

  console.log({ recruiter, applicant, job, application, interviewSchedule, mockInterview, mockInterviewQA })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })