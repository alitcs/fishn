import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import geography from "./data/geography.json";
import { locations, mapsUrl } from "./data/locations";
import type { LocationId } from "./data/config";
import { BookLink, External, Photo } from "./components";

export function WaterOutline({
  id,
  className = "",
}: {
  id: LocationId;
  className?: string;
}) {
  const feature = geography.features[id];
  const outline = useRef<SVGSVGElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!outline.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
    }, { threshold: 0.15 });
    observer.observe(outline.current);
    return () => observer.disconnect();
  }, []);
  return (
    <svg
      ref={outline}
      className={`water-outline ${className} ${visible ? "is-visible" : ""}`}
      viewBox="0 0 500 500"
      fill="none"
      aria-hidden="true"
      data-location={id}
    >
      <g
        stroke="currentColor"
        strokeWidth={id === "lake-simcoe" ? 2.5 : 2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {feature.paths.map((d, i) => (
          <path key={i} d={d} pathLength="1" />
        ))}
        {feature.detailPaths.map((d, i) => (
          <path
            key={`detail-${i}`}
            d={d}
            pathLength="1"
            strokeWidth="1.5"
            opacity="0.8"
          />
        ))}
      </g>
    </svg>
  );
}
export function Atlas({
  initial = "lake-simcoe",
  full = false,
}: {
  initial?: LocationId;
  full?: boolean;
}) {
  const [selected, setSelected] = useState(initial);
  const place = locations.find((l) => l.id === selected)!;
  return (
    <section
      className={`atlas photo-chapter ${full ? "atlas-full" : ""}`}
      aria-label="Explore Ontario’s fishing locations"
    >
      <div className="atlas-images">
        {locations.map((location) => (
          <Photo
            key={location.id}
            name={location.image}
            alt={location.id === selected ? location.alt : ""}
            className={`chapter-photo ${location.id === selected ? "is-active" : ""}`}
            eager={full}
            sizes="100vw"
          />
        ))}
      </div>
      <div className="photo-scrim atlas-scrim" />
      <div className="atlas-top eyebrow">
        <span>03 / THE FISHN FIELD ATLAS</span>
        <span>THREE WATERS. A WORLD AWAY.</span>
      </div>
      <div className="atlas-heading">
        <p className="eyebrow">A FEW PLACES WE CALL OUTSIDE.</p>
        {full ? (
          <h1 tabIndex={-1}>
            Somewhere
            <br />
            <em>out there.</em>
          </h1>
        ) : (
          <h2>
            Somewhere
            <br />
            <em>out there.</em>
          </h2>
        )}
      </div>
      <div className="atlas-geography">
        <div className="atlas-map-label eyebrow">
          <span>GEOGRAPHIC STUDY</span>
          <span className="compass" aria-hidden="true">
            N ↑
          </span>
        </div>
        <div className="atlas-outlines">
          {locations.map((location) => (
            <WaterOutline
              key={location.id}
              id={location.id}
              className={selected === location.id ? "is-active" : ""}
            />
          ))}
        </div>
        <div className="atlas-coordinate eyebrow">
          <span className="crosshair" aria-hidden="true">
            +
          </span>
          <span>
            GEOGRAPHIC REFERENCE
            <br />
            {geography.features[selected].coordinate}
          </span>
        </div>
        <External
          className="atlas-attribution"
          href="https://www.openstreetmap.org/copyright"
        >
          © OpenStreetMap contributors
        </External>
      </div>
      <div className="atlas-panel" aria-live="polite">
        <div className="location-summary" key={place.id}>
          <p className="eyebrow">{place.region}</p>
          <h3>{place.name}</h3>
          <p>{full ? place.description : place.intro}</p>
          <div className="atlas-actions">
            <Link className="text-link" to={`/explore/${place.id}`}>
              Discover {place.name}
            </Link>
            <BookLink location={place.id} className="text-link">
              Book a day here <span aria-hidden="true">+</span>
            </BookLink>
          </div>
          <External className="text-link maps-link" href={mapsUrl(place.maps)}>
            View on Google Maps
          </External>
        </div>
      </div>
      <dl className="atlas-facts">
        {place.facts.slice(0, 2).map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className="atlas-navigation">
        <div className="location-switch" aria-label="Select a location">
          {locations.map((location) => (
            <button
              key={location.id}
              aria-pressed={selected === location.id}
              onClick={() => setSelected(location.id)}
            >
              <span className="location-index" aria-hidden="true">
                0{locations.indexOf(location) + 1}
              </span>
              <span>{location.name}</span>
              <span aria-hidden="true">
                {selected === location.id ? "−" : "+"}
              </span>
            </button>
          ))}
        </div>
        <p className="atlas-note">
          General service areas. Meeting points arranged by Nikita. Outlines do
          not show fishing access or ice conditions.
        </p>
      </div>
    </section>
  );
}
