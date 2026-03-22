import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RecordHistoryEntry } from '../models/record-history-entry.model';
import { RecordItem } from '../models/record.model';

const MOCK_RECORDS: RecordItem[] = [
  {
    id: 'rec-1001',
    title: 'Customer Profile Sync',
    status: 'Active',
    owner: 'Platform Operations',
    category: 'Customer Data',
    createdAt: '2026-03-18T09:30:00Z',
    updatedAt: '2026-03-20T12:00:00Z',
    summary: 'Synchronizes customer profile changes between CRM and downstream systems.',
    currentPayload: {
      sourceSystem: 'Dynamics 365',
      targetSystem: 'Customer Data Hub',
      syncMode: 'Near real-time'
    }
  }
];

const MOCK_RECORD_HISTORY: RecordHistoryEntry[] = [
  {
    id: 'hist-2001',
    recordId: 'rec-1001',
    eventType: 'Created',
    changedBy: 'Integration Analyst',
    changedAt: '2026-03-18T09:30:00Z',
    oldPayload: null,
    newPayload: {
      sourceSystem: 'Dynamics 365',
      targetSystem: 'Customer Data Hub',
      syncMode: 'Batch'
    },
    notes: 'Initial integration definition created.'
  },
  {
    id: 'hist-2002',
    recordId: 'rec-1001',
    eventType: 'Updated',
    changedBy: 'Platform Engineer',
    changedAt: '2026-03-20T12:00:00Z',
    oldPayload: {
      sourceSystem: 'Dynamics 365',
      targetSystem: 'Customer Data Hub',
      syncMode: 'Batch'
    },
    newPayload: {
      sourceSystem: 'Dynamics 365',
      targetSystem: 'Customer Data Hub',
      syncMode: 'Near real-time'
    },
    notes: 'Changed sync mode after API webhook rollout.'
  }
];

@Injectable({
  providedIn: 'root'
})
export class RecordService {
  listRecords(): Observable<RecordItem[]> {
    return of(MOCK_RECORDS);
  }

  getRecordById(id: string): Observable<RecordItem | undefined> {
    return of(MOCK_RECORDS.find((record) => record.id === id));
  }

  getRecordHistory(recordId: string): Observable<RecordHistoryEntry[]> {
    return of(
      MOCK_RECORD_HISTORY.filter((entry) => entry.recordId === recordId)
    );
  }
}
