import { useCallback, useRef, useState } from "react";

export function useHistory<T>(initial: T | null) {
  const [state, setState] = useState<T | null>(initial);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);

  const set = useCallback((next: T) => {
    setState((prev) => {
      if (prev) past.current.push(prev);
      future.current = [];
      return next;
    });
  }, []);

  const reset = useCallback((next: T | null) => {
    past.current = [];
    future.current = [];
    setState(next);
  }, []);

  const undo = useCallback(() => {
    setState((prev) => {
      const p = past.current.pop();
      if (!p) return prev;
      if (prev) future.current.push(prev);
      return p;
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      const f = future.current.pop();
      if (!f) return prev;
      if (prev) past.current.push(prev);
      return f;
    });
  }, []);

  const canUndo = past.current.length > 0;
  const canRedo = future.current.length > 0;

  return { state, set, reset, undo, redo, canUndo, canRedo };
}
