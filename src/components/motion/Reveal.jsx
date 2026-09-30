import { motion, useReducedMotion } from "motion/react";
import { fadeUp, motionTiming } from "../../motion/presets.js";

export default function Reveal({
  children,
  className = "",
  delay = 0,
  interactive = false,
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      variants={fadeUp}
      transition={{ ...motionTiming.standard, delay }}
      whileHover={interactive ? { y: -6, transition: { type: "spring", stiffness: 260, damping: 24, delay: 0 } } : undefined}
    >
      {children}
    </motion.div>
  );
}
