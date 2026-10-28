import Link from "next/link";

export function LandingNavActions() {
  return (
    <div className="landing-nav-actions">
      <Link href="/sign-in" className="ghost">
        Prihlásiť sa
      </Link>
      <Link href="/sign-up" className="landing-btn landing-btn-teal">
        Vytvoriť účet
      </Link>
    </div>
  );
}

export function LandingHeroActions() {
  return (
    <div className="landing-hero-cta">
      <Link href="/sign-up" className="landing-btn">
        Začať zadarmo
      </Link>
      <Link href="/sign-in" className="landing-btn landing-btn-outline">
        Mám účet
      </Link>
    </div>
  );
}

export function LandingCtaActions() {
  return (
    <div className="landing-cta-actions">
      <Link href="/sign-up" className="landing-btn landing-btn-teal">
        Vytvoriť účet
      </Link>
      <Link href="/sign-in" className="landing-btn landing-btn-outline">
        Prihlásiť sa
      </Link>
    </div>
  );
}
