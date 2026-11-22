import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { External, Photo } from "../components";
import { WaterOutline } from "../Atlas";
import { getTripScene, tripScenes } from "../data/scenes";
import geography from "../data/geography.json";
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
import { ConversationStep } from "./ConversationStep";
import { tripIntents, fishingLevels } from "../data/booking";
import type { TripIntent, FishingLevel } from "../data/booking";
export type Selection = {
  experience: ExperienceId;
  location: LocationId;
  groupSize: number;
  duration: number;
  preferredDate: string;
  licenceAcknowledgement: string;
  tripIntent: TripIntent | "";
  fishingLevel: FishingLevel | "";
  destinationAdviceRequested: boolean;
};
const defaults: Selection = {
  experience: "shoreline-fishing",
  location: "lake-simcoe",
  groupSize: 2,
  duration: 2,
  preferredDate: "",
  licenceAcknowledgement: "",
  tripIntent: "",
  fishingLevel: "",
  destinationAdviceRequested: false,
};
const storageKey = "fishn-trip-preferences";
export function BookingPage({ embedded = false }: { embedded?: boolean }) {
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
        if (tripIntents.some((option) => option.value === saved.tripIntent))
          initial.tripIntent = saved.tripIntent;
        if (fishingLevels.some((option) => option.value === saved.fishingLevel))
          initial.fishingLevel = saved.fishingLevel;
        initial.destinationAdviceRequested =
          saved.destinationAdviceRequested === true;
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
  const place = locations.find(
    (location) => location.id === selection.location,
  )!;
  const scene = getTripScene(selection.location, selection.experience);
  const Heading = embedded ? "h2" : "h1";
  const stepNames = [
    "Your kind of day",
    "A little about you",
    "Your water",
    "Your people",
    "Your date",
    "Your pace",
    "Anything else",
    "Let’s arrange it",
  ];
  const flow =
    selection.tripIntent === "first-time"
      ? [0, 2, 3, 4, 5, 6, 7]
      : [0, 1, 2, 3, 4, 5, 6, 7];
  const progressIndex = flow.indexOf(step);
  function startFlow() {
    if (flowStarted.current) return;
    flowStarted.current = true;
    track("BookingStarted", { experience: selection.experience });
  }
  function goToStep(next: number) {
    startFlow();
    if (next === 7 && !measuredSteps.current.has(7)) {
      measuredSteps.current.add(7);
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
      step === 4 &&
      !isRequestDateAllowed(selection.preferredDate, selection.experience)
    )
      fields.preferredDate = "Please choose a preferred request date.";
    if (
      step === 3 &&
      (!Number.isInteger(selection.groupSize) ||
        selection.groupSize < (groupMore ? 4 : 1) ||
        selection.groupSize > 100)
    )
      fields.groupSize = "Please enter your group size, from 4 to 100 people.";
    if (
      step === 6 &&
      !licenceOptions.some(
        (option) => option.value === selection.licenceAcknowledgement,
      )
    )
      fields.licenceAcknowledgement =
        "Please acknowledge the fishing licence requirements.";
    setErrors(fields);
    if (Object.keys(fields).length) {
      setMessage("A little detail before we continue.");
      setTimeout(() => messageRef.current?.focus(), 0);
      return;
    }
    goToStep(flow[Math.min(flow.length - 1, progressIndex + 1)]);
  }
  function chooseIntent(value: TripIntent) {
    startFlow();
    setSelection((previous) => ({
      ...previous,
      tripIntent: value,
      ...(value === "first-time" ? { fishingLevel: "new" as const } : {}),
    }));
    track("TripPreferenceSelected", { preference: value });
    goToStep(value === "first-time" ? 2 : 1);
  }
  function chooseLevel(value: FishingLevel) {
    startFlow();
    update("fishingLevel", value);
    track("FishingExperienceSelected", { experience_level: value });
    goToStep(2);
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
    if (step < 7) {
      nextStep();
      return;
    }
    if (inFlight.current) return;
    setMessage("");
    setErrors({});
    const base = {
      ...selection,
      tripIntent: selection.tripIntent || undefined,
      fishingLevel: selection.fishingLevel || undefined,
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
    if (!parsed.success || (groupMore && selection.groupSize < 4)) {
      const fields = !parsed.success
        ? Object.fromEntries(
            parsed.error.issues.map((i) => [i.path[0] ?? "form", i.message]),
          )
        : { groupSize: "Please enter the actual group size, starting at 4." };
      setErrors(fields);
      const fieldSteps: Record<string, number> = {
        location: 2,
        experience: 2,
        preferredDate: 4,
        groupSize: 3,
        duration: 5,
        licenceAcknowledgement: 6,
        specialRequests: 6,
        name: 7,
        email: 7,
        phone: 7,
      };
      setStep(
        Math.min(...Object.keys(fields).map((field) => fieldSteps[field] ?? 7)),
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
      try {
        localStorage.removeItem(storageKey);
      } catch {
        /* Optional storage. */
      }
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
      aria-label="Plan your fishing day"
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
        <p className="eyebrow">
          {geography.features[place.id].coordinate}
          <br />
          GEOGRAPHIC REFERENCE
        </p>
      </div>
      <External
        className="booking-map-credit"
        href="https://www.openstreetmap.org/copyright"
      >
        © OpenStreetMap contributors
      </External>
      <div className="booking-introduction">
        <p className="eyebrow">THE NEXT CHAPTER IS YOURS.</p>
        <Heading className="booking-main-title">
          Your next
          <br />
          <span>good day.</span>
        </Heading>
      </div>
      {confirmation ? (
        <div className="booking-panel booking-confirmation">
          <p className="eyebrow">A GOOD DAY IS TAKING SHAPE</p>
          <h2 id="confirmation-title" tabIndex={-1}>
            Adventure
            <br />
            requested.
          </h2>
          <p>
            Thanks for reaching out. Nikita will be in touch to confirm the
            details of your trip.
          </p>
          <div className="confirmation-summary">
            <span>{experience.name}</span>
            <span>{place.name}</span>
            <span>
              {formattedDate} · {selection.groupSize}{" "}
              {selection.groupSize === 1 ? "person" : "people"} ·{" "}
              {selection.duration}h
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
            className="text-button"
            type="button"
            onClick={() => {
              setConfirmation(null);
              setSelection({ ...defaults });
              setGroupMore(false);
              setStep(0);
              setSpecialRequests("");
              flowStarted.current = false;
              measuredSteps.current.clear();
              attempt.current = null;
            }}
          >
            Plan another day
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
            <span>{stepNames[step]}</span>
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
            onSubmit={submit}
            noValidate
            aria-label="Booking request"
          >
            <ConversationStep
              step={step}
              selection={selection}
              groupMore={groupMore}
              update={update}
              chooseIntent={chooseIntent}
              chooseLevel={chooseLevel}
              chooseDestination={chooseDestination}
              setGroupMore={setGroupMore}
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
            {ready === false && (
              <div className="booking-delivery-state" role="status">
                <strong>Online requests are opening soon.</strong>
                <span>
                  {step === 7 ? (
                    <>
                      To send your enquiry now,{" "}
                      <External href={officialLinks.instagram}>
                        contact Nikita on Instagram
                      </External>
                      .
                    </>
                  ) : (
                    "You can still plan your day here."
                  )}
                </span>
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
              ) : (
                <span className="booking-first-note">
                  A request first.
                  <br />
                  The details, together.
                </span>
              )}
              {step < 7 ? (
                <button
                  type="button"
                  className="button booking-next"
                  key="continue-trip"
                  onClick={(event) => {
                    event.preventDefault();
                    nextStep();
                  }}
                >
                  {(step === 0 && !selection.tripIntent) ||
                  (step === 1 && !selection.fishingLevel)
                    ? "Skip for now"
                    : "Continue"}{" "}
                  <span aria-hidden="true">+</span>
                </button>
              ) : (
                <button
                  className="button submit-booking"
                  key="submit-request"
                  type="submit"
                  disabled={busy || ready !== true}
                  aria-busy={busy}
                >
                  {busy ? "Sending your request…" : "Request my fishing trip"}
                </button>
              )}
            </div>
            {step === 7 && (
              <p className="field-hint submit-note">
                A request, not a confirmed booking. No payment is taken.
                <br />
                Your details are used to arrange your trip.{" "}
                <Link to="/privacy">Read our privacy notice.</Link>
              </p>
            )}
          </form>
          {step > 0 && (
            <p className="booking-tripline">
              {place.name} <span> / </span>
              {experience.name}
              {selection.preferredDate && (
                <>
                  {" "}
                  <span> / </span>
                  {formattedDate}
                </>
              )}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
