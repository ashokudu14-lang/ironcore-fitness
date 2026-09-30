import { Children, cloneElement, isValidElement, useEffect, useRef } from "react";
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


// Wrap text through React so form updates and reconciliation retain ownership.
function proximityWords(children) {
  return Children.map(children, child => {
    if (typeof child === "string" || typeof child === "number") {
      if (!String(child).trim()) return child;
      return <ic-phrase>{String(child).split(/(\s+)/).map((word, index) =>
        !word.trim() ? word : <ic-word key={index}>{word}</ic-word>)}</ic-phrase>;
    }
    if (!isValidElement(child) || !child.props.children || child.props["aria-hidden"] === true ||
        ["svg", "select", "option", "textarea", "script", "style", "ic-word"].includes(child.type)) return child;
    return cloneElement(child, {}, proximityWords(child.props.children));
  });
}

export function WordField({ children }) {
  const root = useRef(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const words = Array.from(root.current.querySelectorAll("ic-word"));
    let frame = 0;
    let pointer = null;
    let affected = new Set();
    const resetWord = word => {
      word.style.removeProperty("--word-rx");
      word.style.removeProperty("--word-ry");
      word.style.removeProperty("--word-rz");
    };
    const update = () => {
      frame = 0;
      if (!pointer) return;
      // Read geometry first; apply styles afterwards to avoid layout thrashing.
      const nearby = [];
      for (const word of words) {
        const rect = word.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight || !rect.width) continue;
        const dx = pointer.x - (rect.left + rect.width / 2);
        const dy = pointer.y - (rect.top + rect.height / 2);
        const edgeX = Math.max(0, Math.abs(dx) - rect.width / 2);
        const edgeY = Math.max(0, Math.abs(dy) - rect.height / 2);
        const distance = Math.hypot(edgeX, edgeY);
        const radius = 100;
        if (distance >= radius) continue;
        const weight = (1 - distance / radius) ** 2;
        nearby.push({ word, rx: -clamp(dy / 100) * 4 * weight,
          ry: clamp(dx / 100) * 4 * weight, rz: clamp(dx / 100) * .8 * weight });
      }
      const next = new Set(nearby.map(item => item.word));
      affected.forEach(word => { if (!next.has(word)) resetWord(word); });
      nearby.forEach(({ word, rx, ry, rz }) => {
        word.style.setProperty("--word-rx", `${rx}deg`);
        word.style.setProperty("--word-ry", `${ry}deg`);
        word.style.setProperty("--word-rz", `${rz}deg`);
      });
      affected = next;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const move = event => { if (event.pointerType === "mouse") { pointer = { x: event.clientX, y: event.clientY }; schedule(); } };
    const leave = () => { pointer = null; cancelAnimationFrame(frame); frame = 0; affected.forEach(resetWord); affected.clear(); };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("blur", leave);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      leave(); window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule);
      window.removeEventListener("blur", leave); document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [children, reduced]);
  return <div ref={root} className="word-field">{proximityWords(children)}</div>;
}

export function CursorAtmosphere() {
  const reduced = useReducedMotion();
  const targetX = useMotionValue(-100);
  const targetY = useMotionValue(-100);
  const active = useMotionValue(0);
  const x = useSpring(targetX, { stiffness: 360, damping: 34, mass: .5 });
  const y = useSpring(targetY, { stiffness: 360, damping: 34, mass: .5 });
  const opacity = useSpring(active, { stiffness: 220, damping: 28 });
  useEffect(() => {
    if (reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const move = event => {
      if (event.pointerType !== "mouse") return;
      if (!active.get()) { x.jump(event.clientX); y.jump(event.clientY); }
      targetX.set(event.clientX); targetY.set(event.clientY); active.set(1);
    };
    const leave = () => active.set(0);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", leave);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move); window.removeEventListener("blur", leave);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [reduced, targetX, targetY, x, y, active]);
  return <div aria-hidden="true">
    {!reduced && <motion.div className="premium-cursor" style={{ x, y, opacity }} />}
    <div className="premium-orbits"><div className="premium-orbit orbit-one" /><div className="premium-orbit orbit-two" /></div>
  </div>;
}
