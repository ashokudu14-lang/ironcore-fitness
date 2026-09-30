import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

const elements = { a: motion.a, button: motion.button, article: motion.article, div: motion.div, section: motion.section };
const spring = { stiffness: 130, damping: 25, mass: .7 };
const clamp = value => Math.max(-1, Math.min(1, value));

// Light and depth belong to the surface under the pointer, not to a global cursor.
export function GlassSurface({ as = "div", variant = "card", className = "", children, style, ...props }) {
  const reduced = useReducedMotion();
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const active = useMotionValue(0);
  const x = useSpring(targetX, spring);
  const y = useSpring(targetY, spring);
  const light = useSpring(active, { stiffness: 160, damping: 26 });
  const banner = variant === "banner";
  const control = variant === "control";
  const lightX = useTransform(x, value => `${50 + value * 50}%`);
  const lightY = useTransform(y, value => `${50 + value * 50}%`);
  const rotateX = useTransform(y, value => -value * (control ? .7 : 1.7));
  const rotateY = useTransform(x, value => value * (control ? .7 : 1.7));
  const panX = useTransform(x, value => control ? value * 1.2 : 0);
  const lift = useTransform(light, value => -value * (control ? 1.5 : 3));
  const scale = useTransform(light, value => 1 + value * (control ? .012 : .005));
  const imageX = useTransform(x, value => `${-value * 12}px`);
  const imageY = useTransform(y, value => `${-value * 8}px`);
  const copyX = useTransform(x, value => `${value * 3}px`);
  const copyY = useTransform(y, value => `${value * 2}px`);
  const Component = elements[as] || motion.div;
  const move = event => {
    if (reduced || event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    targetX.set(clamp(((event.clientX - bounds.left) / Math.max(bounds.width, 1) - .5) * 2));
    targetY.set(clamp(((event.clientY - bounds.top) / Math.max(bounds.height, 1) - .5) * 2));
    active.set(1);
  };
  const reset = () => { targetX.set(0); targetY.set(0); active.set(0); };
  return <Component {...props} className={`${className} glass-surface glass-${variant}`}
    style={{ ...style, ...(reduced ? {} : {
      "--light-x": lightX, "--light-y": lightY, "--surface-light": light,
      ...(banner ? {
        "--banner-image-x": imageX, "--banner-image-y": imageY,
        "--banner-copy-x": copyX, "--banner-copy-y": copyY,
      } : { rotateX, rotateY, x: panX, y: lift, scale, transformPerspective: 1400 }),
    }) }}
    onPointerEnter={move} onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}
    onBlur={reset}
  >{children}</Component>;
}

export function SpringCard({ as = "article", tilt: _tilt, ...props }) {
  return <GlassSurface as={as} {...props} />;
}

export function BannerMotion({ as = "section", ...props }) {
  return <GlassSurface as={as} variant="banner" {...props} />;
}
