import type { Dispatch, ReactNode, SetStateAction } from "react";
import { External } from "../components";
import { fishingLevels, tripGuidance, tripIntents } from "../data/booking";
import type { FishingLevel, TripIntent } from "../data/booking";
import { durationOptions, officialLinks } from "../data/config";
import { locations } from "../data/locations";
import { tripScenes } from "../data/scenes";
import { Calendar } from "./Calendar";
import type { Selection } from "./BookingPage";
import { licenceOptions } from "./schema";

type Contact = { name: string; email: string; phone: string; website: string };
type Props = {
  step: number;
  selection: Selection;
  groupMore: boolean;
  update: <K extends keyof Selection>(key: K, value: Selection[K]) => void;
  chooseIntent: (intent: TripIntent) => void;
  chooseLevel: (level: FishingLevel) => void;
  chooseDestination: (id: string, advice?: boolean) => void;
  setGroupMore: Dispatch<SetStateAction<boolean>>;
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
  "What kind of day are you looking for?",
  "Have you been fishing before?",
  "Let’s find your water.",
  "Who’s coming along?",
  "When would you like to go?",
  "How long feels right?",
  "Anything we should know?",
  "Let’s arrange your trip.",
];

export function ConversationStep(props: Props) {
  const { step, selection, update, errors, groupMore, contact, busy } = props;
  const error = (key: string): ReactNode =>
    errors[key] ? (
      <p className="field-error" id={`${key}-error`}>
        {errors[key]}
      </p>
    ) : null;
  const place = locations.find(
    (location) => location.id === selection.location,
  )!;
  return (
    <div className="booking-step" key={step}>
      <h2 id="booking-step-title" tabIndex={-1}>
        {titles[step]}
      </h2>
      {step === 0 && (
        <>
          <p className="step-intro">
            Start with the feeling. We’ll take it from there.
            <br />
            <span className="optional-note">
              These preferences are optional.
            </span>
          </p>
          <button
            type="button"
            className="skip-planning"
            onClick={() => props.goToStep(2)}
          >
            Go straight to trip details
          </button>
          <fieldset>
            <legend className="sr-only">Your kind of fishing day</legend>
            <div className="conversation-choices">
              {tripIntents.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  aria-pressed={selection.tripIntent === option.value}
                  onClick={() => props.chooseIntent(option.value)}
                >
                  <span>
                    <strong>{option.label}</strong>
                    <small>{option.detail}</small>
                  </span>
                  <i aria-hidden="true">+</i>
                </button>
              ))}
            </div>
          </fieldset>
        </>
      )}
      {step === 1 && (
        <>
          <p className="step-intro">
            First-timers are welcome. This helps Nikita understand the day you
            have in mind.
            <br />
            <span className="optional-note">
              Optional — every experience level can enquire.
            </span>
          </p>
          <fieldset>
            <legend className="sr-only">Your fishing experience</legend>
            <div className="conversation-choices">
              {fishingLevels.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  aria-pressed={selection.fishingLevel === option.value}
                  onClick={() => props.chooseLevel(option.value)}
                >
                  <span>
                    <strong>{option.label}</strong>
                    <small>{option.detail}</small>
                  </span>
                  <i aria-hidden="true">+</i>
                </button>
              ))}
            </div>
          </fieldset>
        </>
      )}
      {step === 2 && (
        <>
          <p className="step-intro personalized-guidance">
            {tripGuidance(
              selection.tripIntent,
              selection.fishingLevel,
              selection.experience,
            )}
          </p>
          <fieldset>
            <legend className="sr-only">Choose a fishing destination</legend>
            <div className="conversation-choices destination-choices">
              {tripScenes.map((scene) => (
                <button
                  key={scene.id}
                  type="button"
                  aria-label={`${locations.find((location) => location.id === scene.location)!.name} — ${scene.experience === "ice-fishing" ? "Ice Fishing" : "Shoreline Fishing"}`}
                  aria-pressed={
                    !selection.destinationAdviceRequested &&
                    selection.location === scene.location &&
                    selection.experience === scene.experience
                  }
                  onClick={() => props.chooseDestination(scene.id)}
                >
                  <span>
                    <strong>
                      {
                        locations.find(
                          (location) => location.id === scene.location,
                        )!.name
                      }
                    </strong>
                    <small>
                      {scene.experience === "ice-fishing"
                        ? "Ice fishing · season and conditions reviewed"
                        : scene.location === "lake-simcoe"
                          ? "Shoreline fishing · an open lake horizon"
                          : scene.location === "holland-river"
                            ? "Shoreline fishing · a calmer river setting"
                            : "Shoreline fishing · moving water and changing light"}
                    </small>
                  </span>
                  <i aria-hidden="true">
                    {!selection.destinationAdviceRequested &&
                    selection.location === scene.location &&
                    selection.experience === scene.experience
                      ? "−"
                      : "+"}
                  </i>
                </button>
              ))}
            </div>
          </fieldset>
          <button
            className="help-choose"
            type="button"
            aria-pressed={selection.destinationAdviceRequested}
            onClick={() => props.chooseDestination("simcoe-shore", true)}
          >
            I’m not sure — help me choose
          </button>
          {selection.destinationAdviceRequested && (
            <p className="choice-advice" role="status">
              Let’s use Lake Simcoe shoreline as a starting point. Nikita will
              help choose the final location with you. You can change this
              suggestion.
            </p>
          )}
          {selection.experience === "ice-fishing" && (
            <p className="conditions-note">
              Ice fishing is Lake Simcoe only. Your preferred date is reviewed
              against the season, suitable ice conditions, and permissions; it
              does not indicate safe ice.
            </p>
          )}
        </>
      )}
      {step === 3 && (
        <fieldset>
          <legend className="sr-only">Number of people</legend>
          <p className="step-intro">
            Your outing is private. Come on your own or bring your people.
          </p>
          <div className="segmented people-options">
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
                  props.setGroupMore(size === 4);
                  update("groupSize", size);
                  if (size !== 4) props.goToStep(4);
                }}
              >
                {size === 4 ? "4+" : size}
                <span>{size === 1 ? "person" : "people"}</span>
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
                onChange={(event) =>
                  update("groupSize", Number(event.target.value))
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
      )}
      {step === 4 && (
        <fieldset>
          <legend className="sr-only">Preferred date</legend>
          <p className="step-intro">
            Choose a preferred date. These are request dates, not live
            appointments. Nikita confirms what’s possible.
          </p>
          <Calendar
            value={selection.preferredDate}
            onChange={(date) => update("preferredDate", date)}
            experience={selection.experience}
            invalid={Boolean(errors.preferredDate)}
          />
          {error("preferredDate")}
          <p className="field-hint">
            Weather, conditions, permissions, and fishing rules shape the final
            plan.{" "}
            {selection.experience === "ice-fishing"
              ? "Ice trips also require suitable ice and the appropriate season."
              : ""}
          </p>
        </fieldset>
      )}
      {step === 5 && (
        <fieldset>
          <legend className="sr-only">Session duration</legend>
          <p className="step-intro">
            A short escape or a longer pause. Choose the time you’d like to
            request.
          </p>
          <div className="segmented duration-options">
            {durationOptions.map((hours) => (
              <button
                type="button"
                key={hours}
                aria-pressed={selection.duration === hours}
                onClick={() => {
                  update("duration", hours);
                  props.goToStep(6);
                }}
              >
                {hours}
                <span>{hours === 1 ? "hour" : "hours"}</span>
              </button>
            ))}
          </div>
          <p className="field-hint">
            Nikita shares pricing before you commit. No payment is taken with
            this request.
          </p>
        </fieldset>
      )}
      {step === 6 && (
        <>
          <label className="special-request-label">
            Any special requests? <span>Optional</span>
            <textarea
              name="specialRequests"
              maxLength={1500}
              rows={2}
              value={props.specialRequests}
              onChange={(event) => props.setSpecialRequests(event.target.value)}
              placeholder="Anything you’d like Nikita to know about your day."
              aria-invalid={Boolean(errors.specialRequests)}
              aria-describedby={
                errors.specialRequests ? "specialRequests-error" : undefined
              }
            />
          </label>
          {error("specialRequests")}
          <fieldset className="licence-section">
            <legend>One thing before we head out.</legend>
            <p id="licence-label" className="step-intro">
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
            <details>
              <summary>A little help with the licence rules</summary>
              <p>
                Most Ontario and other Canadian residents aged 18–64 need a
                fishing licence. Residents under 18 or 65 and older generally
                don’t need to buy one, but must carry the required ID.
                International visitors have different requirements.
              </p>
              <p>
                A one-day sport fishing licence does not require an Outdoors
                Card. Check the current rules for your residency and
                circumstances. Each person is responsible for meeting the
                requirements; this acknowledgement is not legal verification.
              </p>
              <div className="licence-links">
                <External href={officialLinks.licence}>
                  Ontario fishing licences
                </External>
                <External href={officialLinks.visitors}>
                  International visitor guidance
                </External>
                <External href={officialLinks.regulations}>
                  Official Ontario rules & regulations
                </External>
              </div>
            </details>
          </fieldset>
        </>
      )}
      {step === 7 && (
        <>
          <p className="step-intro">
            Nikita will review your request and get in touch to agree pricing,
            equipment, the meeting point, and conditions before you commit.
          </p>
          <dl className="conversation-summary">
            <div>
              <dt>Your fishing day</dt>
              <dd>
                {place.name} ·{" "}
                {selection.experience === "ice-fishing"
                  ? "Ice Fishing"
                  : "Shoreline Fishing"}
                {selection.destinationAdviceRequested
                  ? " · help choosing requested"
                  : ""}
              </dd>
            </div>
            <div>
              <dt>Your request</dt>
              <dd>
                {props.formattedDate} · {selection.groupSize}{" "}
                {selection.groupSize === 1 ? "person" : "people"} ·{" "}
                {selection.duration}{" "}
                {selection.duration === 1 ? "hour" : "hours"}
              </dd>
            </div>
            <div>
              <dt>Pricing</dt>
              <dd>Shared by Nikita before you commit. No payment now.</dd>
            </div>
          </dl>
          <button
            type="button"
            className="edit-trip"
            onClick={() => props.goToStep(2)}
          >
            Edit trip details
          </button>
          <fieldset disabled={busy}>
            <legend className="sr-only">Contact details</legend>
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
        </>
      )}
    </div>
  );
}
