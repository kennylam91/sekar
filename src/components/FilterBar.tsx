import type { PostFilter } from "@/types";

interface FilterBarProps {
  activeFilter: PostFilter;
  onFilterChange: (filter: PostFilter) => void;
}

const filters: { value: PostFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "today", label: "Hôm nay" },
  { value: "2days", label: "2 ngày qua" },
  { value: "week", label: "Tuần này" },
];

export default function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onFilterChange(f.value)}
          className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeFilter === f.value
              ? "bg-primary-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
