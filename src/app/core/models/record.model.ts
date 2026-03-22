export interface RecordItem {
  id: string;
  title: string;
  status: string;
  owner: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  summary: string;
  currentPayload: Record<string, unknown>;
}
