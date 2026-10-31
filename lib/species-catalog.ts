export const SPECIES_CATALOG = [
  {
    slug: "fox-badger-tick",
    name: "Fox/badger tick",
    latinName: "Ixodes canisuga",
    riskLevel: "high",
    description:
      "Lives in dens used by foxes, badgers, and dogs. Dogs that nose around burrows are the pets most likely to pick one up.",
    identificationTips:
      "Plain brown body, no patterned shield. Check the head, neck, and between the toes after walks near setts.",
  },
  {
    slug: "marsh-tick",
    name: "Marsh tick",
    latinName: "Ixodes apronophorus",
    riskLevel: "medium",
    description: "Found in wetlands and around small mammals such as voles.",
    identificationTips:
      "Plain shield and a forward mouthpart. Damp grass, reedbeds, and river banks are the usual setting.",
  },
  {
    slug: "passerine-tick",
    name: "Passerine tick",
    latinName: "Dermacentor frontalis",
    riskLevel: "low",
    description: "Linked with songbirds. The shield often has a pale pattern.",
    identificationTips:
      "Look for light mottling on the shield. Garden and woodland records near birds fit this species.",
  },
  {
    slug: "southern-rodent-tick",
    name: "Southern rodent tick",
    latinName: "Ixodes acuminatus",
    riskLevel: "medium",
    description:
      "A rodent tick, more often discussed in southern Britain. The name refers to pointed mouthparts.",
    identificationTips:
      "Plain shield and pointed mouthparts. Typical around hedges, rough grass, and pets that hunt small mammals.",
  },
  {
    slug: "tree-hole-tick",
    name: "Tree-hole tick",
    latinName: "Ixodes arboricola",
    riskLevel: "low",
    description: "Lives in tree holes and nest cavities used by birds.",
    identificationTips: "Plain shield. Old trees, nest boxes, and woodland, rather than open lawn.",
  },
] as const;

export type SpeciesSlug = (typeof SPECIES_CATALOG)[number]["slug"];

const byName = new Map(SPECIES_CATALOG.map((species) => [species.name, species]));
const bySlug = new Map(SPECIES_CATALOG.map((species) => [species.slug, species]));

export function findSpeciesByName(name: string) {
  return byName.get(name as (typeof SPECIES_CATALOG)[number]["name"]) ?? null;
}

export function findSpeciesBySlug(slug: string) {
  return bySlug.get(slug as SpeciesSlug) ?? null;
}
