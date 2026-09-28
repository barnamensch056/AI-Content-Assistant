"use client";

import { useEffect, useState } from "react";
import { Sparkles, Activity } from "lucide-react";
import { checkBackendHealth } from "@/lib/api";

export default function Header() {
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    checkBackendHealth().then(setIsBackendHealthy);
    const interval = setInterval(() => {
      checkBackendHealth().then(setIsBackendHealthy);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-orange-100 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      {/* Top Gradient Stripe: Indigo to Orange */}
      <div className="h-1 w-full bg-gradient-to-r from-[#4F46E5] via-indigo-500 to-[#F97316]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#F97316] flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                AI Content{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F46E5] to-[#F97316]">
                  Assistant
                </span>
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFF7ED] text-[#EA580C] border border-[#FED7AA]">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Intelligent summary & 3-tag knowledge extraction
            </p>
          </div>
        </div>

        {/* Backend Status Badge */}
        <div className="flex items-center space-x-2 text-xs font-medium px-3.5 py-1.5 rounded-full bg-[#FFF7ED] border border-[#FED7AA] text-slate-700 shadow-2xs">
          <Activity className="w-3.5 h-3.5 text-[#4F46E5]" />
          <span className="text-slate-500">Backend:</span>
          {isBackendHealthy === null ? (
            <span className="text-slate-400">Connecting...</span>
          ) : isBackendHealthy ? (
            <span className="flex items-center space-x-1.5 text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Online</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 text-[#EA580C] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#F97316] animate-ping"></span>
              <span>Offline (Check Port 8000)</span>
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
