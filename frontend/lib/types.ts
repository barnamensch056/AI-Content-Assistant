export interface Entry {
  id: number;
  original_text: string;
  summary: string;
  tags: string[];
  created_at: string;
}

export interface EntryListItem {
  id: number;
  summary: string;
  tags: string[];
  created_at: string;
}

export interface TextSubmission {
  text: string;
}

export interface APIErrorResponse {
  detail?: string | { msg?: string }[];
}
