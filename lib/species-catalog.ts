export const SPECIES_CATALOG = [
  {
    slug: "fox-badger-tick",
    name: "Fox/badger tick",
    latinName: "Ixodes canisuga",
    riskLevel: "high",
    description:
      "A den-dwelling tick associated with foxes, badgers, and dogs. The source dataset uses the common name Fox/badger tick for Ixodes canisuga. Dogs that nose around burrows or wildlife dens are the pets most likely to pick one up.",
    identificationTips:
      "Plain brown body with no ornate (patterned) scutum, unlike Dermacentor. It is a nidicolous tick: it lives in the host's den rather than questing on vegetation. On a dog, check the head, neck, and between the toes after walks near setts or dense cover. This guide is not a diagnosis — if you are unsure, photograph the tick and ask a vet.",
  },
  {
    slug: "marsh-tick",
    name: "Marsh tick",
    latinName: "Ixodes apronophorus",
    riskLevel: "medium",
    description:
      "Associated with wetlands, marshes, and small mammals such as voles. The source dataset labels Ixodes apronophorus as the Marsh tick.",
    identificationTips:
      "An Ixodes tick: unornamented scutum and a forward-projecting mouthpart. Habitat is the useful field clue here — damp grassland, reedbeds, and river margins rather than dry parkland. Check ankles and dogs' legs after walking off-path in wet ground. This is educational identification, not a lab ID.",
  },
  {
    slug: "passerine-tick",
    name: "Passerine tick",
    latinName: "Dermacentor frontalis",
    riskLevel: "low",
    description:
      "The source dataset uses Passerine tick for Dermacentor frontalis and associates these records with songbirds. Dermacentor ticks are the ornate ticks: the scutum often carries a pale pattern.",
    identificationTips:
      "Look for a decorated scutum (light mottling on the shield) rather than the plain shield of Ixodes. The dataset links this species to passerine birds, so garden and woodland records near bird activity fit the label. A photo of the scutum is the useful detail to submit. Do not treat a pattern match as a confirmed identification.",
  },
  {
    slug: "southern-rodent-tick",
    name: "Southern rodent tick",
    latinName: "Ixodes acuminatus",
    riskLevel: "medium",
    description:
      "A rodent-associated Ixodes tick. The scientific name acuminatus refers to a pointed shape of the palps. The dataset's common name, Southern rodent tick, matches where this species is more often discussed in Britain.",
    identificationTips:
      "Plain Ixodes scutum, with relatively pointed palps compared with the sheep tick. Typical hosts are small rodents, so records cluster where mice and voles are active: hedges, rough grass, and garden edges. People usually meet it indirectly, via pets that hunt small mammals. Photograph both the dorsal shield and the mouthparts if you can.",
  },
  {
    slug: "tree-hole-tick",
    name: "Tree-hole tick",
    latinName: "Ixodes arboricola",
    riskLevel: "low",
    description:
      "A bird-associated tick that lives in tree cavities used as nest holes. The source dataset calls Ixodes arboricola the Tree-hole tick.",
    identificationTips:
      "Another plain Ixodes tick. The habitat clue is arboreal: old trees, nest boxes, and woodland with cavity-nesting birds, rather than open lawn. It is less often found questing at ankle height than the classic sheep tick. Note the setting when you report a sighting. This page helps you describe what you saw; it does not replace expert identification.",
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
