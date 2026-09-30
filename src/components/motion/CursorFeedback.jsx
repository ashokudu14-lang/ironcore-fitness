import { Children, cloneElement, isValidElement, useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { Link, NavLink } from "react-router-dom";
const clamp = value => Math.max(-1, Math.min(1, value));
const tiltedElements = new Map([["div", motion.div], ["article", motion.article], ["a", motion.a], ["button", motion.button], [Link, motion.create(Link)], [NavLink, motion.create(NavLink)]]);

// Match the original Product preview's 2.5-degree tilt and spring exactly.
export function usePreviewTilt() {
  const reduced = useReducedMotion();
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const rotateX = useSpring(targetX, { stiffness: 140, damping: 25 });
  const rotateY = useSpring(targetY, { stiffness: 140, damping: 25 });
  const reset = () => { targetX.set(0); targetY.set(0); };
  return {
    style: reduced ? undefined : { rotateX, rotateY, transformPerspective: 1200 },
    onPointerMove: event => {
      if (reduced || event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      targetX.set(-clamp(((event.clientY - bounds.top) / Math.max(bounds.height,1) - .5) * 2) * 2.5);
      targetY.set(clamp(((event.clientX - bounds.left) / Math.max(bounds.width,1) - .5) * 2) * 2.5);
    },
    onPointerLeave: reset,
    onPointerCancel: reset,
    onBlur: reset,
  };
}

export function TiltSurface({ as = "div", children, style, ...props }) {
  const tilt = usePreviewTilt();
  const Component = tiltedElements.get(as) || motion.div;
  return <Component {...props} {...tilt} style={{ ...style, ...tilt.style }}>{children}</Component>;
}

// Wrap text through React so form updates and reconciliation retain ownership.
export function withWordMotion(children) {
  return Children.map(children, child => {
    if (typeof child === "string" || typeof child === "number") {
      if (!String(child).trim()) return child;
      return <ic-phrase>{String(child).split(/(\s+)/).map((word, index) =>
        !word.trim() ? word : <ic-word key={index}>{word}</ic-word>)}</ic-phrase>;
    }
    if (!isValidElement(child) || !child.props.children || child.props["aria-hidden"] === true ||
        ["svg", "select", "option", "textarea", "script", "style", "ic-word", "ic-phrase"].includes(child.type)) return child;
    const children = typeof child.props.children === "function"
      ? (...args) => withWordMotion(child.props.children(...args))
      : withWordMotion(child.props.children);
    const className = typeof child.props.className === "string" ? child.props.className : "";
    const isControl = ["a", "button", Link, NavLink].includes(child.type);
    const isPanel = ["article", "div"].includes(child.type) && /(?:pricing-panel|app-stat-card|final-cta)/.test(className);
    if (isControl || isPanel) return <TiltSurface {...child.props} as={child.type} key={child.key}>{children}</TiltSurface>;
    return cloneElement(child, {}, children);
  });
}

function useWordProximity() {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
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
      for (const word of document.querySelectorAll("ic-word")) {
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
  }, [reduced]);
}

export function CursorFeedback() {
  useWordProximity();
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

  </div>;
}
