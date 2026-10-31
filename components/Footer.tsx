import CopyrightYear from "@/components/CopyrightYear";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Image
            src="/brand/elanco-logo.png"
            alt="Elanco"
            width={472}
            height={234}
            className="footer-logo"
          />
          <span className="wordmark">Tick Tracker</span>
          <p>
            A UK tick-sighting tracker inspired by Elanco&rsquo;s preventive-care mission. Map where
            ticks are seen, report your own, and learn how to protect people and pets.
          </p>
        </div>

        <div className="footer-col">
          <h3>Explore</h3>
          <ul>
            <li>
              <Link href="/map">Sightings map</Link>
            </li>
            <li>
              <Link href="/report">Report a sighting</Link>
            </li>
            <li>
              <Link href="/activity">Seasonal activity</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Learn</h3>
          <ul>
            <li>
              <Link href="/species">Species guide</Link>
            </li>
            <li>
              <Link href="/prevention">Prevention tips</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Elanco</h3>
          <ul>
            <li>
              <a href="https://www.elanco.com/en-gb" target="_blank" rel="noreferrer">
                Elanco UK
              </a>
            </li>
            <li>
              <a href="https://www.elanco.com/us" target="_blank" rel="noreferrer">
                Elanco US
              </a>
            </li>
            <li>
              <a href="https://www.nhs.uk/conditions/lyme-disease/" target="_blank" rel="noreferrer">
                NHS: Lyme disease
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p className="footer-disclaimer">
            A placement-task project by Anass Nadeem. Not an official Elanco service. Records describe
            sightings for this exercise and are not a veterinary or medical diagnosis.
          </p>
          <p>
            &copy; <CopyrightYear /> Tick Tracker
          </p>
        </div>
      </div>
    </footer>
  );
}
