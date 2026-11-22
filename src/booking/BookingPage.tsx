import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { External, Horizon, Photo } from "../components";
import {
  durationOptions,
  experiences,
  isRequestDateAllowed,
  officialLinks,
} from "../data/config";
import type { ExperienceId, LocationId } from "../data/config";
import { locations } from "../data/locations";
import { getAttribution, hasConsent, track } from "../services/analytics";
import { bookingSchema, licenceOptions } from "./schema";
import type { BookingInput, BookingResponse } from "./schema";
import { BookingError, submitBooking } from "./service";
import { Calendar } from "./Calendar";
type Selection = {
  experience: ExperienceId;
  location: LocationId;
  groupSize: number;
  duration: number;
  preferredDate: string;
  licenceAcknowledgement: string;
};
const defaults: Selection = {
  experience: "shoreline-fishing",
  location: "lake-simcoe",
  groupSize: 2,
  duration: 2,
  preferredDate: "",
  licenceAcknowledgement: "",
};
const storageKey = "fishn-trip-preferences";
export function BookingPage() {
  const [params] = useSearchParams();
  const [selection, setSelection] = useState<Selection>(defaults);
  const [hydrated, setHydrated] = useState(false);
  const [groupMore, setGroupMore] = useState(false);
  const [contact, setContact] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState<boolean | null>(null);
  const [confirmation, setConfirmation] = useState<BookingResponse | null>(
    null,
  );
  const attempt = useRef<{
    fingerprint: string;
    requestId: string;
    clientSubmittedAt: string;
  } | null>(null);
  const inFlight = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const initial = { ...defaults };
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (saved && typeof saved === "object") {
        if (experiences.some((e) => e.id === saved.experience))
          initial.experience = saved.experience;
        if (locations.some((l) => l.id === saved.location))
          initial.location = saved.location;
        if (
          Number.isInteger(saved.groupSize) &&
          saved.groupSize >= 1 &&
          saved.groupSize <= 100
        )
          initial.groupSize = saved.groupSize;
        if (durationOptions.includes(saved.duration))
          initial.duration = saved.duration;
        if (typeof saved.preferredDate === "string")
          initial.preferredDate = saved.preferredDate;
        if (
          licenceOptions.some((l) => l.value === saved.licenceAcknowledgement)
        )
          initial.licenceAcknowledgement = saved.licenceAcknowledgement;
      }
    } catch {
      /* Browser storage is optional. */
    }
    const exp = params.get("experience");
    if (experiences.some((e) => e.id === exp))
      initial.experience = exp as ExperienceId;
    const location = params.get("location");
    if (locations.some((l) => l.id === location))
      initial.location = location as LocationId;
    if (
      !experiences
        .find((e) => e.id === initial.experience)!
        .locations.includes(initial.location)
    )
      initial.location = "lake-simcoe";
    if (!isRequestDateAllowed(initial.preferredDate, initial.experience))
      initial.preferredDate = "";
    // Browser-only preferences are reconciled after static HTML hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelection(initial);
    setGroupMore(initial.groupSize >= 4);
    setHydrated(true);
    track("BookingStarted", { experience: initial.experience });
  }, [params]);
  useEffect(() => {
    if (hydrated)
      try {
        localStorage.setItem(storageKey, JSON.stringify(selection));
      } catch {
        /* Optional preference storage. */
      }
  }, [selection, hydrated]);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/booking/status", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setReady(data.ready === true))
      .catch(() => {
        if (!controller.signal.aborted) setReady(false);
      });
    return () => controller.abort();
  }, []);
  const experience = experiences.find((e) => e.id === selection.experience)!;
  function update<K extends keyof Selection>(key: K, value: Selection[K]) {
    setSelection((old) => {
      const next = { ...old, [key]: value };
      if (key === "experience") {
        if (
          !experiences
            .find((e) => e.id === value)!
            .locations.includes(next.location)
        )
          next.location = "lake-simcoe";
        if (
          next.preferredDate &&
          !isRequestDateAllowed(next.preferredDate, next.experience)
        )
          next.preferredDate = "";
      }
      return next;
    });
    setErrors((old) => ({ ...old, [key]: "" }));
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (inFlight.current) return;
    setMessage("");
    setErrors({});
    const base = {
      ...selection,
      ...contact,
      analyticsConsent: hasConsent(),
      ...(hasConsent() ? { attribution: getAttribution() } : {}),
    };
    const fingerprint = JSON.stringify(base);
    if (attempt.current?.fingerprint !== fingerprint)
      attempt.current = {
        fingerprint,
        requestId: crypto.randomUUID(),
        clientSubmittedAt: new Date().toISOString(),
      };
    const parsed = bookingSchema.safeParse({
      ...base,
      requestId: attempt.current.requestId,
      clientSubmittedAt: attempt.current.clientSubmittedAt,
    });
    if (!parsed.success || (groupMore && selection.groupSize < 4)) {
      const fields = !parsed.success
        ? Object.fromEntries(
            parsed.error.issues.map((i) => [i.path[0] ?? "form", i.message]),
          )
        : { groupSize: "Please enter the actual group size, starting at 4." };
      setErrors(fields);
      setMessage("A few details need a look.");
      setTimeout(() => {
        form.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus();
        messageRef.current?.focus();
      }, 0);
      return;
    }
    inFlight.current = true;
    setBusy(true);
    try {
      const result = await submitBooking(parsed.data as BookingInput);
      setConfirmation(result);
      track("Lead", {
        experience: selection.experience,
        group_size: selection.groupSize,
      });
      try {
        localStorage.removeItem(storageKey);
      } catch {
        /* Optional storage. */
      }
      setContact({ name: "", email: "", phone: "", website: "" });
      setTimeout(
        () => document.getElementById("confirmation-title")?.focus(),
        0,
      );
    } catch (error) {
      if (error instanceof BookingError) {
        setErrors(error.fields);
        setMessage(error.message);
      } else
        setMessage("Something interrupted your request. Please try again.");
      setTimeout(() => messageRef.current?.focus(), 0);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  const error = (key: string) =>
    errors[key] ? (
      <p className="field-error" id={`${key}-error`}>
        {errors[key]}
      </p>
    ) : null;
  const formattedDate = selection.preferredDate
    ? new Intl.DateTimeFormat("en-CA", {
        dateStyle: "medium",
        timeZone: "UTC",
      }).format(new Date(selection.preferredDate + "T12:00:00Z"))
    : "A day that works for you";
  if (confirmation)
    return (
      <section className="confirmation section-pad">
        <Horizon />
        <p className="eyebrow">A GOOD DAY IS TAKING SHAPE</p>
        <h1 id="confirmation-title" tabIndex={-1}>
          Adventure
          <br />
          requested.
        </h1>
        <p>
          Thanks for reaching out. Nikita will be in touch to confirm the
          details of your trip.
        </p>
        <div className="confirmation-summary">
          <span>{experience.name}</span>
          <span>
            {locations.find((l) => l.id === selection.location)!.name}
          </span>
          <span>
            {formattedDate} · {selection.groupSize}{" "}
            {selection.groupSize === 1 ? "person" : "people"}
          </span>
        </div>
        <p className="small">
          This is a submitted request. Your date, pricing, meeting point, and
          trip are not yet confirmed or reserved.
        </p>
        <p className="request-reference">
          Request reference: {confirmation.requestId}
        </p>
        <button
          type="button"
          className="text-button"
          onClick={() => {
            setConfirmation(null);
            setSelection({ ...defaults });
            setGroupMore(false);
            attempt.current = null;
            window.scrollTo(0, 0);
          }}
        >
          Plan another day
        </button>
        <Link className="button" to="/">
          Back to fishn
        </Link>
      </section>
    );
  return (
    <div className="booking-page section-pad">
      <div className="booking-heading">
        <p className="eyebrow">LESS PLANNING. MORE LOOKING FORWARD.</p>
        <h1 tabIndex={-1}>
          Your next
          <br />
          good day.
        </h1>
        <p>
          A few details. A little anticipation.
          <br />
          Nikita will take it from here.
        </p>
      </div>
      {ready === false && (
        <div className="request-unavailable booking-status" role="status">
          <strong>Online requests are opening soon.</strong>
          <p>
            You can plan your day here. To send your enquiry now,{" "}
            <External href={officialLinks.instagram}>
              contact Nikita on Instagram
            </External>
            .
          </p>
        </div>
      )}
      <div className="booking-layout">
        <form
          ref={form}
          onSubmit={submit}
          noValidate
          aria-label="Booking request"
        >
          <fieldset>
            <legend>What kind of outside?</legend>
            <div className="experience-options">
              {experiences.map((e) => (
                <button
                  type="button"
                  className={selection.experience === e.id ? "selected" : ""}
                  aria-pressed={selection.experience === e.id}
                  key={e.id}
                  onClick={() => update("experience", e.id)}
                >
                  <Photo name={e.image} alt="" />
                  <span>
                    {e.name}
                    <span className="selection-circle" aria-hidden="true">
                      {selection.experience === e.id ? "✓" : ""}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Where shall we go?</legend>
            <div className="segmented location-options">
              {locations
                .filter((l) => experience.locations.includes(l.id))
                .map((l) => (
                  <button
                    type="button"
                    key={l.id}
                    aria-pressed={selection.location === l.id}
                    onClick={() => update("location", l.id)}
                  >
                    {l.name}
                  </button>
                ))}
            </div>
            {error("location")}
            <p className="field-hint">
              A general area for now. Nikita will arrange the exact meeting
              point.
            </p>
          </fieldset>
          <div className="form-columns">
            <fieldset>
              <legend>Who’s coming?</legend>
              <div className="segmented">
                {[1, 2, 3, 4].map((size) => (
                  <button
                    type="button"
                    key={size}
                    aria-pressed={
                      size === 4
                        ? groupMore
                        : !groupMore && selection.groupSize === size
                    }
                    onClick={() => {
                      setGroupMore(size === 4);
                      update("groupSize", size);
                    }}
                  >
                    {size === 4 ? "4+" : size}
                    <span className="sr-only">
                      {" "}
                      {size === 1 ? "person" : "people"}
                    </span>
                  </button>
                ))}
              </div>
              {groupMore && (
                <label className="extra-group">
                  How many people?
                  <input
                    type="number"
                    min="4"
                    max="100"
                    value={selection.groupSize}
                    onChange={(e) =>
                      update("groupSize", Number(e.target.value))
                    }
                    aria-invalid={Boolean(errors.groupSize)}
                    aria-describedby={
                      errors.groupSize ? "groupSize-error" : undefined
                    }
                  />
                </label>
              )}
              {error("groupSize")}
            </fieldset>
            <fieldset>
              <legend>How long outside?</legend>
              <div className="segmented">
                {durationOptions.map((hours) => (
                  <button
                    type="button"
                    key={hours}
                    aria-pressed={selection.duration === hours}
                    onClick={() => update("duration", hours)}
                  >
                    {hours}h
                  </button>
                ))}
              </div>
              <p className="field-hint">
                Pricing is shared when Nikita reviews your request.
              </p>
            </fieldset>
          </div>
          <fieldset>
            <legend>A day to look forward to.</legend>
            <p className="field-hint date-intro">
              Choose a preferred date. This calendar shows request dates, not
              available appointments.
            </p>
            <Calendar
              value={selection.preferredDate}
              onChange={(v) => update("preferredDate", v)}
              experience={selection.experience}
              invalid={Boolean(errors.preferredDate)}
            />
            {error("preferredDate")}
            {selection.experience === "ice-fishing" && (
              <p className="conditions-note">
                Ice requests depend on appropriate fishing seasons, suitable ice
                conditions, permissions, and Nikita’s approval. A selectable
                date is not an indication of safe ice.
              </p>
            )}
          </fieldset>
          <fieldset className="licence-section">
            <legend>One little thing before we go.</legend>
            <p>
              Most Ontario and other Canadian residents aged 18–64 need a
              fishing licence. Residents under 18 or 65 and older generally
              don’t need to buy one, but must carry the required ID.
              International visitors have different requirements.
            </p>
            <details>
              <summary>A little help with the licence rules</summary>
              <p>
                A one-day sport fishing licence does not require an Outdoors
                Card. Check the current rules for your residency and
                circumstances. Each person is responsible for meeting the
                requirements; this acknowledgement is not legal verification.
              </p>
              <div className="licence-links">
                <External href={officialLinks.licence}>
                  Need a licence? Get one through Ontario.
                </External>
                <External href={officialLinks.visitors}>
                  International visitor guidance
                </External>
                <External href={officialLinks.regulations}>
                  Official Ontario rules & regulations
                </External>
              </div>
            </details>
            <p className="licence-question" id="licence-label">
              Are you all set with the fishing licence requirements?
            </p>
            <div
              className="licence-options"
              role="radiogroup"
              aria-labelledby="licence-label"
              aria-invalid={Boolean(errors.licenceAcknowledgement)}
              aria-describedby={
                errors.licenceAcknowledgement
                  ? "licenceAcknowledgement-error"
                  : undefined
              }
            >
              {licenceOptions.map((option) => (
                <label key={option.value}>
                  <input
                    type="radio"
                    name="licence"
                    value={option.value}
                    checked={selection.licenceAcknowledgement === option.value}
                    onChange={() =>
                      update("licenceAcknowledgement", option.value)
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {error("licenceAcknowledgement")}
            <p className="field-hint">
              Not sure whether you need one?{" "}
              <External href={officialLinks.regulations}>
                Check the official Ontario rules.
              </External>
            </p>
          </fieldset>
          <fieldset>
            <legend>How can Nikita reach you?</legend>
            <div className="contact-fields">
              {(
                [
                  {
                    key: "name",
                    label: "Full name",
                    type: "text",
                    autoComplete: "name",
                  },
                  {
                    key: "email",
                    label: "Email address",
                    type: "email",
                    autoComplete: "email",
                  },
                  {
                    key: "phone",
                    label: "Phone number",
                    type: "tel",
                    autoComplete: "tel",
                  },
                ] as const
              ).map((field) => (
                <label key={field.key}>
                  {field.label}
                  <input
                    name={field.key}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    value={contact[field.key]}
                    required
                    maxLength={
                      field.key === "name"
                        ? 100
                        : field.key === "email"
                          ? 254
                          : 30
                    }
                    onChange={(e) => {
                      setContact({ ...contact, [field.key]: e.target.value });
                      setErrors({ ...errors, [field.key]: "" });
                    }}
                    aria-invalid={Boolean(errors[field.key])}
                    aria-describedby={
                      errors[field.key] ? `${field.key}-error` : undefined
                    }
                  />
                  {error(field.key)}
                </label>
              ))}
            </div>
            <div className="honeypot" aria-hidden="true">
              <label>
                Leave this empty
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={contact.website}
                  onChange={(e) =>
                    setContact({ ...contact, website: e.target.value })
                  }
                />
              </label>
            </div>
          </fieldset>
          {message && (
            <div
              className="form-message"
              role="alert"
              tabIndex={-1}
              ref={messageRef}
            >
              {message}
            </div>
          )}
          <button
            className="button submit-booking"
            type="submit"
            disabled={busy || ready !== true}
            aria-busy={busy}
          >
            {busy ? "Sending your request…" : "Request your adventure"}
          </button>
          <p className="field-hint submit-note">
            A request, not a confirmed booking. No payment is taken.
            <br />
            Your details are used to arrange your trip.{" "}
            <Link to="/privacy">Read our privacy notice.</Link>
          </p>
        </form>
        <aside className="booking-aside">
          <div className="trip-summary">
            <Photo name={experience.image} alt={experience.alt} />
            <div className="trip-summary-body">
              <p className="eyebrow">A GOOD DAY IN THE MAKING</p>
              <h2>{experience.name}</h2>
              <dl>
                <div>
                  <dt>Somewhere</dt>
                  <dd>
                    {locations.find((l) => l.id === selection.location)!.name}
                  </dd>
                </div>
                <div>
                  <dt>With</dt>
                  <dd>
                    {selection.groupSize}{" "}
                    {selection.groupSize === 1 ? "person" : "people"}
                  </dd>
                </div>
                <div>
                  <dt>For</dt>
                  <dd>
                    {selection.duration}{" "}
                    {selection.duration === 1 ? "hour" : "hours"}
                  </dd>
                </div>
                <div>
                  <dt>On</dt>
                  <dd>{formattedDate}</dd>
                </div>
              </dl>
              <p>
                Nikita reviews every request personally. The season, the
                conditions, and your plans shape the day.
              </p>
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setSelection({ ...defaults });
                  setGroupMore(false);
                  setErrors({});
                  setMessage("");
                }}
              >
                Clear trip selections
              </button>
            </div>
          </div>
          <Horizon />
          <p className="aside-signoff">
            Good company.
            <br />A little local knowledge.
            <br />
            Something to look forward to.
          </p>
        </aside>
      </div>
    </div>
  );
}
