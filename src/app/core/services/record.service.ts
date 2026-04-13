import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { RecordHistoryEntry } from '../models/record-history-entry.model';
import { RecordItem } from '../models/record.model';

@Injectable({
  providedIn: 'root'
})
export class RecordService {
  private readonly http = inject(HttpClient);
  private readonly recordsUrl = 'assets/mock-data/records.json';
  private readonly historyUrl = 'assets/mock-data/record-history.json';

  private readonly records$ = this.http
    .get<RecordItem[]>(this.recordsUrl)
    .pipe(shareReplay(1));

  private readonly history$ = this.http
    .get<RecordHistoryEntry[]>(this.historyUrl)
    .pipe(shareReplay(1));

  getRecords(): Observable<RecordItem[]> {
    return this.records$;
  }

  getRecordById(id: string): Observable<RecordItem | undefined> {
    return this.records$.pipe(
      map((records) => records.find((record) => record.id === id))
    );
  }

  getRecordHistory(recordId: string): Observable<RecordHistoryEntry[]> {
    return this.history$.pipe(
      map((entries) =>
        entries.filter((entry) => entry.recordId === recordId)
      )
    );
  }
}
