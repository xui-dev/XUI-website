import React from "react";

/**
 * XUI Logo — precisely traced from the source artwork.
 * Vector paths extracted via contour detection from the original 1080x1080 PNG,
 * so every vertex matches the source logo's geometry exactly (pixel-accurate).
 */
export default function XUILogo({
  width = 400,
  color = "#ffffff",
  background = "#000000",
  className = "",
}) {
  return (
    <div
      className={className}
      style={{
        background,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8%",
      }}
    >
      <svg
        width={width}
        viewBox="0 0 1080 1080"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="XUI logo"
      >
        <g fill={color}>
          {/* X — lower-left stroke */}
          <path d="M364,571 L329,536 L238,618 L315,617 L354,582 Z" />
          {/* U shape */}
          <path d="M513,471 L514,567 L525,589 L546,608 L577,618 L674,617 L701,606 L724,582 L732,556 L732,437 L687,468 L686,553 L681,564 L662,577 L582,577 L564,565 L558,552 L558,437 Z" />
          {/* X — upper-right small stroke */}
          <path d="M515,434 L446,434 L442,435 L395,479 L430,515 Z" />
          {/* X — main diagonal stroke */}
          <path d="M254,434 L433,617 L502,618 L333,439 L321,434 Z" />
          {/* I bar */}
          <path d="M812,418 L765,450 L766,619 L812,619 Z" />
        </g>
      </svg>
    </div>
  );
}
