export const motionTiming = {
  quick: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
  standard: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  intro: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export const pageFade = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};
