import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { officialLinks } from "./data/config";
import { AnalyticsSettings } from "./services/analytics";

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
  sizes = "(max-width: 700px) 100vw, 50vw",
}: {
  name: string;
  alt: string;
  className?: string;
  eager?: boolean;
  sizes?: string;
}) {
  return (
    <img
      className={className}
      src={`/images/${name}-960.webp`}
      srcSet={[480, 960, 1600]
        .map((w) => `/images/${name}-${w}.webp ${w}w`)
        .join(", ")}
      sizes={sizes}
      alt={alt}
      width="1600"
      height="1200"
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      decoding="async"
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
}: {
  children?: React.ReactNode;
  experience?: string;
  location?: string;
  className?: string;
}) {
  const q = new URLSearchParams();
  if (experience) q.set("experience", experience);
  if (location) q.set("location", location);
  return (
    <Link className={className} to={`/book${q.size ? "?" + q : ""}`}>
      {children}
    </Link>
  );
}
const routeTitles: Record<string, string> = {
  "/": "A little further from the everyday.",
  "/experiences": "Find your kind of outside.",
  "/experiences/shoreline-fishing": "Shoreline Fishing in Ontario",
  "/experiences/ice-fishing": "Guided Ice Fishing on Lake Simcoe",
  "/explore": "An atlas of good days.",
  "/about": "Meet your guide",
  "/book": "Request your adventure",
  "/privacy": "Privacy & your information",
};
export function Layout() {
  const { pathname } = useLocation();
  const [menu, setMenu] = useState(false);
  const previous = useRef(pathname);
  const photoHeader =
    pathname === "/" ||
    pathname.startsWith("/experiences/") ||
    pathname === "/about";
  useEffect(() => {
    document.title = `fishn — ${routeTitles[pathname] ?? "Explore Ontario"}`;
    if (previous.current !== pathname) {
      window.scrollTo(0, 0);
      document
        .querySelector<HTMLElement>("main h1")
        ?.focus({ preventScroll: true });
      previous.current = pathname;
    }
  }, [pathname]);
  useEffect(() => {
    if (!menu) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        document.getElementById("menu-toggle")?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menu]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header
        className={`header ${photoHeader ? "header-photo" : ""} ${menu ? "menu-open" : ""}`}
      >
        <Link
          to="/"
          className="wordmark"
          aria-label="fishn home"
          onClick={() => setMenu(false)}
        >
          fishn<span className="brand-dot">.</span>
        </Link>
        <nav
          aria-label="Main navigation"
          id="main-navigation"
          className={menu ? "is-open" : ""}
        >
          <NavLink to="/experiences" onClick={() => setMenu(false)}>
            Experiences
          </NavLink>
          <NavLink to="/explore" onClick={() => setMenu(false)}>
            Explore Ontario
          </NavLink>
          <NavLink to="/about" onClick={() => setMenu(false)}>
            Our story
          </NavLink>
          <BookLink className="mobile-nav-book">Plan your day</BookLink>
        </nav>
        <BookLink className="button nav-book">Plan your day</BookLink>
        <button
          id="menu-toggle"
          className="menu-toggle"
          onClick={() => setMenu(!menu)}
          aria-expanded={menu}
          aria-controls="main-navigation"
        >
          {menu ? "Close" : "Menu"}
          <span aria-hidden="true">{menu ? "−" : "+"}</span>
        </button>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="footer-top">
          <Link className="wordmark" to="/">
            fishn<span className="brand-dot">.</span>
          </Link>
          <p>A little closer to what matters.</p>
          <Horizon />
        </div>
        <div className="footer-bottom">
          <span>Ontario, Canada · Outside, together.</span>
          <div>
            <External href={officialLinks.instagram}>Instagram</External>
            <Link to="/privacy">Privacy</Link>
            <AnalyticsSettings />
          </div>
          <span>© {new Date().getFullYear()} fishn</span>
        </div>
      </footer>
    </>
  );
}
export function Invitation() {
  return (
    <section className="invitation section-pad">
      <Horizon />
      <p className="eyebrow">SOME DAYS STAY WITH YOU</p>
      <h2>
        Let’s make one
        <br />
        of those days.
      </h2>
      <BookLink>Request your adventure</BookLink>
      <p className="small">A request first. The details, together.</p>
    </section>
  );
}
