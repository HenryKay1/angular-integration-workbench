export interface RecordHistoryEntry {
  id: string;
  recordId: string;
  eventType: string;
  changedBy: string;
  changedAt: string;
  oldPayload: Record<string, unknown> | null;
  newPayload: Record<string, unknown> | null;
  notes?: string;
}
