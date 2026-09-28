"use client";

import { EntryListItem } from "@/lib/types";
import { Tag, Calendar, ArrowRight } from "lucide-react";

interface EntryCardProps {
  entry: EntryListItem;
  onSelect: (id: number) => void;
  isSelected?: boolean;
}

// 3 alternating tag styles: Indigo, Orange, Violet
const TAG_STYLES = [
  { bg: "#ede9fe", text: "#4F46E5", border: "#c7d2fe" },
  { bg: "#FFF7ED", text: "#EA580C", border: "#fed7aa" },
  { bg: "#fdf4ff", text: "#7e22ce", border: "#e9d5ff" },
];

export default function EntryCard({ entry, onSelect, isSelected }: EntryCardProps) {
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      onClick={() => onSelect(entry.id)}
      className="group cursor-pointer rounded-2xl p-5 transition-all bg-white relative overflow-hidden"
      style={{
        border: isSelected ? "1.5px solid #4F46E5" : "1.5px solid #e0e7ff",
        boxShadow: isSelected
          ? "0 0 0 3px rgba(79,70,229,0.12), 0 4px 16px rgba(79,70,229,0.10)"
          : "0 2px 8px rgba(79,70,229,0.04)",
        background: isSelected
          ? "linear-gradient(135deg, #ffffff 0%, #eef2ff 60%, #fff7ed 100%)"
          : "#ffffff",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.border = "1.5px solid #a5b4fc";
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(79,70,229,0.10)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.border = "1.5px solid #e0e7ff";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(79,70,229,0.04)";
        }
      }}
    >
      {/* Left accent gradient bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-opacity"
        style={{
          background: "linear-gradient(to bottom, #4F46E5, #F97316)",
          opacity: isSelected ? 1 : 0,
        }}
      />

      {/* Date & ID row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center space-x-1.5 text-xs font-medium" style={{ color: "#9ca3af" }}>
          <Calendar className="w-3.5 h-3.5" style={{ color: "#a5b4fc" }} />
          <span>{formatDate(entry.created_at)}</span>
        </div>
        <span
          className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: "#FFF7ED", color: "#C2410C", border: "1px solid #fed7aa" }}
        >
          #{entry.id}
        </span>
      </div>

      {/* Summary preview */}
      <p className="text-sm font-medium text-slate-800 line-clamp-3 leading-relaxed mb-4">
        {entry.summary}
      </p>

      {/* Tags + action row */}
      <div
        className="flex items-center justify-between pt-2.5"
        style={{ borderTop: "1px solid #f3f4f6" }}
      >
        <div className="flex flex-wrap gap-1.5">
          {entry.tags.map((tag, idx) => {
            const style = TAG_STYLES[idx % TAG_STYLES.length];
            return (
              <span
                key={idx}
                className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: style.bg,
                  color: style.text,
                  border: `1px solid ${style.border}`,
                }}
              >
                <Tag className="w-2.5 h-2.5 opacity-60" />
                <span>#{tag}</span>
              </span>
            );
          })}
        </div>

        <span
          className="text-xs font-bold flex items-center space-x-1 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: "#F97316" }}
        >
          <span>View</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
}
