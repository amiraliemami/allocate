"use client";

import { useState, useEffect, useRef, useMemo } from "react";

const SQUARE_SIZE = 48;
const GAP = 4;
const CELL = SQUARE_SIZE + GAP;
const CIRCLE_RADIUS = 120;
const TICK_MS = 200;
const MAX_ACTIVE_RATIO = 0.12;

const COLORS = [
  "#ddd6fe", // violet-200
  "#c4b5fd", // violet-300
  "#ede9fe", // violet-100
  "#e0f2fe", // sky-100
  "#bfdbfe", // blue-200
  "#dbeafe", // blue-100
  "#d1fae5", // emerald-100
  "#a7f3d0", // emerald-200
  "#fef3c7", // amber-100
  "#fde68a", // amber-200
  "#ffe4e6", // rose-100
  "#fecdd3", // rose-200
  "#e4e4e7", // zinc-200
  "#f4f4f5", // zinc-100
  "#f0edff", // custom violet light
  "#e8e4ff", // custom violet
];

function pickColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function buildLayout(w: number, h: number) {
  const cols = Math.ceil(w / CELL) + 1;
  const rows = Math.ceil(h / CELL) + 1;
  const cx = w / 2;
  const cy = h / 2;

  const excluded = new Set<number>();
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * CELL + SQUARE_SIZE / 2;
      const y = row * CELL + SQUARE_SIZE / 2;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist < CIRCLE_RADIUS) {
        excluded.add(row * cols + col);
      }
    }
  }

  return { cols, rows, excluded };
}

export default function LoginBackground() {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [grid, setGrid] = useState<(string | null)[]>([]);
  const gridRef = useRef<(string | null)[]>([]);

  const { cols, rows, excluded } = useMemo(
    () => (size.w > 0 ? buildLayout(size.w, size.h) : { cols: 0, rows: 0, excluded: new Set<number>() }),
    [size.w, size.h]
  );

  // Measure window size on mount + resize
  useEffect(() => {
    const measure = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Animate squares — also resets grid when layout changes
  useEffect(() => {
    const total = cols * rows;
    if (total === 0) return;

    // Reset grid for new layout
    const newGrid = new Array<string | null>(total).fill(null);
    gridRef.current = newGrid;

    const maxActive = Math.floor((total - excluded.size) * MAX_ACTIVE_RATIO);

    const interval = setInterval(() => {
      const current = gridRef.current;
      const next = [...current];

      let activeCount = 0;
      const activeIndices: number[] = [];
      for (let i = 0; i < total; i++) {
        if (next[i]) {
          activeCount++;
          activeIndices.push(i);
        }
      }

      // Randomly turn off 1-2 active squares
      const turnOff = Math.min(activeIndices.length, Math.floor(Math.random() * 2) + 1);
      for (let t = 0; t < turnOff; t++) {
        if (activeIndices.length === 0) break;
        const ri = Math.floor(Math.random() * activeIndices.length);
        next[activeIndices[ri]] = null;
        activeCount--;
        activeIndices.splice(ri, 1);
      }

      // Randomly turn on 1-3 inactive squares
      if (activeCount < maxActive) {
        const turnOn = Math.floor(Math.random() * 3) + 1;
        for (let t = 0; t < turnOn && activeCount < maxActive; t++) {
          let idx: number;
          let attempts = 0;
          do {
            idx = Math.floor(Math.random() * total);
            attempts++;
          } while ((next[idx] !== null || excluded.has(idx)) && attempts < 20);
          if (attempts < 20) {
            next[idx] = pickColor();
            activeCount++;
          }
        }
      }

      gridRef.current = next;
      setGrid(next);
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [cols, rows, excluded]);

  if (cols === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${SQUARE_SIZE}px)`,
          gap: `${GAP}px`,
        }}
      >
        {grid.map((color, i) => (
          <div
            key={i}
            className="login-grid-square"
            style={{
              width: SQUARE_SIZE,
              height: SQUARE_SIZE,
              borderRadius: 6,
              backgroundColor: color ?? "transparent",
              opacity: color ? 1 : 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
