import { useRef, useState } from "react";
import { isRequestDateAllowed, ontarioToday } from "../data/config";
import type { ExperienceId } from "../data/config";
export function Calendar({
  value,
  onChange,
  experience,
  invalid = false,
}: {
  value: string;
  onChange: (value: string) => void;
  experience: ExperienceId;
  invalid?: boolean;
}) {
  const today = ontarioToday();
  const [month, setMonth] = useState(() =>
    new Date(`${value || today}T12:00:00Z`).toISOString().slice(0, 7),
  );
  const grid = useRef<HTMLDivElement>(null);
  const year = Number(month.slice(0, 4)),
    monthIndex = Number(month.slice(5, 7)) - 1;
  const first = new Date(Date.UTC(year, monthIndex, 1, 12));
  const days = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const monthTitle = new Intl.DateTimeFormat("en-CA", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(first);
  const lastAllowed = new Date(`${today}T12:00:00Z`);
  lastAllowed.setUTCDate(lastAllowed.getUTCDate() + 365);
  function changeMonth(amount: number) {
    const next = new Date(Date.UTC(year, monthIndex + amount, 1, 12));
    setMonth(next.toISOString().slice(0, 7));
  }
  function keyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    date: string,
  ) {
    let amount = 0;
    if (event.key === "ArrowRight") amount = 1;
    if (event.key === "ArrowLeft") amount = -1;
    if (event.key === "ArrowDown") amount = 7;
    if (event.key === "ArrowUp") amount = -7;
    if (!amount) return;
    event.preventDefault();
    const next = new Date(`${date}T12:00:00Z`);
    next.setUTCDate(next.getUTCDate() + amount);
    const target = next.toISOString().slice(0, 10);
    if (target.slice(0, 7) !== month) {
      if (target < today || target > lastAllowed.toISOString().slice(0, 10))
        return;
      setMonth(target.slice(0, 7));
    }
    setTimeout(
      () =>
        grid.current
          ?.querySelector<HTMLButtonElement>(`[data-date="${target}"]`)
          ?.focus(),
      0,
    );
  }
  return (
    <div className={`calendar ${invalid ? "invalid" : ""}`}>
      <div className="calendar-heading">
        <span id="calendar-title" aria-live="polite">
          {monthTitle}
        </span>
        <div>
          <button
            type="button"
            aria-label="Previous month"
            disabled={month <= today.slice(0, 7)}
            onClick={() => changeMonth(-1)}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next month"
            disabled={month >= lastAllowed.toISOString().slice(0, 7)}
            onClick={() => changeMonth(1)}
          >
            ›
          </button>
        </div>
      </div>
      <div
        ref={grid}
        className="calendar-grid"
        role="group"
        aria-labelledby="calendar-title"
        aria-invalid={invalid}
        aria-describedby={invalid ? "preferredDate-error" : undefined}
      >
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
          <span className="calendar-weekday" key={i} aria-hidden="true">
            {day}
          </span>
        ))}
        {Array.from({ length: first.getUTCDay() }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const date = `${month}-${String(i + 1).padStart(2, "0")}`;
          const allowed = isRequestDateAllowed(date, experience);
          return (
            <button
              type="button"
              data-date={date}
              key={date}
              disabled={!allowed}
              aria-label={`${new Intl.DateTimeFormat("en-CA", { dateStyle: "full", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`))}${allowed ? ", request only" : ", not requestable"}`}
              aria-pressed={value === date}
              onClick={() => onChange(date)}
              onKeyDown={(e) => keyDown(e, date)}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <p className="calendar-note">All selectable dates are request-only.</p>
    </div>
  );
}
