import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Photo } from "../components";
import photography from "../data/photography.json";
import { catches } from "./catches";

function CatchCrop({ index, eager }: { index: number; eager: boolean }) {
  const item = catches[index];
  const original = photography[item.image];
  const [x, y, width, height] = item.crop;
  const aspect = (original.width * width) / (original.height * height);
  return (
    <div
      className="catch-crop"
      style={{ "--crop-aspect": aspect } as CSSProperties}
    >
      <Photo
        name={item.image}
        alt={item.note}
        eager={eager}
        sizes="(max-width: 700px) 85vw, 520px"
        style={{
          width: 100 / width + "%",
          height: 100 / height + "%",
          left: (-x * 100) / width + "%",
          top: (-y * 100) / height + "%",
        }}
      />
    </div>
  );
}
function aspectAt(index: number) {
  const item = catches[index];
  const photo = photography[item.image];
  return (photo.width * item.crop[2]) / (photo.height * item.crop[3]);
}
export function CatchGallery({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  function goTo(index: number, instant = false) {
    const next = (index + catches.length) % catches.length;
    const element = rail.current;
    const card = element?.querySelector<HTMLElement>(
      '[data-frame="' + next + '"]',
    );
    if (!element || !card) return;
    element.scrollTo({
      left: card.offsetLeft - (element.clientWidth - card.offsetWidth) / 2,
      behavior:
        instant || matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
    });
    setActive(next);
  }
  useEffect(() => {
    if (!open || !dialog.current) return;
    const element = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const previousScroll = window.scrollY;
    element.showModal();
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => {
      const track = rail.current;
      const selected = track?.querySelector<HTMLElement>(
        '[aria-pressed="true"]',
      );
      if (track && selected)
        track.scrollLeft =
          selected.offsetLeft - (track.clientWidth - selected.offsetWidth) / 2;
    });
    return () => {
      cancelAnimationFrame(frame);
      element.close();
      document.body.style.overflow = previousOverflow;
      window.scrollTo({ top: previousScroll, behavior: "instant" });
      previousFocus?.focus({ preventScroll: true });
    };
  }, [open]);
  return (
    <dialog
      ref={dialog}
      className="catch-gallery"
      aria-labelledby="gallery-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Tab") {
          const controls = event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not([disabled]):not([tabindex="-1"])',
          );
          const first = controls[0],
            last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
          return;
        }
        if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) {
          event.preventDefault();
          goTo(
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? catches.length - 1
                : active + (event.key === "ArrowRight" ? 1 : -1),
          );
        }
      }}
    >
      {open && (
        <div className="journal-drawer glass-surface">
          <div className="journal-top">
            <h2 id="gallery-title">Journal</h2>
            <button type="button" onClick={onClose} aria-label="Close gallery">
              ×
            </button>
          </div>
          <div
            className="journal-rail"
            ref={rail}
            style={
              {
                "--first-aspect": aspectAt(0),
                "--last-aspect": aspectAt(catches.length - 1),
              } as CSSProperties
            }
            onScroll={() => {
              const element = rail.current;
              if (!element) return;
              const center = element.scrollLeft + element.clientWidth / 2;
              let closest = 0,
                distance = Infinity;
              element
                .querySelectorAll<HTMLElement>("[data-frame]")
                .forEach((card) => {
                  const delta = Math.abs(
                    card.offsetLeft + card.offsetWidth / 2 - center,
                  );
                  if (delta < distance) {
                    closest = Number(card.dataset.frame);
                    distance = delta;
                  }
                });
              setActive(closest);
            }}
          >
            {catches.map((item, index) => (
              <button
                type="button"
                className="journal-frame"
                data-frame={index}
                style={{ "--frame-aspect": aspectAt(index) } as CSSProperties}
                key={item.image}
                aria-label={"View " + item.title}
                aria-pressed={active === index}
                tabIndex={active === index ? 0 : -1}
                onClick={() => goTo(index)}
              >
                <CatchCrop
                  index={index}
                  eager={Math.abs(index - active) <= 2}
                />
                <span className="frame-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </button>
            ))}
          </div>
          <div className="gallery-controls">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Previous catch"
            >
              ←
            </button>
            <span aria-live="polite">
              {String(active + 1).padStart(2, "0")} /{" "}
              {String(catches.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Next catch"
            >
              →
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
