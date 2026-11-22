import { useEffect, useRef, useState } from "react";
import { browserToday, isRequestDateAllowed, ontarioToday } from "../data/config";
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
  const [now, setNow] = useState(() => new Date());
  const today = browserToday(now);
  const [browsedMonth, setMonth] = useState("");
  // Read the visitor's clock on opening and when returning to a long-lived tab.
  useEffect(() => {
    const refresh = () => setNow(new Date());
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  const lastAllowed = new Date(`${ontarioToday(now)}T12:00:00Z`);
  lastAllowed.setUTCDate(lastAllowed.getUTCDate() + 365);
  const firstMonth = today.slice(0, 7);
  const lastMonth = lastAllowed.toISOString().slice(0, 7);
  const requestedMonth = browsedMonth || (
    isRequestDateAllowed(value, experience, now) ? value.slice(0, 7) : firstMonth
  );
  const month = requestedMonth < firstMonth
    ? firstMonth
    : requestedMonth > lastMonth ? lastMonth : requestedMonth;
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
          const allowed = isRequestDateAllowed(date, experience, now);
          return (
            <button
              type="button"
              data-date={date}
              key={date}
              disabled={!allowed}
              aria-label={`${new Intl.DateTimeFormat("en-CA", { dateStyle: "full", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`))}${allowed ? ", request only" : ", not requestable"}`}
              aria-pressed={value === date}
              aria-current={date === today ? "date" : undefined}
              onClick={() => onChange(date)}
              onKeyDown={(e) => keyDown(e, date)}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
