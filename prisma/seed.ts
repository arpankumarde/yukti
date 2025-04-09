import { PrismaClient } from "@prisma/client";
import company from "./data/company.json";
import recruiter from "./data/recruiter.json";
import applicant from "./data/applicant.json";

const prisma = new PrismaClient();

async function main() {
  const newCompany = await prisma.company.upsert({
    where: { email: company.email },
    update: {},
    create: company,
  });

  const newRecruiter = await prisma.recruiter.upsert({
    where: { email: recruiter.email },
    update: {},
    create: {
      ...recruiter,
      company: { connect: { email: company.email } },
    },
  });

  const newApplicant = await prisma.applicant.upsert({
    where: { email: applicant.email },
    update: {},
    create: applicant,
  });

  console.log({ newCompany, newRecruiter, newApplicant });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
