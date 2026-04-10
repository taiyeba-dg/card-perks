import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * CSS-only navigation progress bar — no framer-motion.
 */
export default function NavigationProgress() {
  const location = useLocation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => setShow(false), 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[2px]">
      <div
        className="h-full bg-gradient-to-r from-gold via-gold-light to-gold animate-nav-progress"
        style={{ boxShadow: "0 0 10px hsl(var(--gold) / 0.5)" }}
      />
    </div>
  );
}
