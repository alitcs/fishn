import { useState } from "react";
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
  return (
    <svg
      className={`water-outline ${className}`}
      viewBox="0 0 500 500"
      fill="none"
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth={id === "lake-simcoe" ? 1.7 : 2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {feature.paths.map((d, i) => (
          <path key={i} d={d} />
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
      className={`atlas ${full ? "atlas-full" : ""}`}
      aria-label="Explore Ontario’s fishing locations"
    >
      <div className="atlas-visual">
        <Photo
          key={place.id}
          name={place.image}
          alt={place.alt}
          sizes="(max-width: 800px) 100vw, 60vw"
        />
        <div className="atlas-scrim" />
        <div className="atlas-top">
          <span className="eyebrow">THE FISHN FIELD ATLAS</span>
          <span className="compass" aria-hidden="true">
            N<br />
            <span>↑</span>
          </span>
        </div>
        <WaterOutline id={selected} />
        <div className="atlas-coordinate">
          <span className="crosshair" aria-hidden="true">
            +
          </span>
          <span>
            GEOGRAPHIC REFERENCE
            <br />
            {geography.features[selected].coordinate}
          </span>
        </div>
        <div className="atlas-bottom">
          <span>ONTARIO, CANADA</span>
          <External href="https://www.openstreetmap.org/copyright">
            © OpenStreetMap contributors
          </External>
        </div>
      </div>
      <div className="atlas-panel">
        <p className="eyebrow">A FEW PLACES WE CALL OUTSIDE</p>
        <h2>
          Find your
          <br />
          change of scenery.
        </h2>
        <div className="location-switch" aria-label="Select a location">
          {locations.map((location) => (
            <button
              key={location.id}
              aria-pressed={selected === location.id}
              onClick={() => setSelected(location.id)}
            >
              {location.name}
              <span aria-hidden="true">
                {selected === location.id ? "−" : "+"}
              </span>
            </button>
          ))}
        </div>
        <div className="location-summary" key={place.id} aria-live="polite">
          <p className="eyebrow">{place.region}</p>
          <h3>{place.intro}</h3>
          <p>
            {full
              ? place.description
              : "A new view. A little local knowledge. A day that feels a world away."}
          </p>
          <Link className="text-link" to={`/explore/${place.id}`}>
            Discover {place.name}
          </Link>
        </div>
        {full ? (
          <>
            <BookLink location={place.id}>Request a day here</BookLink>
            <External
              className="text-link maps-link"
              href={mapsUrl(place.maps)}
            >
              View on Google Maps
            </External>
          </>
        ) : (
          <Link to="/explore" className="text-link atlas-all">
            Explore the field atlas
          </Link>
        )}
        <p className="atlas-note">
          General service areas. Nikita confirms the meeting point after review.
          This map does not show fishing access or ice conditions.
        </p>
      </div>
    </section>
  );
}
