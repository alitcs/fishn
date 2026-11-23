import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { CatchGallery } from "./gallery/CatchGallery";
import { Link, Outlet, useLocation } from "react-router-dom";
import { officialLinks } from "./data/config";
import { AnalyticsSettings, track } from "./services/analytics";
import photography from "./data/photography.json";

export function Horizon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 36"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 18h42M3 25c7-5 14 5 21 0s14 5 21 0M10 31c5-3 10 3 15 0s10 3 15 0M16 17a8 8 0 1 1 16 0"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M24 1v3M9 6l3 3M39 6l-3 3"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}
export function Photo({
  name,
  alt,
  className = "",
  eager = false,
  priority = false,
  onLoad,
  sizes = "(max-width: 700px) 100vw, 50vw",
  style,
}: {
  name: string;
  alt: string;
  className?: string;
  eager?: boolean;
  priority?: boolean;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  sizes?: string;
  style?: CSSProperties;
}) {
  const photo = photography[name as keyof typeof photography];
  // A tall cover crop needs enough pixels for its height, not just viewport width.
  const imageSizes =
    sizes === "100vw" && photo
      ? `(max-aspect-ratio: ${photo.width}/${photo.height}) ${Math.round((photo.width / photo.height) * 100)}vh, 100vw`
      : sizes;
  return (
    <img
      className={className}
      style={style}
      src={
        photo?.sources.find((source) => source.width >= 960)?.src ??
        photo?.sources.at(-1)?.src ??
        `/images/${name}-960.webp`
      }
      srcSet={photo?.sources
        .map((source) => `${source.src} ${source.width}w`)
        .join(", ")}
      sizes={imageSizes}
      alt={alt}
      width={photo?.width ?? 1600}
      height={photo?.height ?? 1200}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      onLoad={onLoad}
    />
  );
}
export const External = ({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <a
    className={className}
    href={href}
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
    <span className="sr-only"> (opens in a new tab)</span>
  </a>
);
export function BookLink({
  children = "Plan your day",
  experience,
  location,
  className = "button",
  source,
}: {
  children?: React.ReactNode;
  experience?: string;
  location?: string;
  className?: string;
  source?: string;
}) {
  const q = new URLSearchParams();
  if (experience) q.set("experience", experience);
  if (location) q.set("location", location);
  return (
    <Link
      className={className}
      to={`/book${q.size ? "?" + q : ""}`}
      onClick={() => {
        if (source) track("BookingEntryClicked", { placement: source });
      }}
    >
      {children}
    </Link>
  );
}
export function FocusFrame({ className = "" }: { className?: string }) {
  return (
    <div className={`focus-frame ${className}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
      <span className="focus-cross" />
    </div>
  );
}

export function ChapterNote({
  index,
  title,
  detail = "ONTARIO / CANADA",
}: {
  index: string;
  title: string;
  detail?: string;
}) {
  return (
    <div className="chapter-note">
      <span>
        {index} / {title}
      </span>
      <span>{detail}</span>
    </div>
  );
}
const routeTitles: Record<string, string> = {
  "/": "Private guided fishing in Ontario",
  "/experiences": "Find your kind of outside.",
  "/experiences/shoreline-fishing": "Shoreline Fishing in Ontario",
  "/experiences/ice-fishing": "Guided Ice Fishing on Lake Simcoe",
  "/explore": "An atlas of good days.",
  "/about": "Meet your guide",
  "/book": "Plan your fishing session",
  "/privacy": "Privacy & your information",
};
export function Layout() {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const { pathname } = useLocation();
  const previous = useRef(pathname);
  const photoHeader = pathname !== "/privacy";
  useEffect(() => {
    document.title = `fishn — ${routeTitles[pathname] ?? "Explore Ontario"}`;
    document.documentElement.classList.toggle("home-snap", pathname === "/");
    if (previous.current !== pathname) {
      window.scrollTo(0, 0);
      document
        .querySelector<HTMLElement>("main h1")
        ?.focus({ preventScroll: true });
      previous.current = pathname;
    }
  }, [pathname]);
  return (
    <div className={`site-shell ${pathname === "/" ? "is-home" : ""}`}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header
        className={`header journey-header ${photoHeader ? "header-photo" : ""}`}
      >
        <Link to="/" className="wordmark" aria-label="fishn home">
          fishn<span className="brand-dot">.</span>
        </Link>
        <nav aria-label="Main navigation" className="journey-nav">
          <button
            type="button"
            className="gallery-open"
            onClick={() => setGalleryOpen(true)}
            aria-haspopup="dialog"
            aria-label="Open catch gallery"
          >
            <span>Journal</span>
            <span aria-hidden="true">+</span>
          </button>
          {pathname === "/" ? (
            <a
              className="journey-book"
              href="#book"
              onClick={() =>
                track("BookingEntryClicked", { placement: "header" })
              }
            >
              Book
            </a>
          ) : pathname === "/book" ? null : (
            <BookLink className="journey-book">
              Book
            </BookLink>
          )}
        </nav>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <CatchGallery open={galleryOpen} onClose={() => setGalleryOpen(false)} />
      {pathname !== "/" && <SiteFooter />}
    </div>
  );
}
export function SiteFooter() {
  return (
      <footer className="footer">
        <div className="footer-bottom">
          <Link className="wordmark" to="/">
            fishn.
          </Link>
          <span>Ontario, Canada · Outside, together.</span>
          <div>
            <External href={officialLinks.instagram}>Instagram</External>
            <Link to="/privacy">Privacy</Link>
            <AnalyticsSettings />
          </div>
          <span>© {new Date().getFullYear()} fishn</span>
        </div>
      </footer>
  );
}
export function Invitation() {
  return (
    <section className="invitation photo-chapter">
      <Photo
        name="waterlandscape"
        alt="Evening light settling over a quiet forest lake"
        className="chapter-photo"
        sizes="100vw"
      />
      <div className="photo-scrim" />
      <ChapterNote index="06" title="SOMETHING TO LOOK FORWARD TO" />
      <div className="invitation-content">
        <p className="eyebrow">SOME DAYS STAY WITH YOU.</p>
        <h2>
          Let’s make
          <br />
          <em>one of those days.</em>
        </h2>
        <BookLink>
          Request your adventure <span aria-hidden="true">+</span>
        </BookLink>
        <p className="small">A request first. The details, together.</p>
      </div>
      <span className="invitation-signoff eyebrow">
        A LITTLE CLOSER TO WHAT MATTERS.
      </span>
    </section>
  );
}
