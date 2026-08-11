export const CATS = [
  { id: "fridge", label: "یخچال و فریزر" },
  { id: "washer", label: "ماشین لباسشویی" },
  { id: "vacuum", label: "جاروبرقی" },
  { id: "tv", label: "تلویزیون" },
  { id: "microwave", label: "مایکروویو" },
  { id: "ac", label: "کولر گازی" },
];

export function CategoryIcon({ category, ...props }) {
  switch (category) {
    case "fridge":
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
          <rect x="10" y="4" width="28" height="40" rx="3" />
          <line x1="10" y1="18" x2="38" y2="18" />
          <line x1="16" y1="9" x2="16" y2="14" />
          <line x1="16" y1="23" x2="16" y2="30" />
        </svg>
      );
    case "washer":
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
          <rect x="6" y="6" width="36" height="36" rx="3" />
          <circle cx="24" cy="26" r="11" />
          <circle cx="24" cy="26" r="5.5" />
          <line x1="13" y1="12" x2="17" y2="12" />
          <line x1="21" y1="12" x2="25" y2="12" />
        </svg>
      );
    case "vacuum":
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
          <circle cx="30" cy="16" r="9" />
          <path d="M22 20 L10 40" />
          <path d="M10 40 h10" />
          <path d="M30 25 v8" />
        </svg>
      );
    case "tv":
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
          <rect x="5" y="9" width="38" height="24" rx="2" />
          <line x1="18" y1="40" x2="30" y2="40" />
          <line x1="24" y1="33" x2="24" y2="40" />
        </svg>
      );
    case "microwave":
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
          <rect x="4" y="12" width="40" height="24" rx="2" />
          <rect x="8" y="16" width="24" height="16" rx="1" />
          <line x1="37" y1="18" x2="40" y2="18" />
          <line x1="37" y1="24" x2="40" y2="24" />
          <circle cx="38.5" cy="30" r="2" />
        </svg>
      );
    case "ac":
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
          <rect x="4" y="14" width="40" height="12" rx="3" />
          <path d="M10 30 q3 4 0 8" />
          <path d="M20 30 q3 4 0 8" />
          <path d="M30 30 q3 4 0 8" />
        </svg>
      );
    default:
      return null;
  }
}
