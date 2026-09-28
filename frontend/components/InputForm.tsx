"use client";

import { useState } from "react";
import { Send, Loader2, RotateCcw, FileText, Sparkles } from "lucide-react";

interface InputFormProps {
  onSubmit: (text: string) => Promise<void>;
  isLoading: boolean;
}

const SAMPLES = [
  {
    label: "Meeting Transcript",
    text: "Team Sync - Monday morning:\nDiscussed the migration plan for customer authentication. Alex highlighted that upgrading to OAuth2 with JWT tokens will reduce session database load by 40%. The team agreed to test the token refresh flow on staging by Thursday and deploy to production next week.",
  },
  {
    label: "Tech Article Draft",
    text: "Microservices vs Monoliths: A Practical Guide\nWhile microservices provide independent deployability and technology diversity, they introduce distributed transaction complexity and network latency. For early-stage startups with small teams, a modular monolith remains the most pragmatically scalable architecture.",
  },
  {
    label: "Customer Feedback",
    text: "Customer interview with Acme Corp:\nThe user expressed satisfaction with the dashboard query speeds after the recent index optimization. However, they requested export capabilities in both CSV and JSON formats, along with custom date range filters for their quarterly reports.",
  },
];

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [text, setText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    await onSubmit(text);
    setText("");
  };

  return (
    <div
      className="rounded-3xl p-6 sm:p-7 relative overflow-hidden"
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e0e7ff",
        boxShadow: "0 4px 24px 0 rgba(79,70,229,0.07)",
      }}
    >
      {/* Decorative ambient corner: indigo + orange glow */}
      <div
        className="absolute -top-14 -right-14 w-40 h-40 rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(79,70,229,0.12) 0%, rgba(249,115,22,0.07) 100%)" }}
      />

      {/* Header Row */}
      <div className="relative z-10 flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
            style={{
              background: "linear-gradient(135deg, #ede9fe 0%, #fff7ed 100%)",
              border: "1px solid #c7d2fe",
            }}
          >
            <FileText className="w-4 h-4" style={{ color: "#4F46E5" }} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Submit Content</h2>
            <p className="text-xs text-slate-500">Paste your note, article draft, or transcript</p>
          </div>
        </div>

        {text && !isLoading && (
          <button
            type="button"
            onClick={() => setText("")}
            className="inline-flex items-center space-x-1 text-xs font-medium py-1 px-2.5 rounded-lg transition-colors"
            style={{ color: "#F97316" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#FFF7ED")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        {/* Textarea */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
            placeholder="Paste raw notes, meeting transcripts, article drafts, or customer feedback here..."
            rows={7}
            className="w-full rounded-2xl p-4 text-sm text-slate-900 placeholder:text-slate-400 resize-y disabled:opacity-60 disabled:cursor-not-allowed transition-all outline-none"
            style={{
              backgroundColor: "#FFF7ED",
              border: "1.5px solid #fed7aa",
              boxShadow: "inset 0 2px 6px rgba(249,115,22,0.04)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.backgroundColor = "#ffffff";
              e.currentTarget.style.border = "1.5px solid #4F46E5";
              e.currentTarget.style.boxShadow = "0 0 0 4px rgba(79,70,229,0.10)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.backgroundColor = "#FFF7ED";
              e.currentTarget.style.border = "1.5px solid #fed7aa";
              e.currentTarget.style.boxShadow = "inset 0 2px 6px rgba(249,115,22,0.04)";
            }}
            required
            minLength={5}
          />
          <div
            className="absolute bottom-3 right-3 text-xs px-2 py-0.5 rounded-lg select-none"
            style={{
              backgroundColor: "rgba(255,255,255,0.85)",
              color: "#9ca3af",
              border: "1px solid #fed7aa",
            }}
          >
            {text.length} chars
          </div>
        </div>

        {/* Sample Chips */}
        {!text && !isLoading && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold flex items-center space-x-1" style={{ color: "#9ca3af" }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: "#F97316" }} />
              <span>Try a sample:</span>
            </span>
            {SAMPLES.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => setText(sample.text)}
                className="text-xs px-2.5 py-1 rounded-lg font-semibold transition-all"
                style={{
                  backgroundColor: "#FFF7ED",
                  color: "#C2410C",
                  border: "1px solid #fed7aa",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffedd5";
                  e.currentTarget.style.borderColor = "#F97316";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FFF7ED";
                  e.currentTarget.style.borderColor = "#fed7aa";
                }}
              >
                {sample.label}
              </button>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading || text.trim().length < 5}
            className="inline-flex items-center justify-center space-x-2 px-7 py-3 rounded-2xl text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #F97316 100%)",
              boxShadow: "0 4px 16px rgba(79,70,229,0.30)",
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.boxShadow = "0 6px 24px rgba(249,115,22,0.35)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(79,70,229,0.30)";
              e.currentTarget.style.transform = "translateY(0px)";
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing & Tagging...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Generate Summary & Tags</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
