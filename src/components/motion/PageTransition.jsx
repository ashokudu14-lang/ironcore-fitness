import { withWordMotion } from "./CursorFeedback.jsx";
import { motion, useReducedMotion } from "motion/react";
import { motionTiming, pageFade } from "../../motion/presets.js";

export default function PageTransition({ children, className = "" }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{withWordMotion(children)}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={pageFade}
      transition={motionTiming.standard}
    >
      {withWordMotion(children)}
    </motion.div>
  );
}
