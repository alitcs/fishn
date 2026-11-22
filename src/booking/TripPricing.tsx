import { experiences } from "../data/config";
import type { ExperienceId } from "../data/config";
import { additionalPersonRates, formatPrice, tripPrice, tripRates } from "../data/pricing";

export function TripEstimate({ experience, groupSize, duration }: {
  experience: ExperienceId;
  groupSize: number;
  duration: number;
}) {
  const valid = Number.isSafeInteger(groupSize) && groupSize >= 1;
  const price = valid ? tripPrice(experience, groupSize, duration) : null;
  return (
    <div className="trip-estimate" role="status" aria-live="polite" aria-atomic="true">
      <div className="trip-estimate-total">
        <span>Session total <small>CAD</small></span>
        <strong>{price ? formatPrice(price.total) : "Choose your group size"}</strong>
      </div>
      <p>
        {groupSize || "—"} {groupSize === 1 ? "person" : "people"} · {duration}{" "}
        hours · {experience === "ice-fishing" ? "Ice fishing" : "Shoreline fishing"}
      </p>
    </div>
  );
}

export function TripRates({ experience }: { experience?: ExperienceId }) {
  return (
    <div className="trip-rates">
      {experiences.filter((item) => !experience || item.id === experience).map((item) => (
        <p key={item.id}>
          <strong>{item.name}</strong><br />
          {formatPrice(tripRates[item.id])}/hour for one person +{" "}
          {formatPrice(additionalPersonRates[item.id])}/hour per extra person.
        </p>
      ))}
      <p>Total = your group’s hourly rate × trip hours.</p>
      <p>2, 4, 6, or 8 hour trips. Prices in CAD. All fishing gear included. No payment online.</p>
    </div>
  );
}
