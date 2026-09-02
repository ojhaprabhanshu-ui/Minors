import React from "react";

/**
 * RoundTransitionNotification
 * ----------------------------------------------------------------------------
 * A prominent, modal-style overlay shown the moment the user clicks
 * "End Interview" (or when the round finishes for any other reason). It blocks
 * interaction with the underlying round UI so the user can never click twice
 * and so the transition feels deliberate instead of broken.
 *
 * The component is theme-agnostic: it accepts an `accentColor` to match the
 * round's branding (blue for Technical, pink for HR, purple for the Full
 * Interview orchestrator). Defaults to indigo.
 *
 * Props:
 *   - visible:        whether to show the overlay
 *   - title:          primary message (defaults to the requested text)
 *   - subtitle:       secondary explanation
 *   - accentColor:    colour for the spinner ring and progress bar
 *   - backdropColor:  RGBA colour for the dim backdrop
 *   - ariaLabel:      a11y label for the spinner
 *
 * The component is intentionally side-effect-free: it does NOT touch the
 * parent state, call any APIs, or do any cleanup. The parent owns the
 * `visible` flag and is responsible for setting it to `false` once the next
 * stage has rendered. This keeps the data flow obvious and the component
 * trivial to reason about.
 */
export default function RoundTransitionNotification({
  visible = false,
  title = "Another round is loading, please wait...",
  subtitle = "We are preparing your next interview stage. Please don't close or refresh this window.",
  accentColor = "#6366f1",
  backdropColor = "rgba(15, 23, 42, 0.55)",
  ariaLabel = "Loading next round",
}) {
  if (!visible) return null;

  return (
    <div
      role="alertdialog"
      aria-live="assertive"
      aria-busy="true"
      aria-label={ariaLabel}
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        zIndex: 1080,
        backgroundColor: backdropColor,
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
        animation: "rtn-fadein 180ms ease-out",
      }}
    >
      <div
        className="card border-0 shadow-lg p-4 p-md-5 text-center"
        style={{
          borderRadius: "20px",
          maxWidth: "440px",
          width: "calc(100% - 2rem)",
          animation: "rtn-pop 220ms ease-out",
        }}
      >
        <div
          className="mx-auto mb-3 d-flex align-items-center justify-content-center position-relative"
          style={{
            width: "84px",
            height: "84px",
            borderRadius: "50%",
            backgroundColor: `${accentColor}1A`, // 10% alpha tint
          }}
        >
          <span
            className="spinner-border"
            role="status"
            aria-label={ariaLabel}
            style={{
              width: "2.6rem",
              height: "2.6rem",
              color: accentColor,
              borderWidth: "0.32em",
            }}
          ></span>
          <i
            className="fa-solid fa-forward position-absolute"
            aria-hidden="true"
            style={{
              color: accentColor,
              fontSize: "0.95rem",
              opacity: 0.85,
            }}
          ></i>
        </div>

        <h5 className="fw-bold text-dark mb-2" style={{ lineHeight: 1.35 }}>
          {title}
        </h5>
        <p className="text-muted small mb-3" style={{ lineHeight: 1.55 }}>
          {subtitle}
        </p>

        <div className="progress" style={{ height: "6px", borderRadius: "3px", backgroundColor: "#e2e8f0" }}>
          <div
            className="progress-bar progress-bar-striped progress-bar-animated"
            style={{
              width: "100%",
              backgroundColor: accentColor,
            }}
          ></div>
        </div>

        <p className="text-muted small mt-3 mb-0" style={{ fontSize: "0.7rem" }}>
          <i className="fa-solid fa-circle-info me-1" aria-hidden="true"></i>
          This usually takes 1–3 seconds.
        </p>
      </div>

      <style>{`
        @keyframes rtn-fadein {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes rtn-pop {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
