import { motion } from "motion/react";

export default function MagneticButton({ children, className = "", href }) {
  const content = (
    <motion.span
      className="magnetic-button-inner"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
    >
      {children}
    </motion.span>
  );

  if (href) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  return <button className={className}>{content}</button>;
}
