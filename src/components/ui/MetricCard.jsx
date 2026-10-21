import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Icon from "./Icon.jsx";
export default function MetricCard({
  label,
  value,
  format = (value) => String(Math.round(value)),
  note,
  icon,
}) {
  const number = useRef(null);
  const played = useRef(false);
  useGSAP(
    () => {
      if (
        value == null ||
        played.current ||
        matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        return;
      played.current = true;
      const counter = { value: 0 };
      const tween = gsap.to(counter, {
        value,
        duration: 0.65,
        ease: "power2.out",
        onUpdate: () => {
          if (number.current)
            number.current.textContent = format(counter.value);
        },
      });
      return () => {
        tween.kill();
        if (number.current) number.current.textContent = format(value);
      };
    },
    { dependencies: [value], scope: number },
  );
  return (
    <article className="app-stat-card">
      <div className="metric-heading">
        <span>{label}</span>
        <Icon name={icon} />
      </div>
      {value == null ? (
        <div className="skeleton metric-skeleton" role="status">
          <span className="sr-only">Loading metric</span>
        </div>
      ) : (
        <strong className="metric-value">
          <span className="sr-only">{format(value)}</span>
          <span aria-hidden="true" ref={number}>
            {format(value)}
          </span>
        </strong>
      )}
      <p className="metric-note">{note}</p>
    </article>
  );
}
