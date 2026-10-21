import Icon from "../ui/Icon.jsx";
export default function DimensionalIcon({ type = "members" }) {
  return (
    <div className={`dimensional-icon dimension-${type}`} aria-hidden="true">
      <span className="dimension-shadow" />
      <span className="dimension-back" />
      <span className="dimension-face">
        <Icon name={type} size={30} />
      </span>
      <span className="dimension-edge" />
      <span className="dimension-highlight" />
    </div>
  );
}
