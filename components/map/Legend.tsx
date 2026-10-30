const SPECIES_MARKS: Record<string, { shape: string; letter: string }> = {
  "fox-badger-tick": { shape: "diamond", letter: "F" },
  "marsh-tick": { shape: "circle", letter: "M" },
  "passerine-tick": { shape: "triangle", letter: "P" },
  "southern-rodent-tick": { shape: "square", letter: "S" },
  "tree-hole-tick": { shape: "hex", letter: "T" },
};

export function speciesMark(slug: string) {
  return SPECIES_MARKS[slug] ?? { shape: "circle", letter: "?" };
}

export function markerHtml(input: {
  speciesSlug: string;
  severity: string | null;
  recent: boolean;
  selected: boolean;
}) {
  const mark = speciesMark(input.speciesSlug);
  const severity = input.severity ?? "unrated";
  return `<span class="tick-marker" data-shape="${mark.shape}" data-severity="${severity}" data-recent="${input.recent}" data-selected="${input.selected}"><span>${mark.letter}</span></span>`;
}

export default function Legend() {
  const items = [
    ["fox-badger-tick", "Fox/badger"],
    ["marsh-tick", "Marsh"],
    ["passerine-tick", "Passerine"],
    ["southern-rodent-tick", "Rodent"],
    ["tree-hole-tick", "Tree-hole"],
  ] as const;

  return (
    <aside className="legend" aria-label="Marker key">
      <p className="legend-title">How to read a marker</p>
      <ul>
        {items.map(([slug, label]) => (
          <li key={slug}>
            <span
              className="tick-marker legend-swatch"
              data-shape={speciesMark(slug).shape}
              data-severity="low"
              aria-hidden="true"
            >
              <span>{speciesMark(slug).letter}</span>
            </span>
            {label}
          </li>
        ))}
      </ul>
      <p>Shape and letter are the species. Colour is severity: red high, amber medium, green low, dashed grey not recorded. A pale ring means within a year of the newest sighting in this view.</p>
    </aside>
  );
}
