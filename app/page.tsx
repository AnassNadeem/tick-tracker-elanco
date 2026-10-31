import LandingInsights from "@/components/landing/LandingInsights";
import MapPreview from "@/components/landing/MapPreview";
import Image from "next/image";
import Link from "next/link";

const FEATURES = [
  {
    href: "/map",
    img: "/images/feature-map.jpg",
    alt: "Rolling English countryside",
    title: "Explore the map",
    body: "See where ticks have been reported across the UK. Filter by date, species, severity and city, with clustering for busy areas.",
    cta: "Open the map",
  },
  {
    href: "/species",
    img: "/images/species-fox-badger-tick.jpg",
    alt: "Close-up of a tick on grass",
    title: "Know your species",
    body: "A field guide to the ticks in the dataset: what they look like, where they live, and how much of a risk each one is.",
    cta: "View the guide",
  },
  {
    href: "/prevention",
    img: "/images/feature-prevention.jpg",
    alt: "Brushing a dog's coat",
    title: "Prevent bites",
    body: "Simple, practical steps to protect people and pets on walks, plus how to remove a tick safely and when to seek help.",
    cta: "Prevention tips",
  },
  {
    href: "/activity",
    img: "/images/feature-activity.jpg",
    alt: "Summer meadow with wildflowers",
    title: "Track the seasons",
    body: "Charts of sightings by month and city, so you can see when and where tick activity peaks across the year.",
    cta: "See the trends",
  },
];

const STEPS = [
  {
    title: "Spot a tick",
    body: "On a walk, on a pet, or in the garden. Note where and when you saw it.",
  },
  {
    title: "Report it",
    body: "Add the date, city and species in seconds. A photo and map pin are optional.",
  },
  {
    title: "Help the map",
    body: "Your report joins the live map and seasonal trends, helping others stay aware.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="eyebrow-badge">Elanco · preventive care</span>
            <h1>Track ticks across the UK. Protect the ones you love.</h1>
            <p>
              A community tick-sighting tracker inspired by Elanco&rsquo;s mission of healthier
              animals and healthier people. Map where ticks are active, report what you see, and
              learn how to keep people and pets safe.
            </p>
            <div className="hero-actions">
              <Link href="/report" className="btn btn-accent btn-lg">
                Report a sighting
              </Link>
              <Link href="/map" className="btn btn-ghost btn-lg">
                Explore the map
              </Link>
            </div>
          </div>
          <div className="hero-media">
            <Image
              src="/images/hero.jpg"
              alt="A happy dog in a grassy field"
              width={900}
              height={675}
              priority
            />
            <div className="hero-stat-float">
              <strong>14</strong>
              <span>UK cities &middot; 5 tick species</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section map-preview-section" aria-labelledby="preview-title">
        <div className="section-head">
          <h2 id="preview-title">Sightings across the UK</h2>
          <p>Where reports cluster, and which cities see the most.</p>
        </div>
        <div className="map-preview-split">
          <MapPreview />
          <LandingInsights />
        </div>
      </section>

      <section className="section" aria-labelledby="how-title">
        <div className="section-head">
          <h2 id="how-title">How it works</h2>
          <p>Reporting a sighting takes under a minute and makes the map better for everyone.</p>
        </div>
        <ol className="steps">
          {STEPS.map((step, index) => (
            <li className="step" key={step.title}>
              <div className="step-num" aria-hidden="true">
                {index + 1}
              </div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section" aria-labelledby="explore-title">
        <div className="section-head">
          <h2 id="explore-title">Everything in one place</h2>
          <p>Map the data, identify the species, and learn how to prevent bites.</p>
        </div>
        <div className="feature-grid">
          {FEATURES.map((feature) => (
            <Link href={feature.href} key={feature.href} className="feature-card">
              <div className="feature-media">
                <Image src={feature.img} alt={feature.alt} width={480} height={300} />
              </div>
              <div className="feature-body">
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
                <span className="feature-link">{feature.cta} &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <h2>Seen a tick? Put it on the map.</h2>
        <p>
          Every report helps build a clearer picture of tick activity across the UK. It only takes a
          moment, and no account is needed.
        </p>
        <Link href="/report" className="btn btn-accent btn-lg">
          Report a sighting
        </Link>
      </section>
    </>
  );
}
