"use client";

import { useState } from "react";
import { EntryListItem } from "@/lib/types";
import EntryCard from "./EntryCard";
import { Search, Inbox, RefreshCw } from "lucide-react";

interface EntryListProps {
  entries: EntryListItem[];
  onSelectEntry: (id: number) => void;
  selectedId: number | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function EntryList({
  entries,
  onSelectEntry,
  selectedId,
  isLoading,
  onRefresh,
}: EntryListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEntries = entries.filter((entry) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      entry.summary.toLowerCase().includes(q) ||
      entry.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <h2 className="text-base font-bold text-slate-900">Saved Entries</h2>
          <span
            className="text-xs px-2.5 py-0.5 rounded-full font-bold"
            style={{
              background: "linear-gradient(135deg, #ede9fe 0%, #FFF7ED 100%)",
              color: "#4F46E5",
              border: "1px solid #c7d2fe",
            }}
          >
            {entries.length}
          </span>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="text-xs font-semibold p-1.5 rounded-lg transition-colors flex items-center space-x-1.5"
          style={{ color: "#4F46E5" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#eef2ff")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          title="Refresh entries"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Search bar */}
      {entries.length > 0 && (
        <div className="relative">
          <Search
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: "#a5b4fc" }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by summary keywords or #tags..."
            className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-xl outline-none transition-all"
            style={{
              backgroundColor: "#ffffff",
              border: "1.5px solid #e0e7ff",
              color: "#1e1b4b",
            }}
            onFocus={(e) => {
              e.currentTarget.style.border = "1.5px solid #4F46E5";
              e.currentTarget.style.boxShadow = "0 0 0 4px rgba(79,70,229,0.10)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = "1.5px solid #e0e7ff";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && entries.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-5 animate-pulse space-y-3"
              style={{ border: "1.5px solid #e0e7ff" }}
            >
              <div className="h-3 rounded w-1/3" style={{ backgroundColor: "#e0e7ff" }} />
              <div className="h-4 rounded w-full" style={{ backgroundColor: "#e0e7ff" }} />
              <div className="h-4 rounded w-4/5" style={{ backgroundColor: "#e0e7ff" }} />
              <div className="flex space-x-2 pt-2">
                <div className="h-5 rounded-full w-14" style={{ backgroundColor: "#ede9fe" }} />
                <div className="h-5 rounded-full w-14" style={{ backgroundColor: "#FFF7ED" }} />
                <div className="h-5 rounded-full w-14" style={{ backgroundColor: "#fdf4ff" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && entries.length === 0 && (
        <div
          className="rounded-3xl p-12 text-center"
          style={{
            backgroundColor: "#ffffff",
            border: "2px dashed #c7d2fe",
            background: "linear-gradient(135deg, #ffffff 0%, #FFF7ED 100%)",
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3.5"
            style={{
              background: "linear-gradient(135deg, #ede9fe 0%, #fff7ed 100%)",
              border: "1.5px solid #c7d2fe",
            }}
          >
            <Inbox className="w-7 h-7" style={{ color: "#4F46E5" }} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No entries saved yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
            Submit a block of text on the left to extract your first AI summary and 3 tags!
          </p>
        </div>
      )}

      {/* No search results */}
      {!isLoading && entries.length > 0 && filteredEntries.length === 0 && (
        <div className="rounded-2xl bg-white border border-indigo-100 p-8 text-center">
          <p className="text-sm text-slate-500">
            No entries match{" "}
            <span className="font-semibold" style={{ color: "#4F46E5" }}>
              &quot;{searchQuery}&quot;
            </span>
          </p>
        </div>
      )}

      {/* Entry cards */}
      <div className="space-y-3">
        {filteredEntries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onSelect={onSelectEntry}
            isSelected={selectedId === entry.id}
          />
        ))}
      </div>
    </div>
  );
}
