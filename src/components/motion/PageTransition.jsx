import { useRef } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
export default function PageTransition({ children, className = "" }) {
  const ref = useRef(null);
  const { pathname } = useLocation();
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(ref.current, {
          opacity: 0,
          y: 10,
          duration: 0.35,
          ease: "power2.out",
          clearProps: "all",
        });
        const cards = ref.current.querySelectorAll(".app-stat-card");
        if (cards.length)
          gsap.from(cards, {
            y: 12,
            opacity: 0,
            stagger: 0.055,
            duration: 0.4,
            clearProps: "all",
          });
      });
      return () => media.revert();
    },
    { scope: ref, dependencies: [pathname], revertOnUpdate: true },
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
