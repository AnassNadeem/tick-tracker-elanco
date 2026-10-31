import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Prevention",
  description: "Practical steps to prevent tick bites on people and pets, how to remove a tick safely, and when to get help.",
};

function Icon({ children }: { children: ReactNode }) {
  return (
    <span className="tip-icon" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </span>
  );
}

const TIPS: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: "Cover up on walks",
    body: "Stay on the path, tuck trousers into socks, and wear lighter colours so a tick is easier to spot.",
    icon: (
      <>
        <path d="M8 3l4 2 4-2 3 4-3 2v10H8V9L5 7z" />
      </>
    ),
  },
  {
    title: "Check skin and pets the same day",
    body: "Check ankles, knees, groin, scalp, and a dog's collar and toes the day you get home.",
    icon: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </>
    ),
  },
  {
    title: "Remove a tick with a tool",
    body: "Grip close to the skin with a tick tool or fine tweezers and pull straight out. Then clean the bite.",
    icon: (
      <>
        <path d="M14 4l6 6-9 9-4 1 1-4z" />
        <path d="M11 7l6 6" />
      </>
    ),
  },
  {
    title: "Ask a vet about pet protection",
    body: "A vet can recommend a product for dogs. Do not use a dog product on a cat.",
    icon: (
      <>
        <circle cx="5.5" cy="12.5" r="1.6" />
        <circle cx="9.5" cy="7.5" r="1.6" />
        <circle cx="14.5" cy="7.5" r="1.6" />
        <circle cx="18.5" cy="12.5" r="1.6" />
        <path d="M8 16c0-2.2 1.8-4 4-4s4 1.8 4 4a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3z" />
      </>
    ),
  },
  {
    title: "Keep grass short",
    body: "Mow the lawn and clear long grass and leaf litter where ticks wait.",
    icon: (
      <>
        <path d="M4 20h16" />
        <path d="M7 20V10l3 3 2-6 2 6 3-3v10" />
      </>
    ),
  },
  {
    title: "Carry a tick remover",
    body: "Keep a tick tool in the walking kit so you can remove one the same day.",
    icon: (
      <>
        <path d="M8 4h8v4H8z" />
        <path d="M10 8v9a2 2 0 0 0 4 0V8" />
      </>
    ),
  },
  {
    title: "Shower and check the same day",
    body: "Shower after a countryside walk. A tick is easier to see on clean skin.",
    icon: (
      <>
        <path d="M8 4h8" />
        <path d="M12 4v3" />
        <path d="M9 10c0 4 6 4 6 8" />
        <path d="M7 14c.4 3 2 5 5 5s4.6-2 5-5" />
      </>
    ),
  },
  {
    title: "Know when to get help",
    body: "Contact a GP or NHS 111 if you feel unwell after a bite. Contact a vet if a pet is lethargic or the bite looks infected.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8h.01M11 12h1v4h1" />
      </>
    ),
  },
];

const READING = [
  {
    href: "https://www.nhs.uk/conditions/lyme-disease/",
    title: "Ticks and Lyme disease",
    source: "NHS",
  },
  {
    href: "https://www.gov.uk/government/publications/tick-bite-risks-and-prevention-of-lyme-disease",
    title: "Tick bite risks and prevention",
    source: "UK Health Security Agency (GOV.UK)",
  },
  {
    href: "https://www.esccapuk.org.uk/",
    title: "Tick control advice for pets",
    source: "ESCCAP UK & Ireland",
  },
  {
    href: "https://www.bluecross.org.uk/advice/dog/health-and-injuries/ticks-on-dogs",
    title: "Ticks on dogs",
    source: "Blue Cross",
  },
  {
    href: "https://www.elanco.com/en-gb",
    title: "Preventive pet health",
    source: "Elanco UK",
  },
];

export default function PreventionPage() {
  return (
    <div className="page">
      <div className="page-header">
        <span className="eyebrow-badge">Stay safe</span>
        <h1>Prevent tick bites</h1>
        <p className="lede">
          Cover up, check the same day, and ask a vet about protection for pets.
        </p>
      </div>

      <div className="tip-grid">
        {TIPS.map((tip) => (
          <article key={tip.title} className="tip-card">
            <Icon>{tip.icon}</Icon>
            <h2>{tip.title}</h2>
            <p>{tip.body}</p>
          </article>
        ))}
      </div>

      <section className="further-reading" aria-labelledby="reading-title">
        <h2 id="reading-title">Further reading</h2>
        <p className="help">Trusted sources for tick and Lyme disease advice in the UK.</p>
        <ul className="link-list">
          {READING.map((item) => (
            <li key={item.href}>
              <a href={item.href} target="_blank" rel="noreferrer">
                <span>
                  {item.title}
                  <span className="src"> &middot; {item.source}</span>
                </span>
                <span aria-hidden="true">&#8599;</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
