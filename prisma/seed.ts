import { prisma } from "../lib/db";
import { CITIES } from "../lib/cities";
import { ingestUpstream } from "../lib/ingest";
import { SPECIES_CATALOG } from "../lib/species-catalog";

async function seedReferenceData() {
  for (const city of CITIES) {
    await prisma.region.upsert({
      where: { name: city.name },
      create: { name: city.name, lat: city.lat, lng: city.lng },
      update: { lat: city.lat, lng: city.lng },
    });
  }

  for (const species of SPECIES_CATALOG) {
    await prisma.species.upsert({
      where: { slug: species.slug },
      create: {
        slug: species.slug,
        name: species.name,
        latinName: species.latinName,
        riskLevel: species.riskLevel,
        description: species.description,
        identificationTips: species.identificationTips,
        imageUrl: `/images/species-${species.slug}.jpg`,
      },
      update: {
        name: species.name,
        latinName: species.latinName,
        riskLevel: species.riskLevel,
        description: species.description,
        identificationTips: species.identificationTips,
        imageUrl: `/images/species-${species.slug}.jpg`,
      },
    });
  }
}

async function main() {
  await seedReferenceData();
  const result = await ingestUpstream();
  console.log(JSON.stringify(result, null, 2));
  if (result.upserted < 1) {
    throw new Error("Ingestion stored no sightings");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
