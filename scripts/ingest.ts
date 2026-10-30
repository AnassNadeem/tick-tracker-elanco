import { prisma } from "../lib/db";
import { ingestUpstream } from "../lib/ingest";

ingestUpstream()
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    return prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
