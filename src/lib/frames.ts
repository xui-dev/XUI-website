/**
 * Helper to generate frame paths following the exact specification:
 * - 1 to 99: frame01.webp ... frame99.webp
 * - 100+: frame100.webp ... frame240.webp
 */
export function getFrameFileName(index: number): string {
  const clamped = Math.max(1, Math.round(index));
  const num = clamped < 100 ? String(clamped).padStart(2, "0") : String(clamped);
  return `frame${num}.webp`;
}

export const getHeroFrameSrc = (index: number): string =>
  `/frame/${getFrameFileName(index)}`;

export const getLaserFrameSrc = (index: number): string =>
  `/laser/${getFrameFileName(index)}`;

export const getFlightFrameSrc = (index: number): string =>
  `/hide_robot/${getFrameFileName(index)}`;
