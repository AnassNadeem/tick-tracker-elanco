import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prevention",
};

const TIPS = [
  {
    title: "Cover up on walks",
    body: "Ticks wait on tall grass and undergrowth. Keep to the middle of the path, wear long trousers tucked into socks, and choose lighter colours so a tick is easier to see.",
  },
  {
    title: "Check skin and pets the same day",
    body: "Look at ankles, behind knees, the groin, the scalp, and under a dog's collar and between the toes. A tick is easier to remove before it has been attached for long.",
  },
  {
    title: "Remove a tick with a tool",
    body: "Use a tick remover or fine tweezers. Grip close to the skin and pull straight out, slowly. Do not crush the body, burn it, or cover it with oil. Clean the bite afterwards.",
  },
  {
    title: "Ask a vet about pet protection",
    body: "Dogs that investigate dens, hedges, and long grass are the pets most often in this dataset's habitats. A vet can recommend a product. Do not use a dog product on a cat.",
  },
  {
    title: "Know when to get help",
    body: "Speak to a GP or NHS 111 if you feel unwell after a bite, or if a rash spreads. Speak to a vet if a pet is lethargic or the bite looks infected. This page is general public guidance, not a diagnosis.",
  },
];

export default function PreventionPage() {
  return (
    <div className="page">
      <h1>Prevention</h1>
      <p className="lede">
        Most tick bites are avoided by covering skin, checking afterwards, and treating pets with
        something a vet has recommended.
      </p>
      <div className="card-grid">
        {TIPS.map((tip) => (
          <article key={tip.title} className="card">
            <h2>{tip.title}</h2>
            <p>{tip.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
