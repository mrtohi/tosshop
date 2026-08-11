import { useRouter } from "next/router";

export default function Pagination({ page, totalPages, query }) {
  const router = useRouter();
  if (totalPages <= 1) return null;

  const goTo = (p) => router.push({ pathname: "/shop", query: { ...query, page: p } });

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  let last = 0;
  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        disabled={page <= 1}
        onClick={() => goTo(page - 1)}
        className="w-9 h-9 rounded-lg border border-[#DDE3E0] disabled:opacity-40 text-sm"
      >
        ›
      </button>
      {pages.map((p) => {
        const showDots = p - last > 1;
        last = p;
        return (
          <span key={p} className="flex items-center gap-1">
            {showDots && <span className="text-[#7C8B88] px-1">...</span>}
            <button
              onClick={() => goTo(p)}
              className={`w-9 h-9 rounded-lg text-sm font-semibold ${
                p === page ? "bg-primary text-white" : "border border-[#DDE3E0]"
              }`}
            >
              {p.toLocaleString("fa-IR")}
            </button>
          </span>
        );
      })}
      <button
        disabled={page >= totalPages}
        onClick={() => goTo(page + 1)}
        className="w-9 h-9 rounded-lg border border-[#DDE3E0] disabled:opacity-40 text-sm"
      >
        ‹
      </button>
    </div>
  );
}
