import { useEffect, useRef, useState } from "react";
import { BookingPage } from "./booking/BookingPage";
import { TripRates } from "./booking/TripPricing";
import { External, FocusFrame, Photo, SiteFooter } from "./components";
import { officialLinks } from "./data/config";
import { track } from "./services/analytics";

export function Journey() {
  const root = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState("intro");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setChapter(entry.target.id);
      },
      { rootMargin: "-25% 0px -55% 0px" },
    );
    root.current
      ?.querySelectorAll(":scope > section")
      .forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  return (
    <div className="booking-home" ref={root}>
      <section
        id="intro"
        className="service-hero photo-chapter"
        aria-label="Guided fishing in Ontario"
      >
        <Photo
          name="lake-simcoe"
          alt="Evening light over the fishing shoreline at Lake Simcoe"
          className="chapter-photo"
          eager
          priority
          sizes="100vw"
        />
        <div className="photo-scrim" />
        <div className="service-hero-copy">
          <h1 tabIndex={-1}>
            Guided fishing
            <br />
            <span>in Ontario.</span>
          </h1>
          <p className="service-description">
            Private sessions. Beginners welcome.
          </p>
          <a
            href="#book"
            className="button hero-plan"
            onClick={() => track("BookingEntryClicked", { placement: "hero" })}
          >
            Book a session
          </a>
        </div>
        <figure className="service-catch">
          <Photo
            name="fishinnet"
            alt="A freshly caught fish resting in a landing net"
            eager
          />
          <FocusFrame />
        </figure>
        <div className="service-hero-bottom">
          <span>GUIDED BY NIKITA</span>
          <a href="#book" aria-label="Scroll to booking">
            SCROLL <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>
      <BookingPage embedded />
      <section
        id="good-to-know"
        className="booking-answers"
        aria-labelledby="booking-answers-title"
      >
        <Photo
          name="closeupreelandmug"
          alt="A fishing reel beside the river"
          className="chapter-photo"
          sizes="100vw"
        />
        <div className="photo-scrim" />
        <h2 id="booking-answers-title">Good to know.</h2>
        <div className="booking-questions">
          <details>
            <summary>Pricing</summary>
            <TripRates />
          </details>
          <details>
            <summary>Equipment</summary>
            <p>Dress for the weather and conditions. All fishing gear and equipment is provided.</p>
          </details>
          <details>
            <summary>Licence</summary>
            <p>
              Check{" "}
              <External href={officialLinks.licence}>
                Ontario’s licence requirements.
              </External>
            </p>
          </details>
          <a className="answers-book" href="#book">
            Book a session
          </a>
        </div>
        <SiteFooter />
      </section>
      <nav className="chapter-nav" aria-label="Page sections">
        {[
          ["intro", "Introduction"],
          ["book", "Book a session"],
          ["good-to-know", "Good to know"],
        ].map(([id, label], index) => (
          <a
            key={id}
            href={"#" + id}
            aria-label={label}
            aria-current={chapter === id ? "location" : undefined}
          >
            <span aria-hidden="true">0{index + 1}</span>
            <i />
          </a>
        ))}
      </nav>
    </div>
  );
}
