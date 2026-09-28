"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import InputForm from "@/components/InputForm";
import EntryList from "@/components/EntryList";
import EntryDetailModal from "@/components/EntryDetailModal";
import ErrorAlert from "@/components/ErrorAlert";
import { EntryListItem } from "@/lib/types";
import { fetchEntries, submitText, APIError } from "@/lib/api";

export default function Home() {
  const [entries, setEntries] = useState<EntryListItem[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListLoading, setIsListLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    setIsListLoading(true);
    try {
      const data = await fetchEntries();
      setEntries(data);
    } catch (err: unknown) {
      if (err instanceof APIError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(
          "Unable to connect to the backend server. Make sure your FastAPI server is running on port 8000."
        );
      }
    } finally {
      setIsListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleSubmit = async (text: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const newEntry = await submitText(text);
      setEntries((prev) => [
        {
          id: newEntry.id,
          summary: newEntry.summary,
          tags: newEntry.tags,
          created_at: newEntry.created_at,
        },
        ...prev,
      ]);
      // Automatically open the detail modal to show the new result
      setSelectedEntryId(newEntry.id);
    } catch (err: unknown) {
      if (err instanceof APIError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected network error occurred while submitting text.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden"
      style={{ backgroundColor: "#FFF7ED" }}
    >
      {/* Ambient background blobs */}
      <div
        className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none -z-10"
        style={{ background: "radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none -z-10"
        style={{ background: "radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 70%)" }}
      />

      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column — Input Form (5 cols on large) */}
          <section className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
            <ErrorAlert
              message={errorMessage}
              onDismiss={() => setErrorMessage(null)}
            />
            <InputForm onSubmit={handleSubmit} isLoading={isSubmitting} />
          </section>

          {/* Right Column — Saved Entries List (7 cols on large) */}
          <section className="lg:col-span-7">
            <EntryList
              entries={entries}
              onSelectEntry={(id) => setSelectedEntryId(id)}
              selectedId={selectedEntryId}
              isLoading={isListLoading}
              onRefresh={loadEntries}
            />
          </section>
        </div>
      </main>

      {/* Entry Detail Modal */}
      <EntryDetailModal
        entryId={selectedEntryId}
        onClose={() => setSelectedEntryId(null)}
      />
    </div>
  );
}
