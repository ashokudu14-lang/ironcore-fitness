import { useEffect, useRef } from "react";
import DashboardPreview from "../marketing/DashboardPreview.jsx";
export default function ProductStage() {
  const ref = useRef(null);
  useEffect(() => {
    const media = matchMedia(
      "(prefers-reduced-motion: no-preference) and (pointer: fine) and (min-width: 900px)",
    );
    const element = ref.current;
    function move(event) {
      if (!media.matches) return;
      const rect = element.getBoundingClientRect();
      element.style.setProperty(
        "--stage-y",
        `${((event.clientX - rect.left) / rect.width - 0.5) * 4}deg`,
      );
      element.style.setProperty(
        "--stage-x",
        `${-((event.clientY - rect.top) / rect.height - 0.5) * 3}deg`,
      );
    }
    function reset() {
      element.style.removeProperty("--stage-y");
      element.style.removeProperty("--stage-x");
    }
    element.addEventListener("pointermove", move, { passive: true });
    element.addEventListener("pointerleave", reset);
    media.addEventListener("change", reset);
    return () => {
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", reset);
      media.removeEventListener("change", reset);
    };
  }, []);
  return (
    <div ref={ref} className="product-stage">
      <div className="product-stage-floor" aria-hidden="true" />
      <div className="product-stage-screen">
        <DashboardPreview />
      </div>
      <div className="stage-caption">
        <span>01 — THE WORKSPACE</span>
        <span>One clear view. Every moving part.</span>
      </div>
    </div>
  );
}
