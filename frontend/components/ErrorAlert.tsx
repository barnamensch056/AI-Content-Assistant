"use client";

import { AlertCircle, X } from "lucide-react";

interface ErrorAlertProps {
  message: string | null;
  onDismiss?: () => void;
}

export default function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div className="rounded-2xl p-4 flex items-start justify-between shadow-sm"
      style={{
        background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
        border: "1px solid #fed7aa",
      }}
    >
      <div className="flex items-start space-x-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: "#fff7ed", border: "1.5px solid #F97316" }}
        >
          <AlertCircle className="w-4 h-4" style={{ color: "#F97316" }} />
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: "#9A3412" }}>
            Request Error
          </h3>
          <p className="text-xs sm:text-sm mt-0.5 leading-relaxed" style={{ color: "#C2410C" }}>
            {message}
          </p>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1.5 rounded-lg transition-colors flex-shrink-0"
          style={{ color: "#F97316" }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.backgroundColor = "#fed7aa")}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.backgroundColor = "transparent")}
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
