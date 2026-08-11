const ENERGY_SCALE = ["A+++", "A++", "A+", "A", "B", "C", "D"];
const ENERGY_COLOR = {
  "A+++": "#1F8A4C", "A++": "#4C9A63", "A+": "#8CB84A",
  "A": "#D9B23A", "B": "#D98A3A", "C": "#C1663C", "D": "#C1443C",
};

export default function EnergyBadge({ rating, size = "sm" }) {
  const idx = ENERGY_SCALE.indexOf(rating);
  const bar = size === "lg" ? "h-2.5" : "h-1.5";
  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex gap-[2px]">
        {ENERGY_SCALE.map((r, i) => (
          <div
            key={r}
            className={`${bar} rounded-sm`}
            style={{
              width: size === "lg" ? 10 + i * 2 : 6 + i * 1.4,
              background: i <= idx ? ENERGY_COLOR[r] : "#E3E7E5",
            }}
          />
        ))}
      </div>
      <span
        className="text-[11px] font-bold px-1.5 py-[1px] rounded"
        style={{ background: ENERGY_COLOR[rating] || "#999", color: "#fff" }}
      >
        {rating}
      </span>
    </div>
  );
}
