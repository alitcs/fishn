import { useState } from "react";
import { Journey } from "./Journey";
import { Link, useParams } from "react-router-dom";
import { Atlas, WaterOutline } from "./Atlas";
import {
  BookLink,
  ChapterNote,
  External,
  FocusFrame,
  Horizon,
  Invitation,
  Photo,
} from "./components";
import { experiences, officialLinks } from "./data/config";
import { locations, mapsUrl } from "./data/locations";
import geography from "./data/geography.json";
import { TripRates } from "./booking/TripPricing";

export function ExperiencePair({ page = false }: { page?: boolean }) {
  return (
    <div className="experience-chapters">
      {experiences.map((experience, i) => {
        const ice = i === 1;
        return (
          <section
            className={`photo-chapter experience-chapter ${ice ? "ice-chapter" : "shore-chapter"} ${page && !ice ? "experience-opening" : ""}`}
            key={experience.id}
          >
            <Photo
              name={ice ? "Lake-simcoe-ice" : "HollandRiver"}
              alt={
                ice
                  ? experience.alt
                  : "Clouds reflected in the calm, tree-lined Holland River"
              }
              className="chapter-photo"
              sizes="100vw"
              eager={page && !ice}
            />
            <div className="photo-scrim" />
            <ChapterNote
              index={ice ? "02" : "01"}
              title={
                ice
                  ? "A DIFFERENT KIND OF STILL"
                  : "THE SIMPLE PLEASURE OF BEING HERE"
              }
              detail={ice ? "LAKE SIMCOE / WINTER" : "RIVERS & LAKES / ONTARIO"}
            />
            {page && !ice && (
              <div className="experience-page-heading">
                <p className="eyebrow">PRIVATE DAYS. OPEN POSSIBILITIES.</p>
                <h1 tabIndex={-1}>
                  Find your kind
                  <br />
                  <em>of outside.</em>
                </h1>
              </div>
            )}
            <div className="experience-composition">
              <div className="experience-panel">
                <div className="experience-panel-copy">
                  <p className="eyebrow">
                    {ice
                      ? "THE WINTER EDITION"
                      : "NO EXPERIENCE. JUST CURIOSITY."}
                  </p>
                  <h2>
                    {ice ? "ICE" : "SHORELINE"}
                    <br />
                    FISHING.
                  </h2>
                  <div className="fine-rule" />
                  <p>{experience.description}</p>
                  <div className="experience-panel-actions">
                    <Link
                      to={`/experiences/${experience.id}`}
                      className="text-link"
                      aria-label={experience.short}
                    >
                      Explore the experience <span aria-hidden="true">+</span>
                    </Link>
                    <BookLink experience={experience.id} className="text-link">
                      Book {ice ? "ice" : "shoreline"}
                    </BookLink>
                  </div>
                </div>
                <figure className="experience-inset">
                  <span className="eyebrow">
                    {ice ? "BENEATH THE SURFACE" : "THE LITTLE THINGS"}
                  </span>
                  <Photo
                    name={ice ? "icefishingtail" : "closeupreelandmug"}
                    alt={
                      ice
                        ? "A fish fin resting against textured ice"
                        : experience.alt
                    }
                  />
                  <figcaption>OUTSIDE, TOGETHER.</figcaption>
                </figure>
              </div>
              <p className="experience-footnote eyebrow">
                {ice
                  ? "A NEW PERSPECTIVE. SAME SENSE OF WONDER."
                  : "A CAST. A CONVERSATION. NOTHING ELSE TO BE."}
              </p>
            </div>
            {ice && (
              <span className="ice-coordinate eyebrow">
                {geography.features["lake-simcoe"].coordinate}
                <br />
                GEOGRAPHIC REFERENCE
              </span>
            )}
            <div className="chapter-bottom">
              <span>PRIVATE / GUIDED BY NIKITA</span>
              <span>BEGINNERS WELCOME</span>
              <span>{ice ? "02" : "01"} / 02</span>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function Home() {
  return <Journey />;
}

export function GuideSection() {
  return (
    <section className="guide-section photo-chapter">
      <Photo
        name="closeupreelandmug"
        alt="A fishing reel and a green mug on a rock beside the river"
        className="chapter-photo focus-soft"
        sizes="100vw"
      />
      <Photo
        name="closeupreelandmug"
        alt=""
        className="chapter-photo focus-sharp"
        sizes="100vw"
      />
      <div className="photo-scrim" />
      <ChapterNote index="05" title="LOCAL KNOWLEDGE. GOOD COMPANY." />
      <div className="guide-focus">
        <FocusFrame />
        <span className="eyebrow">
          THE LITTLE THINGS
          <br />
          MAKE THE DAY.
        </span>
      </div>
      <div className="guide-copy">
        <p className="eyebrow">NIKITA / YOUR GUIDE</p>
        <h2>
          Your outside
          <br />
          <em>person.</em>
        </h2>
        <p>
          A local outdoorsman with a love for Ontario’s lakes and rivers. From
          the shoreline to the ice, Nikita brings hands-on fishing knowledge and
          a connection to the places he explores.
        </p>
        <p>
          First cast or one of many, there’s always something new to notice.
        </p>
        <Link to="/about" className="text-link">
          A little more about Nikita <span aria-hidden="true">+</span>
        </Link>
        <External href={officialLinks.instagram} className="instagram-link">
          @nikita.troff
        </External>
      </div>
    </section>
  );
}

export function ExperiencesPage() {
  return (
    <>
      <ExperiencePair page />
      <section className="simple-notes photo-chapter">
        <Photo
          name="Nottawasaga-River"
          alt="Light breaking through clouds over a tree-lined river"
          className="chapter-photo"
          sizes="100vw"
        />
        <div className="photo-scrim" />
        <h2>
          Your first cast
          <br />
          <em>starts here.</em>
        </h2>
        <div>
          <p>
            Beginners are welcome on both experiences. Tell us who’s coming,
            where you’d like to go, and your preferred date. Nikita will follow
            up to talk through the details, equipment, and pricing.
          </p>
          <p>
            Every outing is private and requested first. The final plan depends
            on the season, conditions, permissions, and applicable fishing
            rules.
          </p>
          <BookLink>
            Plan your day <span aria-hidden="true">+</span>
          </BookLink>
        </div>
      </section>
      <Invitation />
    </>
  );
}

const photoAlt: Record<string, string> = {
  fishinnet: "Close-up of a catch resting in a landing net",
  waterlandscape: "Pink evening clouds reflected on a forest-framed lake",
  fishonrock: "A catch resting beside a blue lake",
  lure: "A green fishing lure suspended against a dark background",
  icefishinglandscape: "A fiery winter sunset above a snow-covered shore",
  monsterfish1: "An angler with a catch on a frozen lake",
  icefishingtail: "Intricate texture of a fish fin against the ice",
  icefishinglandscape1:
    "An angler’s light illuminating a frozen lake at blue hour",
  icefishtail: "Gold and olive fin details on ice",
  monsterheadfish1: "An angler showing a catch on the ice",
  icefishinglandscape2:
    "Tracks crossing an open frozen landscape beneath blue sky",
  icefishtail3: "The mottled patterns of a fish against ice",
  monsterfish: "An angler holding a catch after dark",
  monsterfish2: "An angler with a catch on a winter night",
  monsterfish3: "A quiet close-up of an angler holding a fish",
  winterpath: "A narrow trail through snow-dusted pine trees",
};

function PhotoJournal({ photos }: { photos: string[] }) {
  const [active, setActive] = useState(0);
  return (
    <section className="journal photo-chapter" aria-label="Photo journal">
      <div className="journal-images">
        {photos.map((name, i) => (
          <Photo
            key={name}
            name={name}
            alt={
              i === active
                ? (photoAlt[name] ?? "A moment from a fishing day outdoors")
                : ""
            }
            className={`chapter-photo ${i === active ? "is-active" : ""}`}
            sizes="100vw"
          />
        ))}
      </div>
      <div className="photo-scrim" />
      <ChapterNote index="JOURNAL" title="MOMENTS FROM THE WATER" />
      <h2>
        The days
        <br />
        <em>we bring home.</em>
      </h2>
      <div className="journal-caption" aria-live="polite">
        <span className="eyebrow">
          {String(active + 1).padStart(2, "0")} /{" "}
          {String(photos.length).padStart(2, "0")}
        </span>
        <p>{photoAlt[photos[active]]}</p>
      </div>
      <div className="journal-index" aria-label="Choose a journal photograph">
        {photos.map((name, i) => (
          <button
            key={name}
            type="button"
            aria-label={`View photograph ${i + 1}: ${photoAlt[name]}`}
            aria-pressed={active === i}
            onClick={() => setActive(i)}
          >
            {String(i + 1).padStart(2, "0")}
          </button>
        ))}
      </div>
    </section>
  );
}

export function ExperienceDetail() {
  const { slug } = useParams();
  const experience = experiences.find((e) => e.id === slug);
  if (!experience) return <NotFound />;
  const ice = experience.id === "ice-fishing";
  return (
    <>
      <section
        className={`detail-hero photo-chapter ${ice ? "detail-ice" : "detail-shore"}`}
      >
        <Photo
          name={ice ? "Lake-simcoe-ice" : "waterlandscape1"}
          alt={
            ice
              ? experience.alt
              : "A quiet forest lake beneath a wide cloud-filled sky"
          }
          eager
          sizes="100vw"
          className="chapter-photo"
        />
        <div className="photo-scrim" />
        <div className="detail-hero-content">
          <p className="eyebrow">
            PRIVATE GUIDED {ice ? "ICE" : "SHORELINE"} FISHING / ONTARIO
          </p>
          <h1 tabIndex={-1}>
            {ice ? (
              <>
                Winter has
                <br />
                <em>a quieter side.</em>
              </>
            ) : (
              <>
                Find your own
                <br />
                <em>kind of quiet.</em>
              </>
            )}
          </h1>
          <BookLink experience={experience.id}>
            Request {experience.name.toLowerCase()}{" "}
            <span aria-hidden="true">+</span>
          </BookLink>
        </div>
        <FocusFrame className="detail-focus" />
        <div className="chapter-bottom">
          <span>BEGINNERS WELCOME</span>
          <span>YOUR DAY, AT YOUR PACE.</span>
        </div>
      </section>
      <section className="experience-overview photo-chapter">
        <Photo
          name={ice ? "icefishinglandscape1" : "closeupreelandmug"}
          alt={ice ? photoAlt.icefishinglandscape1 : experience.alt}
          className="chapter-photo"
          sizes="100vw"
        />
        <div className="photo-scrim" />
        <div>
          <p className="eyebrow">{experience.name}</p>
          <h2>{experience.short}</h2>
        </div>
        <div className="overview-copy">
          <p className="large-copy">{experience.description}</p>
          <p>
            {ice
              ? "Trade the familiar for a wide, winter horizon. Learn a new way to fish with a local guide, and make a little space for the unexpected."
              : "Learn the feel of a cast, settle in beside the water, and discover the small things you miss when you’re moving too fast."}
          </p>
          <div className="experience-facts">
            <div>
              <span>THE COMPANY</span>
              <p>Private, guided by Nikita</p>
            </div>
            <div>
              <span>THE PACE</span>
              <p>2, 4, 6, or 8 hour trips</p>
            </div>
            <div>
              <span>THE KNOW-HOW</span>
              <p>Beginners welcome</p>
            </div>
            <div>
              <span>THE PLACE</span>
              <p>{ice ? "Lake Simcoe" : "Three Ontario service areas"}</p>
            </div>
          </div>
          {ice && (
            <p className="conditions-note">
              Ice fishing is offered only on Lake Simcoe, subject to appropriate
              seasons, suitable ice conditions, permissions, and Nikita’s
              approval. A requested date does not indicate safe ice or a
              reserved trip.
            </p>
          )}
          <BookLink experience={experience.id}>
            Let’s plan your day <span aria-hidden="true">+</span>
          </BookLink>
        </div>
      </section>
      <section className="experience-places photo-chapter">
        <Photo
          name={ice ? "Lake-simcoe-ice" : "HollandRiver"}
          alt={
            ice
              ? "A wide frozen Lake Simcoe beneath a pale winter sky"
              : "Clouds reflected along the Holland River"
          }
          className="chapter-photo"
          sizes="100vw"
        />
        <div className="photo-scrim" />
        <div>
          <p className="eyebrow">A CHANGE OF SCENERY</p>
          <h2>{ice ? "A new side of Simcoe." : "A few places to begin."}</h2>
        </div>
        <nav aria-label="Experience locations">
          {locations
            .filter((l) => experience.locations.includes(l.id))
            .map((l) => (
              <Link
                className="place-preview"
                key={l.id}
                to={`/explore/${l.id}`}
              >
                <span>{l.name}</span>
                <span aria-hidden="true">+</span>
              </Link>
            ))}
        </nav>
      </section>
      <PhotoJournal key={experience.id} photos={experience.journal} />
      <section className="faq photo-chapter">
        <Photo
          name={ice ? "winterpath" : "waterlandscape"}
          alt={ice ? photoAlt.winterpath : photoAlt.waterlandscape}
          className="chapter-photo"
          sizes="100vw"
        />
        <div className="photo-scrim" />
        <h2>
          A little
          <br />
          <em>before you go.</em>
        </h2>
        <div>
          <details>
            <summary>Is this a good first fishing experience?</summary>
            <p>
              Yes. Beginners are welcome. Nikita will help you get comfortable
              and learn at your own pace.
            </p>
          </details>
          <details>
            <summary>What should I bring?</summary>
            <p>
              Dress for the conditions and bring any required fishing licence
              and identification. All fishing gear and equipment is provided.
              Nikita will confirm the exact plan with you before the trip.
            </p>
          </details>
          <details>
            <summary>How much does it cost?</summary>
            <TripRates experience={experience.id} />
          </details>
          <details>
            <summary>Is my date confirmed when I request it?</summary>
            <p>
              No. Your date is a preference. Nikita reviews the season,
              conditions, permissions, and regulations before agreeing a plan
              with you. Catches are never guaranteed.
            </p>
          </details>
        </div>
      </section>
      <Invitation />
    </>
  );
}

export function ExplorePage() {
  return (
    <>
      <Atlas full />
      <section className="map-explanation photo-chapter">
        <Photo
          name="HollandRiver"
          alt="Trees and sky reflected in the Holland River"
          className="chapter-photo"
          sizes="100vw"
        />
        <div className="photo-scrim" />
        <Horizon />
        <div>
          <p className="eyebrow">LEAVE IT AS YOU FOUND IT.</p>
          <h2>
            Good places deserve
            <br />
            <em>a little care.</em>
          </h2>
          <p>
            These are general service areas. Nikita selects the exact meeting
            point after reviewing your request. Seasons, fish sanctuaries,
            access permissions, and local restrictions shape every outing.
          </p>
          <External className="text-link" href={officialLinks.regulations}>
            Read Ontario’s fishing regulations
          </External>
        </div>
      </section>
      <Invitation />
    </>
  );
}

export function LocationDetail() {
  const { slug } = useParams();
  const place = locations.find((l) => l.id === slug);
  if (!place) return <NotFound />;
  return (
    <>
      <section className="location-hero photo-chapter">
        <Photo
          name={place.image}
          alt={place.alt}
          eager
          sizes="100vw"
          className="chapter-photo"
        />
        <div className="photo-scrim" />
        <div className="location-title">
          <Link className="text-link" to="/explore">
            Back to the field atlas
          </Link>
          <p className="eyebrow">{place.region}</p>
          <h1 tabIndex={-1}>{place.name}</h1>
          <p className="coordinate">
            {geography.features[place.id].coordinate}
            <br />
            <span>Geographic reference only</span>
          </p>
          <BookLink location={place.id}>
            Request a day here <span aria-hidden="true">+</span>
          </BookLink>
        </div>
        <div className="location-hero-outline">
          <WaterOutline id={place.id} />
          <External href="https://www.openstreetmap.org/copyright">
            © OpenStreetMap contributors
          </External>
        </div>
        <div className="chapter-bottom">
          <span>ONTARIO / CANADA</span>
          <span>{place.intro}</span>
        </div>
      </section>
      <section className="location-editorial photo-chapter">
        <Photo
          name={place.image}
          alt=""
          className="chapter-photo"
          sizes="100vw"
        />
        <div className="photo-scrim" />
        <h2>{place.intro}</h2>
        <div>
          <p className="large-copy">{place.description}</p>
          <dl>
            {place.facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="small">
            Location information:{" "}
            <External href={place.source}>{place.sourceName}</External>
          </p>
          <div className="location-actions">
            <BookLink location={place.id}>Request a day here</BookLink>
            <External href={mapsUrl(place.maps)} className="text-link">
              View on Google Maps
            </External>
          </div>
          <p className="small">
            Google Maps opens the general geographic feature. Your meeting point
            is arranged by Nikita. Regulations, sanctuary boundaries,
            permissions, and conditions must be reviewed for the exact trip.
          </p>
          <External href={officialLinks.regulations} className="text-link">
            Official fishing regulations
          </External>
        </div>
      </section>
      <Invitation />
    </>
  );
}

export function AboutPage() {
  return (
    <>
      <section className="detail-hero about-hero photo-chapter">
        <Photo
          name="winterpath"
          alt="A path inviting you into a snow-covered Ontario forest"
          eager
          sizes="100vw"
          className="chapter-photo"
        />
        <div className="photo-scrim" />
        <div className="detail-hero-content">
          <p className="eyebrow">A LOCAL GUIDE. A SHARED LOVE OF OUTSIDE.</p>
          <h1 tabIndex={-1}>
            Good days begin
            <br />
            <em>with good company.</em>
          </h1>
        </div>
        <div className="chapter-bottom">
          <span>A WAY BACK TO OUTSIDE.</span>
          <span>THE FISHN STORY</span>
        </div>
      </section>
      <GuideSection />
      <section className="simple-notes photo-chapter">
        <Photo
          name="waterlandscape1"
          alt="Pine trees reflected in a still lake"
          className="chapter-photo"
          sizes="100vw"
        />
        <div className="photo-scrim" />
        <h2>
          A little knowledge.
          <br />
          <em>A lot to discover.</em>
        </h2>
        <div>
          <p>
            fishn grew around something simple: time outdoors feels different
            when you have someone to share it with.
          </p>
          <p>
            Nikita knows Ontario’s lakes, rivers, fishing methods, and equipment
            through hands-on experience. Shoreline fishing and ice fishing are
            two ways he connects with those places.
          </p>
          <p>
            Each day starts with a conversation. Who’s coming? What would you
            like to try? The rest comes together from there.
          </p>
          <External className="text-link" href={officialLinks.instagram}>
            See more days outside on Instagram
          </External>
        </div>
      </section>
      <Invitation />
    </>
  );
}

export function PrivacyPage() {
  return (
    <section className="prose-page section-pad">
      <p className="eyebrow">A LITTLE TRANSPARENCY</p>
      <h1 tabIndex={-1}>Your information.</h1>
      <h2>When you request a day</h2>
      <p>
        We ask for your name, email, phone number, trip preferences, and an
        acknowledgement of the fishing licence requirements. You may also ask
        for help choosing a destination and add an optional note. This
        information is used to respond to your enquiry and arrange your
        experience. No identity documents or licence images are collected.
      </p>
      <p>
        Netlify-hosted requests are collected through Netlify Forms and can be
        delivered to the configured notification inbox. Other deployments may
        use Resend for delivery. A request is only marked submitted after the
        configured service accepts it. You can also copy your session plan and
        send it yourself through Instagram. Copying the plan does not send it.
        The business keeps the information needed to handle your enquiry;
        contact Nikita to ask about access or deletion.
      </p>
      <h2>Remembering your selections</h2>
      <p>
        This browser can remember your experience, location, group size,
        duration, date, licence acknowledgement, and destination-help choice.
        Contact information and optional notes stay in memory while you fill out
        the form and are not saved in browser storage. You can remove remembered
        selections through your browser’s site-data settings.
      </p>
      <h2>Optional analytics</h2>
      <p>
        Optional Meta analytics are off until you allow them through “Analytics
        choices” in the footer. If you consent, campaign parameters may be
        stored for this browser session and included with your request. No
        contact details are included in our analytics events. Essential-only
        mode does not load Meta tracking.
      </p>
      <h2>External links</h2>
      <p>
        Ontario, Google Maps, and Instagram open in separate tabs and follow
        their own privacy policies. Our map geometry comes from{" "}
        <External href="https://www.openstreetmap.org/copyright">
          OpenStreetMap contributors, under the ODbL
        </External>
        .
      </p>
      <h2>Get in touch</h2>
      <p>
        For questions about your information,{" "}
        <External href={officialLinks.instagram}>
          contact Nikita through Instagram
        </External>
        .
      </p>
    </section>
  );
}

export function NotFound() {
  return (
    <section className="not-found photo-chapter">
      <Photo
        name="winterpath"
        alt="A quiet path through a snowy forest"
        className="chapter-photo"
        eager
        sizes="100vw"
      />
      <div className="photo-scrim" />
      <div>
        <p className="eyebrow">A LITTLE OFF THE PATH</p>
        <h1 tabIndex={-1}>
          Let’s find our
          <br />
          <em>way back.</em>
        </h1>
        <p>That page isn’t here. Your next day outside still is.</p>
        <Link className="button" to="/">
          Back to fishn
        </Link>
      </div>
    </section>
  );
}
