import { motion } from "motion/react";

const transformations = [
  {
    label: "STRENGTH",
    value: "+42%",
    text: "Progress tracking and structured training plans.",
  },
  {
    label: "CONSISTENCY",
    value: "90 DAYS",
    text: "A clear system that keeps members moving forward.",
  },
  {
    label: "COMMUNITY",
    value: "500+",
    text: "A training environment built around accountability.",
  },
];

export default function TransformationShowcase() {
  return (
    <section className="transformation-showcase">
      {transformations.map((item, index) => (
        <motion.article
          key={item.label}
          className="transformation-card"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: index * 0.12, type: "spring" }}
          whileHover={{ y: -8, scale: 1.02 }}
        >
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <p>{item.text}</p>
        </motion.article>
      ))}
    </section>
  );
}
