import { useState, useEffect } from "react";

// Module-level store — direction is set synchronously before navigation
// so AnimatedRoutes always reads the right value on re-render.
let direction = 0; // 1 = going right (slide left), -1 = going left (slide right), 0 = fade

const listeners = new Set<() => void>();

export function setNavDirection(d: number) {
  direction = d;
  listeners.forEach((l) => l());
}

export function getNavDirection() {
  return direction;
}

export function useNavDirection() {
  const [dir, setDir] = useState(direction);
  useEffect(() => {
    const handler = () => setDir(direction);
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);
  return dir;
}
