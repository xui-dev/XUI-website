import React from "react";

interface XUILogoProps {
  className?: string;
  color?: string;
  height?: number | string;
}

/**
 * XUI Logo — precisely traced vector paths matching the official XUI geometry.
 * Scaled tightly for sleek navbar integration.
 */
export default function XUILogo({
  className = "",
  color = "#ffffff",
  height = 24,
}: XUILogoProps) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        height={height}
        viewBox="220 405 605 225"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="XUI logo"
        className="transition-transform duration-300 hover:scale-105"
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
