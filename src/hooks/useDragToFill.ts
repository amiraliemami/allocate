import { useState, useRef, useCallback, useMemo, useEffect } from "react";

const DRAG_THRESHOLD = 4;
const EMPTY_MAP = new Map<number, number | null>();

// Paint roller cursor as inline SVG data URI
const PAINT_ROLLER_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='3' width='16' height='5' rx='1'/%3E%3Cpath d='M18 5h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-8'/%3E%3Cpath d='M12 10v5'/%3E%3Cpath d='M10 15h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z'/%3E%3C/svg%3E") 12 12, crosshair`;

interface DragState {
  sourceIndex: number;
  sourceFraction: number | null; // null = empty cell (will clear targets)
  currentIndex: number;
  rowKey: string;
}

interface Pending {
  startX: number;
  sourceIndex: number;
  sourceFraction: number | null;
  rowKey: string;
}

interface UseDragToFillParams {
  weekStarts: string[];
  cellWidth: number;
}

export default function useDragToFill({ weekStarts, cellWidth }: UseDragToFillParams) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const pendingRef = useRef<Pending | null>(null);
  const justDraggedRef = useRef(false);

  const previewMap = useMemo(() => {
    if (!dragState) return EMPTY_MAP;
    const map = new Map<number, number | null>();
    const lo = Math.min(dragState.sourceIndex, dragState.currentIndex);
    const hi = Math.max(dragState.sourceIndex, dragState.currentIndex);
    for (let i = lo; i <= hi; i++) {
      map.set(i, dragState.sourceFraction);
    }
    return map;
  }, [dragState]);

  const onMouseDown = useCallback((
    e: React.MouseEvent,
    cellIndex: number,
    fraction: number | undefined,
    rowKey: string,
  ) => {
    // Only left mouse button
    if (e.button !== 0) return;
    pendingRef.current = {
      startX: e.clientX,
      sourceIndex: cellIndex,
      sourceFraction: fraction ?? null,
      rowKey,
    };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const pending = pendingRef.current;
    if (!pending) return;

    const dx = Math.abs(e.clientX - pending.startX);

    if (!dragState && dx < DRAG_THRESHOLD) return;

    // Activate or update drag
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const currentIndex = Math.max(0, Math.min(
      weekStarts.length - 1,
      Math.floor(relativeX / cellWidth),
    ));

    // Set cursor on first activation
    if (!dragState) {
      document.body.style.cursor = PAINT_ROLLER_CURSOR;
    }

    setDragState({
      sourceIndex: pending.sourceIndex,
      sourceFraction: pending.sourceFraction,
      currentIndex,
      rowKey: pending.rowKey,
    });
  }, [weekStarts.length, cellWidth, dragState]);

  const resetDrag = useCallback(() => {
    pendingRef.current = null;
    setDragState(null);
    document.body.style.cursor = "";
  }, []);

  // Returns fills if drag was active, null otherwise
  const onMouseUp = useCallback((): Array<{ index: number; fraction: number | null }> | null => {
    const wasDragging = !!dragState;
    const fills: Array<{ index: number; fraction: number | null }> = [];

    if (wasDragging && dragState) {
      justDraggedRef.current = true;
      requestAnimationFrame(() => { justDraggedRef.current = false; });

      for (const [idx, frac] of previewMap) {
        // Skip the source cell — it already has the value
        if (idx === dragState.sourceIndex) continue;
        fills.push({ index: idx, fraction: frac });
      }
    }

    resetDrag();
    return wasDragging ? fills : null;
  }, [dragState, previewMap, resetDrag]);

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (justDraggedRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  // Handle mouseup outside the container
  useEffect(() => {
    if (!dragState && !pendingRef.current) return;

    const handleWindowMouseUp = () => {
      resetDrag();
    };

    window.addEventListener("mouseup", handleWindowMouseUp);
    return () => window.removeEventListener("mouseup", handleWindowMouseUp);
  }, [dragState, resetDrag]);

  return {
    previewMap,
    isDragging: !!dragState,
    dragRowKey: dragState?.rowKey ?? null,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onClickCapture,
  };
}
