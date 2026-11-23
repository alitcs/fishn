import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { External, Photo } from "../components";
import { WaterOutline } from "../Atlas";
import { getTripScene, tripScenes } from "../data/scenes";
import {
  durationOptions,
  experiences,
  isRequestDateAllowed,
} from "../data/config";
import type { ExperienceId, LocationId } from "../data/config";
import { locations } from "../data/locations";
import { getAttribution, hasConsent, track } from "../services/analytics";
import { bookingSchema } from "./schema";
import type { BookingInput, BookingResponse } from "./schema";
import { BookingError, submitBooking } from "./service";
import { ConversationStep } from "./ConversationStep";
import { TripEstimate } from "./TripPricing";
import { netlifyFormName, netlifyFormEndpoint } from "./netlify";
export type Selection = {
  experience: ExperienceId;
  location: LocationId;
  groupSize: number;
  duration: number;
  preferredDate: string;
  licenceAcknowledgement: string;
  destinationAdviceRequested: boolean;
};
const defaults: Selection = {
  experience: "shoreline-fishing",
  location: "lake-simcoe",
  groupSize: 1,
  duration: 2,
  preferredDate: "",
  licenceAcknowledgement: "",
  destinationAdviceRequested: false,
};
export function BookingPage({ embedded = false }: { embedded?: boolean }) {
  const [params] = useSearchParams();
  const [selection, setSelection] = useState<Selection>(defaults);
  const [contact, setContact] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [specialRequests, setSpecialRequests] = useState("");
  const flowStarted = useRef(false);
  const measuredSteps = useRef(new Set<number>());
  const section = useRef<HTMLElement>(null);
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
    // Explicit experience links are applied after static HTML hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelection(initial);
  }, [params]);
  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          track("BookingViewed", {
            experience: params.get("experience") || "shoreline-fishing",
          });
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [params]);
  const experience = experiences.find((e) => e.id === selection.experience)!;
  const place = locations.find(
    (location) => location.id === selection.location,
  )!;
  const scene = getTripScene(selection.location, selection.experience);
  const Heading = embedded ? "h2" : "h1";
  const stepNames = ["Session", "Date", "Group & time", "Your details"];
  const flow = [0, 1, 2, 3];
  const progressIndex = flow.indexOf(step);
  function startFlow() {
    if (flowStarted.current) return;
    flowStarted.current = true;
    track("BookingStarted", { experience: selection.experience });
  }
  function goToStep(next: number) {
    startFlow();
    if (next === 3 && !measuredSteps.current.has(3)) {
      measuredSteps.current.add(3);
      track("BookingDetailsCompleted", {
        experience: selection.experience,
        group_size: selection.groupSize,
        duration: selection.duration,
      });
      track("ContactStepReached", { experience: selection.experience });
    }
    setStep(next);
    setMessage("");
    setTimeout(() => {
      const panel = document.getElementById("booking-step-title");
      section.current?.scrollIntoView({ block: "start", behavior: "instant" });
      panel?.focus({ preventScroll: true });
    }, 0);
  }
  function nextStep() {
    const fields: Record<string, string> = {};
    if (
      step === 1 &&
      !isRequestDateAllowed(selection.preferredDate, selection.experience)
    )
      fields.preferredDate = "Please choose a preferred request date.";
    if (
      step === 2 &&
      (!Number.isSafeInteger(selection.groupSize) ||
        selection.groupSize < 1)
    )
      fields.groupSize = "Please enter a whole number of people, at least 1.";
    if (
      step === 2 &&
      !durationOptions.includes(selection.duration as (typeof durationOptions)[number])
    )
      fields.duration = "Please choose a 2, 4, 6, or 8 hour trip.";
    setErrors(fields);
    if (Object.keys(fields).length) {
      setMessage("Please check the detail below.");
      setTimeout(() => messageRef.current?.focus(), 0);
      return;
    }
    goToStep(flow[Math.min(flow.length - 1, progressIndex + 1)]);
  }
  function chooseDestination(id: string, advice = false) {
    startFlow();
    const destination = tripScenes.find((option) => option.id === id)!;
    setSelection((previous) => ({
      ...previous,
      location: destination.location,
      experience: destination.experience,
      destinationAdviceRequested: advice,
      preferredDate: isRequestDateAllowed(
        previous.preferredDate,
        destination.experience,
      )
        ? previous.preferredDate
        : "",
    }));
    track("DestinationSelected", {
      location: destination.location,
      experience: destination.experience,
      needs_guidance: Number(advice),
    });
  }
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
    if (step < 3) {
      nextStep();
      return;
    }
    if (inFlight.current) return;
    setMessage("");
    setErrors({});
    const base = {
      ...selection,
      specialRequests,
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
    if (!parsed.success) {
      const fields = Object.fromEntries(
        parsed.error.issues.map((i) => [i.path[0] ?? "form", i.message]),
      );
      setErrors(fields);
      const fieldSteps: Record<string, number> = {
        location: 0,
        experience: 0,
        preferredDate: 1,
        groupSize: 2,
        duration: 2,
        licenceAcknowledgement: 3,
        specialRequests: 3,
        name: 3,
        email: 3,
        phone: 3,
      };
      setStep(
        Math.min(...Object.keys(fields).map((field) => fieldSteps[field] ?? 3)),
      );
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
      setContact({ name: "", email: "", phone: "", website: "" });
      setSpecialRequests("");
      setTimeout(() => {
        section.current?.scrollIntoView({
          block: "start",
          behavior: "instant",
        });
        document
          .getElementById("confirmation-title")
          ?.focus({ preventScroll: true });
      }, 0);
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
  const formattedDate = selection.preferredDate
    ? new Intl.DateTimeFormat("en-CA", {
        dateStyle: "medium",
        timeZone: "UTC",
      }).format(new Date(selection.preferredDate + "T12:00:00Z"))
    : "A day that works for you";
  return (
    <section
      ref={section}
      id="book"
      className={`booking-scene photo-chapter ${embedded ? "booking-embedded" : "booking-standalone"}`}
      aria-label="Plan your fishing session"
      data-backdrop={scene.id}
      data-step={confirmation ? "confirmation" : step}
    >
      <div className="booking-backdrops">
        {tripScenes.map((backdrop) => (
          <Photo
            key={backdrop.id}
            name={backdrop.image}
            alt={scene.id === backdrop.id ? backdrop.alt : ""}
            className={`booking-exposure ${scene.id === backdrop.id ? "is-active" : ""}`}
            sizes="100vw"
            eager={scene.id === backdrop.id}
          />
        ))}
      </div>
      <div className="booking-scrim" />
      <div className="booking-place" aria-hidden="true">
        <p className="eyebrow">
          {scene.experience === "ice-fishing"
            ? "LAKE SIMCOE / WINTER"
            : `${place.name.toUpperCase()} / SHORELINE`}
        </p>
        <div className="booking-outlines">
          {locations.map((location) => (
            <WaterOutline
              key={location.id}
              id={location.id}
              className={place.id === location.id ? "is-active" : ""}
            />
          ))}
        </div>
      </div>
      <External
        className="booking-map-credit"
        href="https://www.openstreetmap.org/copyright"
      >
        © OpenStreetMap contributors
      </External>
      <div className="booking-introduction">
        <p className="eyebrow">GUIDED BY NIKITA</p>
        <Heading className="booking-main-title">Your session.</Heading>
      </div>
      {confirmation ? (
        <div className="booking-panel booking-confirmation">
          <h2 id="confirmation-title" tabIndex={-1}>
            Request sent.
          </h2>
          <p>Nikita will confirm your session.</p>
          <div className="confirmation-summary">
            <span>{experience.name}</span>
            <span>{place.name}</span>
            <span>
              {formattedDate} · {selection.groupSize}{" "}
              {selection.groupSize === 1 ? "person" : "people"} ·{" "}
              {selection.duration}h
            </span>
          </div>
          <TripEstimate {...selection} />
          <p className="small">No payment taken. Nikita will confirm your date and final plan.</p>
          <p className="request-reference">
            Request reference: {confirmation.requestId}
          </p>
          <button
            className="text-button"
            type="button"
            onClick={() => {
              setConfirmation(null);
              setSelection({ ...defaults });
              setStep(0);
              setSpecialRequests("");
              flowStarted.current = false;
              measuredSteps.current.clear();
              attempt.current = null;
            }}
          >
            New session
          </button>
        </div>
      ) : (
        <div className="booking-panel">
          <div
            className="booking-progress"
            role="group"
            aria-label={`Step ${progressIndex + 1} of ${flow.length}: ${stepNames[step]}`}
          >
            <span className="eyebrow">
              {String(progressIndex + 1).padStart(2, "0")} /{" "}
              {String(flow.length).padStart(2, "0")}
            </span>
            <div aria-hidden="true">
              {flow.map((number, i) => (
                <i
                  key={number}
                  className={i <= progressIndex ? "is-complete" : ""}
                />
              ))}
            </div>
          </div>
          <form
            ref={form}
            name={netlifyFormName}
            method="POST"
            action={netlifyFormEndpoint}
            onSubmit={submit}
            noValidate
            aria-label="Booking request"
          >
            <input type="hidden" name="form-name" value={netlifyFormName} />
            <div className="booking-step-scroll">
              <ConversationStep
                step={step}
                selection={selection}
                update={update}
                chooseDestination={chooseDestination}
                goToStep={goToStep}
                specialRequests={specialRequests}
                setSpecialRequests={setSpecialRequests}
                contact={contact}
                setContact={setContact}
                errors={errors}
                setErrors={setErrors}
                busy={busy}
                formattedDate={formattedDate}
              />
            </div>
            <TripEstimate {...selection} />
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
            <div className="booking-step-actions">
              {step > 0 ? (
                <button
                  type="button"
                  className="booking-back"
                  disabled={busy}
                  onClick={() => goToStep(flow[Math.max(0, progressIndex - 1)])}
                >
                  Back
                </button>
              ) : null}
              {step < 3 ? (
                <button
                  type="button"
                  className="button booking-next"
                  key="continue-trip"
                  onClick={(event) => {
                    event.preventDefault();
                    nextStep();
                  }}
                >
                  {["Choose date", "Set group", "Your details"][step]}
                </button>
              ) : (
                <button
                  className="button submit-booking"
                  key="submit-request"
                  type="submit"
                  disabled={busy}
                  aria-busy={busy}
                >
                  {busy ? "Submitting…" : "Submit"}
                </button>
              )}
            </div>
            {step === 3 && (
              <p className="field-hint submit-note">
                No payment now. Nikita confirms availability and your final plan.{" "}
                <Link to="/privacy">Privacy</Link>
              </p>
            )}
          </form>
        </div>
      )}
    </section>
  );
}
