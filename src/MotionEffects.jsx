import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

const spring = { stiffness: 150, damping: 28, mass: .8 };

export function AmbientMotion() {
  const reduced = useReducedMotion();
  const targetX = useMotionValue(-500);
  const targetY = useMotionValue(-500);
  const x = useSpring(targetX, spring);
  const y = useSpring(targetY, spring);
  const visible = useMotionValue(0);
  const opacity = useSpring(visible, { stiffness: 180, damping: 30 });
  const backdropX = useTransform(x, value => value < 0 ? 0 : (value / Math.max(window.innerWidth, 1) - .5) * 16);
  const backdropY = useTransform(y, value => value < 0 ? 0 : (value / Math.max(window.innerHeight, 1) - .5) * 12);

  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;
    const move = event => {
      if (event.pointerType !== "mouse") return;
      if (!visible.get()) { x.jump(event.clientX); y.jump(event.clientY); }
      targetX.set(event.clientX); targetY.set(event.clientY); visible.set(1);
    };
    const leave = () => { visible.set(0); };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [reduced, targetX, targetY, x, y, visible]);

  if (reduced) return null;
  return <div aria-hidden="true">
    <motion.div className="ambient-glow motion-glow" style={{ x, y, opacity }} />
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

export function BannerMotion({ as = "section", children, ...props }) {
  const reduced = useReducedMotion();
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const x = useSpring(targetX, { stiffness: 105, damping: 24 });
  const y = useSpring(targetY, { stiffness: 105, damping: 24 });
  const imageX = useTransform(x, value => `${-value * 22}px`);
  const imageY = useTransform(y, value => `${-value * 16}px`);
  const copyX = useTransform(x, value => `${value * 6}px`);
  const copyY = useTransform(y, value => `${value * 4}px`);
  const Component = as === "div" ? motion.div : motion.section;
  const move = event => {
    if (reduced || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    targetX.set(Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - .5) * 2)));
    targetY.set(Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - .5) * 2)));
  };
  return <Component {...props}
    style={reduced ? undefined : {
      "--banner-image-x": imageX, "--banner-image-y": imageY,
      "--banner-copy-x": copyX, "--banner-copy-y": copyY,
    }}
    onPointerMove={move}
    onPointerLeave={() => { targetX.set(0); targetY.set(0); }}
  >{children}</Component>;
}
