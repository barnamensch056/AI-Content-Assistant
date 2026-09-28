import { Entry, EntryListItem } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export class APIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "APIError";
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (typeof data.detail === "string") {
        errorDetail = data.detail;
      } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
        errorDetail = data.detail[0].msg;
      } else if (data.message) {
        errorDetail = data.message;
      }
    } catch {
      // response was not JSON
    }
    throw new APIError(errorDetail, res.status);
  }
  return res.json() as Promise<T>;
}

export async function fetchEntries(): Promise<EntryListItem[]> {
  const res = await fetch(`${API_BASE}/entries`, {
    cache: "no-store",
  });
  return handleResponse<EntryListItem[]>(res);
}

export async function fetchEntryById(id: number): Promise<Entry> {
  const res = await fetch(`${API_BASE}/entries/${id}`, {
    cache: "no-store",
  });
  return handleResponse<Entry>(res);
}

export async function submitText(text: string): Promise<Entry> {
  const res = await fetch(`${API_BASE}/entries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  return handleResponse<Entry>(res);
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}
