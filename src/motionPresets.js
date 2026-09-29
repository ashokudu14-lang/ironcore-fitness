// Motion presets for premium IronCore interactions
// Designed for Motion.dev powered components.

export const ironCoreMotion = {
  fadeUp: {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { type: "spring", stiffness: 80, damping: 18 },
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.94 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: true, amount: 0.2 },
    transition: { type: "spring", stiffness: 90, damping: 20 },
  },

  hoverLift: {
    whileHover: { y: -8, scale: 1.02 },
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};
