"use client";

import { useEffect, useState } from "react";
import { Entry } from "@/lib/types";
import { fetchEntryById } from "@/lib/api";
import { X, Sparkles, Tag, FileText, Copy, Check, Calendar, Loader2 } from "lucide-react";

interface EntryDetailModalProps {
  entryId: number | null;
  onClose: () => void;
}

const TAG_STYLES = [
  { bg: "#ede9fe", text: "#4F46E5", border: "#c7d2fe" },
  { bg: "#FFF7ED", text: "#EA580C", border: "#fed7aa" },
  { bg: "#fdf4ff", text: "#7e22ce", border: "#e9d5ff" },
];

export default function EntryDetailModal({ entryId, onClose }: EntryDetailModalProps) {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedType, setCopiedType] = useState<"summary" | "original" | null>(null);

  useEffect(() => {
    if (!entryId) {
      setEntry(null);
      return;
    }
    setIsLoading(true);
    fetchEntryById(entryId)
      .then(setEntry)
      .catch((err) => console.error("Failed to load entry detail:", err))
      .finally(() => setIsLoading(false));
  }, [entryId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!entryId) return null;

  const handleCopy = (text: string, type: "summary" | "original") => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "";
    try {
      return new Date(isoString).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh] relative"
        style={{
          backgroundColor: "#ffffff",
          border: "1.5px solid #c7d2fe",
          boxShadow: "0 24px 64px rgba(79,70,229,0.18), 0 4px 16px rgba(249,115,22,0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Stripe */}
        <div
          className="h-1.5 w-full flex-shrink-0"
          style={{ background: "linear-gradient(to right, #4F46E5, #7C3AED, #F97316)" }}
        />

        {/* Modal Header */}
        <div
          className="px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{
            backgroundColor: "#FFF7ED",
            borderBottom: "1px solid #fed7aa",
          }}
        >
          <div className="flex items-center space-x-2.5">
            <span
              className="font-mono text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: "#ede9fe",
                color: "#4F46E5",
                border: "1px solid #c7d2fe",
              }}
            >
              Entry #{entryId}
            </span>
            {entry && (
              <span className="text-xs flex items-center space-x-1.5" style={{ color: "#9ca3af" }}>
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(entry.created_at)}</span>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: "#9ca3af" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#FFF7ED";
              e.currentTarget.style.color = "#F97316";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#9ca3af";
            }}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isLoading && (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-7 h-7 animate-spin mx-auto" style={{ color: "#4F46E5" }} />
              <p className="text-xs text-slate-400 font-medium">Loading entry details...</p>
            </div>
          )}

          {!isLoading && entry && (
            <>
              {/* AI Summary */}
              <div
                className="rounded-2xl p-5 space-y-3"
                style={{
                  background: "linear-gradient(135deg, #eef2ff 0%, #ffffff 50%, #fff7ed 100%)",
                  borderLeft: "4px solid #F97316",
                  border: "1.5px solid #e0e7ff",
                  borderLeftColor: "#F97316",
                }}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#4F46E5" }}
                  >
                    <Sparkles className="w-4 h-4" style={{ color: "#F97316" }} />
                    <span>AI-Generated Summary</span>
                  </div>
                  <button
                    onClick={() => handleCopy(entry.summary, "summary")}
                    className="inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-lg transition-all"
                    style={{ color: "#4F46E5", border: "1px solid transparent" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#ede9fe";
                      e.currentTarget.style.borderColor = "#c7d2fe";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor = "transparent";
                    }}
                  >
                    {copiedType === "summary" ? (
                      <>
                        <Check className="w-3.5 h-3.5" style={{ color: "#16a34a" }} />
                        <span style={{ color: "#16a34a" }}>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm sm:text-[15px] text-slate-800 leading-relaxed">
                  {entry.summary}
                </p>
              </div>

              {/* 3 Tags */}
              <div className="space-y-2.5">
                <div
                  className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider"
                  style={{ color: "#9ca3af" }}
                >
                  <Tag className="w-3.5 h-3.5" style={{ color: "#4F46E5" }} />
                  <span>3 Relevant Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag, i) => {
                    const s = TAG_STYLES[i % TAG_STYLES.length];
                    return (
                      <span
                        key={i}
                        className="px-4 py-1.5 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: s.bg,
                          color: s.text,
                          border: `1.5px solid ${s.border}`,
                        }}
                      >
                        #{tag}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Original Text */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#9ca3af" }}
                  >
                    <FileText className="w-3.5 h-3.5" style={{ color: "#6b7280" }} />
                    <span>Original Submitted Text</span>
                  </div>
                  <button
                    onClick={() => handleCopy(entry.original_text, "original")}
                    className="inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors"
                    style={{ color: "#6b7280" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    {copiedType === "original" ? (
                      <>
                        <Check className="w-3.5 h-3.5" style={{ color: "#16a34a" }} />
                        <span style={{ color: "#16a34a" }}>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div
                  className="rounded-2xl p-4 text-xs sm:text-sm font-mono whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto"
                  style={{
                    backgroundColor: "#FFF7ED",
                    border: "1.5px solid #fed7aa",
                    color: "#1e1b4b",
                  }}
                >
                  {entry.original_text}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="px-6 py-3.5 flex justify-end flex-shrink-0"
          style={{
            backgroundColor: "#FFF7ED",
            borderTop: "1px solid #fed7aa",
          }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-bold transition-colors"
            style={{ color: "#4F46E5" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ede9fe")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
