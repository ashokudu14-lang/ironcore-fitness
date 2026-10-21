import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
export default function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(ref.current, {
          y: 16,
          opacity: 0,
          duration: 0.45,
          delay,
          ease: "power2.out",
          clearProps: "all",
          scrollTrigger: { trigger: ref.current, start: "top 96%", once: true },
        });
      });
      return () => media.revert();
    },
    { scope: ref },
  );
  return (
    <div className={className} ref={ref}>
      {children}
    </div>
  );
}
