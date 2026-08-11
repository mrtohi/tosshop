export default function Stars({ rating, count, size = "sm" }) {
  const full = Math.round(rating);
  const cls = size === "lg" ? "text-base" : "text-xs";
  return (
    <div className={`flex items-center gap-1 ${cls}`}>
      <span style={{ color: "#D9B23A" }}>
        {"★".repeat(full)}
        <span style={{ color: "#E3E7E5" }}>{"★".repeat(5 - full)}</span>
      </span>
      {count > 0 && <span className="text-[#7C8B88]">({count.toLocaleString("fa-IR")})</span>}
    </div>
  );
}
