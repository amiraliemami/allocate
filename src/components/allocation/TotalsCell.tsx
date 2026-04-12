"use client";

import { memo } from "react";

const CELL_WIDTH = 56;

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * Math.max(0, Math.min(1, t)));
}

function getUtilizationColor(fraction: number | undefined): string | undefined {
  if (fraction == null || fraction === 0) return undefined;

  // Orange for low, white for optimal, red for over
  const orange = [200, 120, 0];
  const white = [255, 255, 255];
  const red = [180, 30, 30];

  let r: number, g: number, b: number;

  if (fraction < 70) {
    [r, g, b] = orange;
  } else if (fraction <= 89) {
    const t = (fraction - 70) / 19;
    r = lerp(orange[0], white[0], t);
    g = lerp(orange[1], white[1], t);
    b = lerp(orange[2], white[2], t);
  } else if (fraction <= 110) {
    [r, g, b] = white;
  } else if (fraction <= 130) {
    const t = (fraction - 110) / 20;
    r = lerp(white[0], red[0], t);
    g = lerp(white[1], red[1], t);
    b = lerp(white[2], red[2], t);
  } else {
    [r, g, b] = red;
  }

  return `rgb(${r}, ${g}, ${b})`;
}

function getIntensityColor(fraction: number | undefined): string | undefined {
  if (fraction == null || fraction === 0) return undefined;

  // White → violet, capping at 300%
  const white = [255, 255, 255];
  const violet = [109, 40, 217]; // violet-700
  const t = Math.min(fraction, 300) / 300;
  const r = lerp(white[0], violet[0], t);
  const g = lerp(white[1], violet[1], t);
  const b = lerp(white[2], violet[2], t);
  return `rgb(${r}, ${g}, ${b})`;
}

interface Props {
  fraction: number | undefined;
  isMonthStart?: boolean;
  noBorder?: boolean;
  variant?: "utilization" | "intensity";
}

function TotalsCellInner({ fraction, isMonthStart, noBorder, variant = "utilization" }: Props) {
  const displayValue =
    fraction != null && fraction > 0
      ? (fraction / 100).toFixed(fraction % 10 === 0 ? 1 : 2)
      : "";

  const bgColor = variant === "intensity"
    ? getIntensityColor(fraction)
    : getUtilizationColor(fraction);
  const isEmpty = !bgColor;

  const borderClass = isMonthStart
    ? "border-l-2 border-l-zinc-300"
    : isEmpty
      ? ""
      : "border-l border-l-zinc-200";

  // Text color logic differs per variant
  let textClass: string;
  if (isEmpty) {
    textClass = "text-zinc-400";
  } else if (variant === "intensity") {
    // White text when violet is dark enough
    textClass = fraction != null && fraction > 150 ? "text-white" : "text-zinc-800";
  } else {
    textClass = fraction != null && fraction >= 90 && fraction <= 110 ? "text-zinc-800" : "text-white";
  }

  return (
    <div
      style={{
        width: CELL_WIDTH,
        minWidth: CELL_WIDTH,
        backgroundColor: isEmpty ? "white" : bgColor,
      }}
      className={`flex items-center justify-center text-sm h-full box-border ${noBorder ? "" : "border-b-2 border-b-zinc-200"} ${borderClass} font-bold ${textClass}`}
    >
      {displayValue}
    </div>
  );
}

const TotalsCell = memo(TotalsCellInner);
export default TotalsCell;
