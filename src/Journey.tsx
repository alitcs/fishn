import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { WaterOutline } from "./Atlas";
import { BookingPage } from "./booking/BookingPage";
import {
  BookLink,
  ChapterNote,
  External,
  FocusFrame,
  Photo,
} from "./components";
import { officialLinks } from "./data/config";
import geography from "./data/geography.json";
import { locations, mapsUrl } from "./data/locations";
import { tripScenes } from "./data/scenes";

// Native scrolling remains in charge. Only visible scenes get a small transform;
// the listener is passive and all frame work stops when it is not needed.
function useAtmosphere() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const visible = new Set<HTMLElement>();
    let frame = 0;
    const paint = () => {
      frame = 0;
      for (const scene of visible) {
        const rect = scene.getBoundingClientRect();
        const progress = Math.max(
          -1,
          Math.min(
            1,
            (innerHeight / 2 - rect.top - rect.height / 2) / innerHeight,
          ),
        );
        scene.style.setProperty(
          "--drift",
          `${motion.matches || innerWidth <= 700 ? 0 : progress * 28}px`,
        );
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const scene = entry.target as HTMLElement;
          if (entry.isIntersecting) visible.add(scene);
          else visible.delete(scene);
        });
        schedule();
      },
      { rootMargin: "100px" },
    );
    element
      .querySelectorAll<HTMLElement>("[data-atmosphere]")
      .forEach((scene) => observer.observe(scene));
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);
    return () => {
      observer.disconnect();
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      motion.removeEventListener("change", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);
  return root;
}

