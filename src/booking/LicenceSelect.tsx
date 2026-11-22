import { useEffect, useRef, useState } from "react";
import { licenceOptions } from "./schema";

export function LicenceSelect({
  value,
  onChange,
  invalid,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [above, setAbove] = useState(false);
  const [menuHeight, setMenuHeight] = useState(250);
  const selected = licenceOptions.findIndex((option) => option.value === value);
  function show(last = false) {
    const bounds = trigger.current!.getBoundingClientRect();
    const panel = trigger.current!.closest(".booking-step-scroll")?.getBoundingClientRect();
    const belowSpace = Math.min(innerHeight, panel?.bottom ?? innerHeight) - bounds.bottom;
    const aboveSpace = bounds.top - Math.max(0, panel?.top ?? 0);
    const opensAbove = belowSpace < 210 && aboveSpace > belowSpace;
    setAbove(opensAbove);
    setMenuHeight(Math.max(48, Math.min(250, (opensAbove ? aboveSpace : belowSpace) - 12)));
    setActive(selected >= 0 ? selected : last ? licenceOptions.length - 1 : 0);
    setOpen(true);
  }
  function choose(index: number) {
    onChange(licenceOptions[index].value);
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  return (
    <div className="licence-select" ref={root}>
      <label id="licence-label" htmlFor="booking-licence">
        Fishing licence
      </label>
      <input type="hidden" name="licenceAcknowledgement" value={value} />
      <div className="licence-control">
        <button
          ref={trigger}
          id="booking-licence"
          type="button"
          role="combobox"
          className="licence-trigger"
          aria-labelledby="licence-label"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls="licence-options"
          aria-activedescendant={
            open ? "licence-option-" + licenceOptions[active].value : undefined
          }
          aria-required="true"
          aria-invalid={invalid}
          aria-describedby={
            invalid ? "licenceAcknowledgement-error" : undefined
          }
          onClick={() => (open ? setOpen(false) : show())}
          onKeyDown={(event) => {
            if (
              [
                "ArrowDown",
                "ArrowUp",
                "Home",
                "End",
                "Enter",
                " ",
                "Escape",
              ].includes(event.key)
            )
              event.preventDefault();
            if (event.key === "Escape" || event.key === "Tab") {
              setOpen(false);
              return;
            }
            if (event.key === "Enter" || event.key === " ") {
              if (open) choose(active);
              else show();
              return;
            }
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              if (!open) show(event.key === "ArrowUp");
              else
                setActive(
                  (current) =>
                    (current +
                      (event.key === "ArrowDown" ? 1 : -1) +
                      licenceOptions.length) %
                    licenceOptions.length,
                );
            } else if (event.key === "Home" || event.key === "End") {
              if (!open) show();
              setActive(event.key === "Home" ? 0 : licenceOptions.length - 1);
            }
          }}
        >
          <span>
            {selected >= 0
              ? licenceOptions[selected].label
              : "Choose your licence status"}
          </span>
          <svg
            viewBox="0 0 16 16"
            width="16"
            height="16"
            fill="none"
            aria-hidden="true"
          >
            <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
        {open && (
          <div
            id="licence-options"
            className="licence-menu"
            role="listbox"
            aria-labelledby="licence-label"
            data-side={above ? "above" : "below"}
            style={{ maxHeight: menuHeight }}
          >
            {licenceOptions.map((option, index) => (
              <button
                key={option.value}
                id={"licence-option-" + option.value}
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={value === option.value}
                className={active === index ? "is-active" : ""}
                onPointerMove={() => setActive(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(index)}
              >
                <span>{option.label}</span>
                <span aria-hidden="true">
                  {value === option.value ? "✓" : ""}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
