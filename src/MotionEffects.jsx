import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

const spring = { stiffness: 150, damping: 28, mass: .8 };

export function AmbientMotion() {
  const reduced = useReducedMotion();
  const targetX = useMotionValue(-500);
  const targetY = useMotionValue(-500);
  const x = useSpring(targetX, spring);
  const y = useSpring(targetY, spring);
  const backdropX = useTransform(x, value => value < 0 ? 0 : (value / Math.max(window.innerWidth, 1) - .5) * 16);
  const backdropY = useTransform(y, value => value < 0 ? 0 : (value / Math.max(window.innerHeight, 1) - .5) * 12);

  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;
    const move = event => { targetX.set(event.clientX); targetY.set(event.clientY); };
    const leave = () => { targetX.set(-500); targetY.set(-500); };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [reduced, targetX, targetY]);

  if (reduced) return null;
  return <div aria-hidden="true">
    <motion.div className="ambient-glow motion-glow" style={{ x, y }} />
    <motion.div className="parallax-background motion-backdrop" style={{ x: backdropX, y: backdropY }}>
      <div className="parallax-orb parallax-orb-one" />
      <div className="parallax-orb parallax-orb-two" />
      <div className="parallax-ring parallax-ring-one" />
      <div className="parallax-ring parallax-ring-two" />
      <div className="ambient-orbit"><span /></div>
    </motion.div>
  </div>;
}

export function SpringCard({ as = "article", tilt = false, children, ...props }) {
  const reduced = useReducedMotion();
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const rotateX = useSpring(targetX, spring);
  const rotateY = useSpring(targetY, spring);
  const Component = as === "div" ? motion.div : motion.article;
  const move = event => {
    if (!tilt || reduced || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    targetX.set(-((event.clientY - bounds.top) / bounds.height - .5) * 4);
    targetY.set(((event.clientX - bounds.left) / bounds.width - .5) * 4);
  };
  return <Component {...props}
    style={tilt && !reduced ? { rotateX, rotateY, transformPerspective: 1200 } : undefined}
    whileHover={reduced ? undefined : { y: -6 }}
    transition={{ type: "spring", stiffness: 260, damping: 24 }}
    onPointerMove={move}
    onPointerLeave={() => { targetX.set(0); targetY.set(0); }}
  >{children}</Component>;
}