export function WaterJourney() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [near, setNear] = useState(false);
  const [loaded, setLoaded] = useState<number[]>([0]);
  const visible = loaded.includes(active)
    ? active
    : Math.max(0, ...loaded.filter((index) => index < active));
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    // Warm the next environment before its chapter reaches the viewport.
    const preload = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          preload.disconnect();
        }
      },
      { rootMargin: "1000px" },
    );
    preload.observe(element);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting)
            setActive(Number((entry.target as HTMLElement).dataset.scene));
        });
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 },
    );
    element
      .querySelectorAll("[data-scene]")
      .forEach((scene) => observer.observe(scene));
    return () => {
      observer.disconnect();
      preload.disconnect();
    };
  }, []);
  return (
    <section
      className="water-journey"
      id="waters"
      ref={root}
      aria-label="A journey through Ontario’s fishing waters"
      data-active-scene={tripScenes[active].id}
      data-enhanced={near}
    >
      <div className="water-stage" aria-hidden="true">
        {tripScenes.map((scene, i) => (
          <div
            key={scene.id}
            className={`water-exposure ${i === visible ? "is-active" : ""}`}
            style={{ "--focal": scene.focal } as CSSProperties}
          >
            {(i === 0 || (near && i <= active + 1)) && (
              <Photo
                name={scene.image}
                alt=""
                sizes="100vw"
                eager={near && i <= active + 1}
                onLoad={() =>
                  setLoaded((previous) =>
                    previous.includes(i) ? previous : [...previous, i],
                  )
                }
              />
            )}
            <div className="water-stage-shade" />
          </div>
        ))}
        <div className="water-stage-grain" />
        <span className="water-stage-label eyebrow">
          FIELD NOTES / ONTARIO, CANADA
        </span>
        <div className="water-stage-index eyebrow">
          {tripScenes.map((scene, i) => (
            <span key={scene.id} className={active === i ? "is-current" : ""}>
              0{i + 1}
              <i />
            </span>
          ))}
        </div>
      </div>
      <div className="water-story">
        {tripScenes.map((scene, i) => {
          const place = locations.find(
            (location) => location.id === scene.location,
          )!;
          return (
            <article
              key={scene.id}
              className={`water-scene water-scene-${i} ${active === i ? "is-current" : ""}`}
              data-scene={i}
              aria-labelledby={`scene-title-${scene.id}`}
            >
              <Photo
                name={scene.image}
                alt={scene.alt}
                className="scene-static-photo"
                sizes="100vw"
              />
              <div className="scene-copy">
                <p className="eyebrow">{scene.note}</p>
                <h2 id={`scene-title-${scene.id}`}>
                  {scene.title[0]}
                  <br />
                  <span>{scene.title[1]}</span>
                </h2>
                <p>{scene.copy}</p>
              </div>
              <div className="scene-cartography">
                <div className="scene-map-heading eyebrow">
                  <span>{place.name}</span>
                  <span>N ↑</span>
                </div>
                <WaterOutline id={scene.location} />
                <p className="eyebrow">
                  {geography.features[scene.location].coordinate}
                  <br />
                  <span>
                    {scene.experience === "ice-fishing"
                      ? "ICE FISHING / CONDITIONS APPLY"
                      : "SHORELINE FISHING"}
                  </span>
                </p>
              </div>
              <div className="scene-footnote">
                <span className="eyebrow">{place.region}</span>
                <p>
                  {i === 3
                    ? "Ice outings depend on the season, suitable ice conditions, permissions, and Nikita’s approval."
                    : place.intro}
                </p>
              </div>
              <div className="scene-source">
                <External href={mapsUrl(place.maps)}>Google Maps</External>
                <External href="https://www.openstreetmap.org/copyright">
                  © OpenStreetMap contributors
                </External>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function Journey() {
  const atmosphere = useAtmosphere();
  return (
    <div className="journey" ref={atmosphere}>
      <section
        className="arrival photo-chapter"
        data-atmosphere
        aria-label="Arrival"
      >
        <Photo
          name="lake-simcoe"
          alt="The sun slipping beneath a dramatic sky over the still waters of Lake Simcoe"
          className="chapter-photo"
          eager
          priority
          sizes="100vw"
        />
        <div className="photo-scrim arrival-shade" />
        <div className="arrival-top eyebrow">
          <span>PRIVATE GUIDED FISHING</span>
          <span>ONTARIO / CANADA</span>
        </div>
        <div className="arrival-statement">
          <p className="eyebrow">THERE’S MORE OUT THERE.</p>
          <h1 tabIndex={-1}>
            A little further
            <br />
            <span>from the everyday.</span>
          </h1>
          <p className="arrival-service">
            Private guided fishing in Ontario.
            <br />
            First cast or one of many, you’re welcome here.
          </p>
          <BookLink className="button hero-plan" source="hero">
            Plan your fishing trip <span aria-hidden="true">+</span>
          </BookLink>
          <p className="arrival-reassurance">
            Your guide, Nikita. Pricing agreed before you commit.
          </p>
        </div>
        <figure className="arrival-fishing">
          <Photo
            name="fishinnet"
            alt="A freshly caught fish resting in a landing net"
            eager
          />
          <figcaption>
            <span className="eyebrow">FOR THE FEELING OF A FIRST CATCH.</span>
            <span className="eyebrow">SHORELINE & ICE / GUIDED BY NIKITA</span>
          </figcaption>
          <FocusFrame />
        </figure>
        <div className="arrival-bottom">
          <span className="eyebrow">PRIVATE TRIPS / BEGINNERS WELCOME</span>
          <p>
            For the cast.
            <br />
            For the company.
            <br />
            For the feeling.
          </p>
          <span className="scroll-thread eyebrow">
            OR STAY A WHILE.
            <i aria-hidden="true" />
          </span>
        </div>
      </section>
      <section
        className="threshold photo-chapter"
        data-atmosphere
        aria-label="Discovery"
      >
        <Photo
          name="closeupreelandmug"
          alt="A reel, fishing rod, and a green mug beside flowing water"
          className="chapter-photo"
          sizes="100vw"
        />
        <div className="photo-scrim" />
        <p className="threshold-top eyebrow">
          LEAVE THE EVERYDAY AT THE WATER’S EDGE.
        </p>
        <div className="threshold-copy">
          <p className="eyebrow">THE WATER. THE KNOW-HOW. THE COMPANY.</p>
          <h2>
            A little guidance.
            <br />
            A better
            <br />
            <span>day fishing.</span>
          </h2>
          <p>
            You don’t need to know the water or have years of experience. Nikita
            brings local knowledge and helps you learn at your own pace.
          </p>
          <div className="early-clarity">
            <p>
              <strong>A private, guided day.</strong> Shoreline or ice fishing.
              Request 1–4 hours, on your own or with your people.
            </p>
            <p>
              <strong>Clear before you commit.</strong> Nikita discusses
              pricing, equipment arrangements, and the meeting point with you.
              No payment is taken here.
            </p>
          </div>
        </div>
        <span className="threshold-bottom eyebrow">
          A LITTLE FRESH AIR. A DIFFERENT PERSPECTIVE.
        </span>
      </section>
      <WaterJourney />
      <section
        className="day-story photo-chapter"
        data-atmosphere
        aria-label="Your fishing experience"
      >
        <Photo
          name="HollandRiver"
          alt="The calm surface and tree-lined banks of the Holland River"
          className="chapter-photo"
          sizes="100vw"
        />
        <div className="photo-scrim" />
        <ChapterNote
          index="THE EXPERIENCE"
          title="COME AS YOU ARE."
          detail="PRIVATE / GUIDED / UNHURRIED"
        />
        <div className="day-editorial">
          <div>
            <p className="eyebrow">A CAST. A CONVERSATION.</p>
            <h2>
              JUST
              <br />
              BE HERE.
            </h2>
            <div className="fine-rule" />
            <p>
              Shoreline by Ontario’s lakes and rivers. Winter on Lake Simcoe. A
              private day, with someone who knows the water.
            </p>
          </div>
          <figure>
            <Photo
              name="closeupreelandmug"
              alt="A fishing reel and a green mug resting on a riverside rock"
            />
            <figcaption className="eyebrow">
              THE LITTLE THINGS MAKE THE DAY.
            </figcaption>
          </figure>
        </div>
        <div className="day-details">
          <p>
            <span className="eyebrow">THE COMPANY</span>Private. Guided by
            Nikita.
            <br />
            First-timers welcome.
          </p>
          <p>
            <span className="eyebrow">THE PACE</span>Request 1–4 hours.
            <br />
            Come alone or bring your people.
          </p>
          <p>
            <span className="eyebrow">THE PLAN</span>Equipment, pricing, and
            meeting point
            <br />
            arranged with Nikita before your trip.
          </p>
        </div>
      </section>
      <section
        className="together-story photo-chapter"
        data-atmosphere
        aria-label="Your guide"
      >
        <Photo
          name="closeupreelandmug"
          alt="Fishing gear and a green mug beside the river"
          className="chapter-photo together-soft"
          sizes="100vw"
        />
        <Photo
          name="closeupreelandmug"
          alt=""
          className="chapter-photo together-sharp"
          sizes="100vw"
        />
        <div className="photo-scrim" />
        <div className="together-focus">
          <FocusFrame />
          <span className="eyebrow">A LITTLE LOCAL KNOWLEDGE.</span>
        </div>
        <div className="together-copy">
          <p className="eyebrow">NIKITA / YOUR FISHING GUIDE</p>
          <h2>
            Good days.
            <br />
            <span>Good company.</span>
          </h2>
          <p>
            A local outdoorsman with a love for Ontario’s lakes and rivers. A
            little hands-on knowledge, a shared curiosity, and time to take it
            all in.
          </p>
          <p>
            New to fishing? Nikita helps you get comfortable and learn at your
            pace. Before you go, he reviews your plans, the conditions,
            equipment arrangements, and pricing with you.
          </p>
          <figure className="guide-catch">
            <Photo
              name="monsterfish3"
              alt="A close-up of an angler holding a catch during a fishing trip"
            />
            <figcaption className="eyebrow">
              FROM THE FISHING JOURNAL.
            </figcaption>
          </figure>
          <BookLink className="text-link" source="guide">
            Plan a day with Nikita <span aria-hidden="true">+</span>
          </BookLink>
          <External href={officialLinks.instagram} className="guide-social">
            @nikita.troff
          </External>
        </div>
        <p className="together-signoff eyebrow">
          YOU DON’T NEED TO KNOW HOW. JUST HOW TO BE HERE.
        </p>
      </section>
      <section
        className="commitment photo-chapter"
        data-atmosphere
        aria-label="An invitation"
      >
        <Photo
          name="lake-simcoe"
          alt="Warm evening light over Lake Simcoe"
          className="chapter-photo"
          sizes="100vw"
        />
        <div className="photo-scrim" />
        <div>
          <p className="eyebrow">YOU’VE ALREADY PICTURED IT.</p>
          <h2>
            Now make
            <br />
            <span>a little room for it.</span>
          </h2>
          <p>
            A few details. A little anticipation.
            <br />
            Nikita will take it from here.
          </p>
          <div className="request-clarity">
            <p>
              <span>01</span>
              <strong>Tell us your kind of day.</strong> A few simple questions.
              No local knowledge needed.
            </p>
            <p>
              <span>02</span>
              <strong>Talk it through with Nikita.</strong> Pricing, equipment,
              conditions, and meeting point agreed directly.
            </p>
            <p>
              <span>03</span>
              <strong>Make a plan together.</strong> A request starts the
              conversation; it doesn’t reserve a date.
            </p>
          </div>
        </div>
        <span className="commitment-thread" aria-hidden="true" />
      </section>
      <BookingPage embedded />
    </div>
  );
}
