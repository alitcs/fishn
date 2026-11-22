import { Link, useParams } from "react-router-dom";
import { Atlas, WaterOutline } from "./Atlas";
import { BookLink, External, Horizon, Invitation, Photo } from "./components";
import { experiences, officialLinks } from "./data/config";
import { locations, mapsUrl } from "./data/locations";
import geography from "./data/geography.json";

export function ExperiencePair() {
  return (
    <div className="experience-pair">
      {experiences.map((experience, i) => (
        <article
          className={`experience-feature feature-${i}`}
          key={experience.id}
        >
          <Link
            className="experience-image"
            to={`/experiences/${experience.id}`}
          >
            <Photo name={experience.image} alt={experience.alt} />
            <span className="image-label">{experience.label}</span>
            <span className="image-link">
              Discover the experience<span aria-hidden="true">+</span>
            </span>
          </Link>
          <div className="experience-caption">
            <div>
              <p className="eyebrow">{experience.name}</p>
              <h3>
                <Link to={`/experiences/${experience.id}`}>
                  {experience.short}
                </Link>
              </h3>
            </div>
            <BookLink experience={experience.id} className="round-link">
              <span className="sr-only">Request {experience.name}</span>
              <span aria-hidden="true">+</span>
            </BookLink>
          </div>
          <p className="experience-description">{experience.description}</p>
        </article>
      ))}
    </div>
  );
}
export function Home() {
  return (
    <>
      <section className="hero">
        <Photo
          name="waterlandscape1"
          alt="Clouds reflected in a still lake framed by Ontario pines"
          className="hero-photo"
          eager
          sizes="100vw"
        />
        <div className="hero-shade" />
        <div className="hero-side">
          <span>TAKE A BREATH. YOU’RE OUTSIDE.</span>
          <span className="hero-cross" aria-hidden="true">
            +
          </span>
        </div>
        <div className="hero-content">
          <p className="eyebrow">
            PRIVATE FISHING EXPERIENCES · ONTARIO, CANADA
          </p>
          <h1 tabIndex={-1}>
            A little further
            <br />
            from the everyday<span className="headline-period">.</span>
          </h1>
          <div className="hero-action">
            <Link className="button button-light" to="/experiences">
              Explore experiences
            </Link>
            <p>
              Good company. Open water.
              <br />A day that feels like a deep breath.
            </p>
          </div>
        </div>
        <div className="hero-footer">
          <span>SHORELINE & ICE FISHING</span>
          <Link to="/about">Guided by Nikita. Made for you.</Link>
          <a href="#outside" className="scroll-cue">
            SLOW DOWN. SCROLL A LITTLE.<span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>
      <section id="outside" className="intro section-pad">
        <div className="intro-label">
          <Horizon />
          <p className="eyebrow">A GOOD DAY STARTS OUTSIDE</p>
        </div>
        <div>
          <h2>
            Less on your mind.
            <br />
            More in the moment.
          </h2>
          <div className="intro-copy">
            <p>
              Remember the feeling of heading somewhere new? A day away from the
              usual. A little fresh air. Something to tell a story about.
            </p>
            <p>
              That’s fishn. Private days by Ontario’s water, guided by Nikita.
              Come as you are. We’ll start with a cast.
            </p>
          </div>
        </div>
      </section>
      <section className="experiences-section section-pad">
        <div className="section-heading">
          <div>
            <p className="eyebrow">TWO WAYS TO GET AWAY</p>
            <h2>
              Find your kind
              <br />
              of outside.
            </h2>
          </div>
          <p>
            No experience needed.
            <br />
            Just a little curiosity.
          </p>
        </div>
        <ExperiencePair />
      </section>
      <Atlas />
      <section className="philosophy section-pad">
        <div className="philosophy-copy">
          <p className="eyebrow">COME FOR THE FISHING</p>
          <h2>
            Stay for
            <br />
            everything else.
          </h2>
          <p>
            The water has a way of putting things in perspective. Phones stay in
            pockets a little longer. Conversations find their own pace.
          </p>
          <p>
            Bring someone you love. Or take a little time for yourself. There’s
            no one way to have a good day outside.
          </p>
          <Horizon />
        </div>
        <figure>
          <Photo
            name="waterlandscape"
            alt="A pink evening sky reflected between trees along a quiet lake"
          />
          <figcaption>A little less hurry. A little more here.</figcaption>
        </figure>
      </section>
      <GuideSection />
      <Invitation />
    </>
  );
}
export function GuideSection() {
  return (
    <section className="guide-section section-pad">
      <div className="guide-image">
        <Photo
          name="closeupreelandmug"
          alt="A well-used reel and a green mug beside the river"
        />
        <span className="field-caption">THE LITTLE THINGS MAKE THE DAY.</span>
      </div>
      <div className="guide-copy">
        <p className="eyebrow">LOCAL KNOWLEDGE. GOOD COMPANY.</p>
        <h2>
          Meet your
          <br />
          outside person.
        </h2>
        <p className="guide-name">Nikita. Your guide.</p>
        <p>
          A local outdoorsman with a love for Ontario’s lakes and rivers. From
          the shoreline to the ice, Nikita brings hands-on fishing knowledge and
          a genuine connection to the places he explores.
        </p>
        <p>
          First cast or one of many, there’s always something new to notice.
        </p>
        <Link to="/about" className="text-link">
          A little more about Nikita
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
      <section className="page-intro section-pad">
        <p className="eyebrow">PRIVATE DAYS. OPEN POSSIBILITIES.</p>
        <h1 tabIndex={-1}>
          Find your kind
          <br />
          of outside.
        </h1>
        <p>
          A little learning. A little exploring. A whole day’s worth of feeling
          somewhere else.
        </p>
      </section>
      <section className="section-pad experience-list-page">
        <ExperiencePair />
      </section>
      <section className="simple-notes section-pad">
        <h2>
          Your first cast
          <br />
          starts here.
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
          <BookLink>Plan your day</BookLink>
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
export function ExperienceDetail() {
  const { slug } = useParams();
  const experience = experiences.find((e) => e.id === slug);
  if (!experience) return <NotFound />;
  const ice = experience.id === "ice-fishing";
  return (
    <>
      <section className="detail-hero">
        <Photo
          name={experience.image}
          alt={experience.alt}
          eager
          sizes="100vw"
        />
        <div className="hero-shade" />
        <div className="detail-hero-content">
          <p className="eyebrow">
            PRIVATE GUIDED {ice ? "ICE" : "SHORELINE"} FISHING · ONTARIO
          </p>
          <h1 tabIndex={-1}>
            {ice ? (
              <>
                Winter has
                <br />a quieter side.
              </>
            ) : (
              <>
                Find your own
                <br />
                kind of quiet.
              </>
            )}
          </h1>
          <BookLink experience={experience.id} className="button button-light">
            Request {experience.name.toLowerCase()}
          </BookLink>
        </div>
        <span className="detail-hero-note">
          BEGINNERS WELCOME · YOUR DAY, AT YOUR PACE
        </span>
      </section>
      <section className="experience-overview section-pad">
        <div>
          <p className="eyebrow">{experience.name}</p>
          <h2>{experience.short}</h2>
        </div>
        <div>
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
              <p>Request 1–4 hours</p>
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
          <BookLink experience={experience.id}>Let’s plan your day</BookLink>
        </div>
      </section>
      <section className="experience-places section-pad">
        <p className="eyebrow">A CHANGE OF SCENERY</p>
        <h2>{ice ? "A new side of Simcoe." : "A few places to begin."}</h2>
        <div>
          {locations
            .filter((l) => experience.locations.includes(l.id))
            .map((l) => (
              <Link
                className="place-preview"
                key={l.id}
                to={`/explore/${l.id}`}
              >
                <Photo
                  name={ice ? "Lake-simcoe-ice" : l.image}
                  alt={
                    ice
                      ? "A wide frozen Lake Simcoe beneath a pale winter sky"
                      : l.alt
                  }
                />
                <span>
                  {l.name}
                  <span aria-hidden="true">+</span>
                </span>
              </Link>
            ))}
        </div>
      </section>
      <section className="journal section-pad">
        <div className="section-heading">
          <div>
            <p className="eyebrow">MOMENTS FROM THE WATER</p>
            <h2>
              The days
              <br />
              we bring home.
            </h2>
          </div>
          <p>
            A few glimpses from outside.
            <br />
            Every day has its own story.
          </p>
        </div>
        <div className={`journal-grid ${ice ? "winter-journal" : ""}`}>
          {experience.journal.map((name, i) => (
            <figure key={name}>
              <Photo
                name={name}
                alt={photoAlt[name] ?? "A moment from a fishing day outdoors"}
              />
              <figcaption>
                {
                  [
                    "A little closer.",
                    "Time well spent.",
                    "Something to notice.",
                    "Somewhere else.",
                  ][i % 4]
                }
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className="faq section-pad">
        <h2>
          A little
          <br />
          before you go.
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
              and identification. Nikita will discuss equipment, clothing, and
              the exact plan with you before the trip.
            </p>
          </details>
          <details>
            <summary>How much does it cost?</summary>
            <p>
              Nikita will share pricing when reviewing your request, before you
              commit. No payment is taken on this website.
            </p>
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
      <section className="page-intro explore-intro section-pad">
        <p className="eyebrow">THE FISHN FIELD ATLAS</p>
        <h1 tabIndex={-1}>
          Somewhere new.
          <br />
          Something familiar.
        </h1>
        <p>Three Ontario waters. A different way to spend a day.</p>
      </section>
      <Atlas full />
      <section className="map-explanation section-pad">
        <Horizon />
        <div>
          <h2>Good places deserve a little care.</h2>
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
      <section className="location-title section-pad">
        <Link className="text-link" to="/explore">
          Back to the field atlas
        </Link>
        <p className="eyebrow">{place.region}</p>
        <h1 tabIndex={-1}>{place.name}</h1>
        <p className="coordinate">
          {geography.features[place.id].coordinate}{" "}
          <span>· Geographic reference only</span>
        </p>
      </section>
      <section className="location-landscape">
        <Photo name={place.image} alt={place.alt} eager sizes="100vw" />
        <WaterOutline id={place.id} />
      </section>
      <section className="location-editorial section-pad">
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
      <section className="detail-hero about-hero">
        <Photo
          name="winterpath"
          alt="A path inviting you into a snow-covered Ontario forest"
          eager
          sizes="100vw"
        />
        <div className="hero-shade" />
        <div className="detail-hero-content">
          <p className="eyebrow">A LOCAL GUIDE. A SHARED LOVE OF OUTSIDE.</p>
          <h1 tabIndex={-1}>
            Good days begin
            <br />
            with good company.
          </h1>
        </div>
      </section>
      <GuideSection />
      <section className="simple-notes section-pad">
        <h2>
          A little knowledge.
          <br />A lot to discover.
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
        acknowledgement of the fishing licence requirements. This information is
        used to respond to your enquiry and arrange your experience. No identity
        documents or licence images are collected.
      </p>
      <p>
        Requests are sent securely to fishn’s configured business inbox through
        Resend, our email delivery provider. A request is only marked submitted
        after the delivery service accepts it. The business keeps the
        information needed to handle your enquiry; contact Nikita to ask about
        access or deletion.
      </p>
      <h2>Remembering your selections</h2>
      <p>
        This browser can remember your experience, location, group size,
        duration, date, and licence acknowledgement. Contact information is kept
        in memory while you fill out the form and is not saved in browser
        storage. You can clear the remembered selections on the booking page.
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
    <section className="not-found section-pad">
      <Horizon />
      <p className="eyebrow">A LITTLE OFF THE PATH</p>
      <h1 tabIndex={-1}>
        Let’s find our
        <br />
        way back.
      </h1>
      <p>That page isn’t here. Your next day outside still is.</p>
      <Link className="button" to="/">
        Back to fishn
      </Link>
    </section>
  );
}
