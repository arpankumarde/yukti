import { PrismaClient } from "../src/generated/prisma";
import admin from "./data/admin.json";
import company from "./data/company.json";
import recruiter from "./data/recruiter.json";
import applicant from "./data/applicant.json";

const prisma = new PrismaClient();

async function main() {
  const newAdmin = await prisma.admin.upsert({
    where: { email: admin.email },
    update: {},
    create: admin,
  });

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
      Company: { connect: { email: company.email } },
    },
  });

  const newApplicant = await prisma.applicant.upsert({
    where: { email: applicant.email },
    update: {},
    create: applicant,
  });

  console.log({ newAdmin, newCompany, newRecruiter, newApplicant });
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
