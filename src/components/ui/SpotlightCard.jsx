import { useRef } from "react";
// Adapted from React Bits SpotlightCard: https://reactbits.dev/components/spotlight-card
// Reduced to local pointer feedback: no global listeners, frame loop, noise or flare.
export default function SpotlightCard({ children, className = "" }) {
  const ref = useRef(null);
  function move(event) {
    if (
      event.pointerType !== "mouse" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const bounds = ref.current.getBoundingClientRect();
    ref.current.style.setProperty(
      "--spot-x",
      `${event.clientX - bounds.left}px`,
    );
    ref.current.style.setProperty(
      "--spot-y",
      `${event.clientY - bounds.top}px`,
    );
  }
  return (
    <div
      ref={ref}
      className={`spotlight-card ${className}`}
      onPointerMove={move}
    >
      {children}
    </div>
  );
}
