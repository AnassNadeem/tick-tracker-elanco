const SPECIES_MARKS: Record<string, { shape: string; letter: string; color: string }> = {
  "fox-badger-tick": { shape: "diamond", letter: "F", color: "var(--sp-fox)" },
  "marsh-tick": { shape: "circle", letter: "M", color: "var(--sp-marsh)" },
  "passerine-tick": { shape: "triangle", letter: "P", color: "var(--sp-passerine)" },
  "southern-rodent-tick": { shape: "square", letter: "S", color: "var(--sp-rodent)" },
  "tree-hole-tick": { shape: "hex", letter: "T", color: "var(--sp-tree)" },
};

export function speciesMark(slug: string) {
  return SPECIES_MARKS[slug] ?? { shape: "circle", letter: "?", color: "var(--muted)" };
}

export function markerHtml(input: {
  speciesSlug: string;
  severity: string | null;
  recent: boolean;
  selected: boolean;
}) {
  const mark = speciesMark(input.speciesSlug);
  const severity = input.severity ?? "unrated";
  return `<span class="tick-marker" data-species="${input.speciesSlug}" data-shape="${mark.shape}" data-severity="${severity}" data-recent="${input.recent}" data-selected="${input.selected}"><span>${mark.letter}</span></span>`;
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
              data-species={slug}
              data-shape={speciesMark(slug).shape}
              data-severity="unrated"
              aria-hidden="true"
            >
              <span>{speciesMark(slug).letter}</span>
            </span>
            {label}
          </li>
        ))}
      </ul>
    </aside>
  );
}
