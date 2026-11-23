import { useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { External, Photo } from "../components";
import {
  durationOptions,
  groupSizeOptions,
  officialLinks,
} from "../data/config";
import { locations } from "../data/locations";
import { tripScenes } from "../data/scenes";
import { formatPrice, tripPrice } from "../data/pricing";
import { Calendar } from "./Calendar";
import type { Selection } from "./BookingPage";
import { LicenceSelect } from "./LicenceSelect";

type Contact = { name: string; email: string; phone: string; website: string };
type Props = {
  step: number;
  selection: Selection;
  update: <K extends keyof Selection>(key: K, value: Selection[K]) => void;
  chooseDestination: (id: string, advice?: boolean) => void;
  goToStep: (step: number) => void;
  specialRequests: string;
  setSpecialRequests: Dispatch<SetStateAction<string>>;
  contact: Contact;
  setContact: Dispatch<SetStateAction<Contact>>;
  errors: Record<string, string>;
  setErrors: Dispatch<SetStateAction<Record<string, string>>>;
  busy: boolean;
  formattedDate: string;
};
const titles = [
  "Choose your water.",
  "Choose a date.",
  "People & hours.",
  "Your details.",
];

export function ConversationStep(props: Props) {
  const { step, selection, update, errors, contact, busy } = props;
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">(
    "idle",
  );
  const error = (key: string): ReactNode =>
    errors[key] ? (
      <p className="field-error" id={key + "-error"}>
        {errors[key]}
      </p>
    ) : null;
  const place = locations.find(
    (location) => location.id === selection.location,
  )!;
  const mode =
    selection.experience === "ice-fishing"
      ? "Ice fishing"
      : "Shoreline fishing";
  const requestText = [
    "Hi Nikita, I’d like to request a guided fishing session.",
    selection.destinationAdviceRequested
      ? "Please help me choose a location (Lake Simcoe shoreline as a starting point)."
      : place.name + " · " + mode,
    props.formattedDate +
      " · " +
      selection.groupSize +
      (selection.groupSize === 1 ? " person" : " people") +
      " · " +
      selection.duration +
      (selection.duration === 1 ? " hour" : " hours"),
    "Session total: " + formatPrice(tripPrice(selection.experience, selection.groupSize, selection.duration).total) + " CAD. All fishing gear and equipment included.",
    "Could you confirm availability and the final plan?",
  ].join("\n");

  return (
    <div className="booking-step" key={step}>
      <h2 id="booking-step-title" tabIndex={-1}>
        {titles[step]}
      </h2>
      {step === 0 && (
        <>
          <fieldset>
            <legend className="sr-only">Choose a fishing destination</legend>
            <div className="destination-choices">
              {tripScenes.map((scene) => {
                const selected =
                  !selection.destinationAdviceRequested &&
                  selection.location === scene.location &&
                  selection.experience === scene.experience;
                const name = locations.find(
                  (location) => location.id === scene.location,
                )!.name;
                return (
                  <button
                    key={scene.id}
                    type="button"
                    aria-label={
                      name +
                      " — " +
                      (scene.experience === "ice-fishing"
                        ? "Ice Fishing"
                        : "Shoreline Fishing")
                    }
                    aria-pressed={selected}
                    onClick={() => props.chooseDestination(scene.id)}
                  >
                    <Photo name={scene.image} alt="" sizes="72px" eager />
                    <span>
                      <strong>{name}</strong>
                      <small>
                        <span className="destination-mode-full">{scene.experience === "ice-fishing"
                          ? "Ice fishing"
                          : "Shoreline fishing"}</span>
                        <span className="destination-mode-short" aria-hidden="true">
                          {scene.experience === "ice-fishing" ? "Ice" : "Shoreline"}
                        </span>
                      </small>
                    </span>
                    <i aria-hidden="true">{selected ? "✓" : "→"}</i>
                  </button>
                );
              })}
            </div>
          </fieldset>
          <button
            className="help-choose"
            type="button"
            aria-pressed={selection.destinationAdviceRequested}
            onClick={() => props.chooseDestination("simcoe-shore", true)}
          >
            {selection.destinationAdviceRequested
              ? "✓ Guide chooses"
              : "Choose for me"}
          </button>
          {selection.destinationAdviceRequested && (
            <p className="choice-advice" role="status">
              Location confirmed with Nikita.
            </p>
          )}
          {selection.experience === "ice-fishing" && (
            <p className="conditions-note">
              Subject to season, suitable ice, and guide approval.
            </p>
          )}
        </>
      )}
      {step === 1 && (
        <fieldset>
          <legend className="sr-only">Preferred date</legend>
          <p className="step-intro">
            Preferred date. Nikita confirms availability.
          </p>
          <Calendar
            value={selection.preferredDate}
            onChange={(date) => update("preferredDate", date)}
            experience={selection.experience}
            invalid={Boolean(errors.preferredDate)}
          />
          {error("preferredDate")}
        </fieldset>
      )}
      {step === 2 && (
        <>
          {(
            [
              {
                key: "groupSize",
                title: "People",
                options: groupSizeOptions,
                unit: "people",
                singular: "person",
              },
              {
                key: "duration",
                title: "Trip length",
                options: durationOptions,
                unit: "hours",
                singular: "hour",
              },
            ] as const
          ).map((choice) => (
            <fieldset className="number-choice" key={choice.key}>
              <legend>
                {choice.title}
                <output aria-live="polite">
                  {selection[choice.key]}{" "}
                  {selection[choice.key] === 1 ? choice.singular : choice.unit}
                </output>
              </legend>
              <div className={`number-options ${choice.key === "duration" ? "duration-options" : "people-options"}`}>
                {choice.options.map((value) => (
                  <button
                    type="button"
                    key={value}
                    aria-label={
                      value +
                      " " +
                      (value === 1 ? choice.singular : choice.unit)
                    }
                    aria-pressed={selection[choice.key] === value}
                    onClick={() => update(choice.key, value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
              {choice.key === "groupSize" && (
                <div className="group-size-label">
                  <label htmlFor="group-size">Number of people</label>
                  <input
                    id="group-size"
                    type="number"
                    name="groupSize"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    required
                    value={selection.groupSize || ""}
                    onChange={(event) => update("groupSize", Number(event.target.value))}
                    aria-invalid={Boolean(errors.groupSize)}
                    aria-describedby={errors.groupSize ? "groupSize-error" : undefined}
                  />
                </div>
              )}
              {error(choice.key)}
            </fieldset>
          ))}
        </>
      )}
      {step === 3 && (
        <>
          <div className="session-review">
            <p>
              <strong>
                {selection.destinationAdviceRequested
                  ? "Location with Nikita"
                  : place.name}
              </strong>
              <span>{mode}</span>
            </p>
            <p>
              {props.formattedDate} · {selection.groupSize}{" "}
              {selection.groupSize === 1 ? "person" : "people"} ·{" "}
              {selection.duration}h
            </p>
            <button
              type="button"
              className="edit-trip"
              onClick={() => {
                setCopyState("idle");
                props.goToStep(0);
              }}
            >
              Edit
            </button>
          </div>
          <fieldset disabled={busy}>
            <legend className="sr-only">Your contact details</legend>
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
                    onChange={(event) => {
                      props.setContact({
                        ...contact,
                        [field.key]: event.target.value,
                      });
                      props.setErrors({ ...errors, [field.key]: "" });
                    }}
                    aria-invalid={Boolean(errors[field.key])}
                    aria-describedby={
                      errors[field.key] ? field.key + "-error" : undefined
                    }
                  />
                  {error(field.key)}
                </label>
              ))}
            </div>
            <LicenceSelect
              value={selection.licenceAcknowledgement}
              onChange={(value) => update("licenceAcknowledgement", value)}
              invalid={Boolean(errors.licenceAcknowledgement)}
            />
            {error("licenceAcknowledgement")}
            <External className="licence-help" href={officialLinks.licence}>
              Licence guidance ↗
            </External>
            <details
              className="optional-request"
              open={Boolean(errors.specialRequests) || undefined}
            >
              <summary>Add a note (optional)</summary>
              <label className="special-request-label">
                Anything Nikita should know?
                <textarea
                  name="specialRequests"
                  maxLength={1500}
                  rows={2}
                  value={props.specialRequests}
                  onChange={(event) =>
                    props.setSpecialRequests(event.target.value)
                  }
                  aria-invalid={Boolean(errors.specialRequests)}
                  aria-describedby={
                    errors.specialRequests ? "specialRequests-error" : undefined
                  }
                />
              </label>
              {error("specialRequests")}
            </details>
            <div className="honeypot" aria-hidden="true">
              <label>
                Leave this empty
                <input
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={contact.website}
                  onChange={(event) =>
                    props.setContact({
                      ...contact,
                      website: event.target.value,
                    })
                  }
                />
              </label>
            </div>
          </fieldset>
          <details className="instagram-option">
            <summary>Instagram ↗</summary>
            <div className="direct-enquiry">
              <p>Copy your session details, then send them in your message.</p>
              <button
                className="copy-session"
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(requestText);
                    setCopyState("copied");
                  } catch {
                    setCopyState("manual");
                  }
                }}
              >
                {copyState === "copied"
                  ? "✓ Session details copied"
                  : "Copy session details"}
              </button>
              {copyState === "copied" && (
                <p role="status">Copied. Open Instagram and paste your plan.</p>
              )}
              {copyState === "manual" && (
                <label className="manual-copy">
                  Copy this into your message
                  <textarea
                    readOnly
                    value={requestText}
                    rows={6}
                    onFocus={(event) => event.target.select()}
                  />
                </label>
              )}
              <External className="text-link" href={officialLinks.instagram}>
                Open Instagram
              </External>
            </div>
          </details>
        </>
      )}
    </div>
  );
}
