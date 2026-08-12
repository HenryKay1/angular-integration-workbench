import { AsyncPipe, DatePipe, JsonPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { combineLatest, map, switchMap } from 'rxjs';
import { RecordService } from '../../../core/services/record.service';

@Component({
  selector: 'aiw-record-detail-page',
  standalone: true,
  imports: [AsyncPipe, DatePipe, JsonPipe, NgFor, NgIf, RouterLink],
  templateUrl: './record-detail-page.component.html',
  styleUrl: './record-detail-page.component.css'
})
export class RecordDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly recordService = inject(RecordService);

  protected readonly viewModel$ = this.route.paramMap.pipe(
    map((params) => params.get('id') ?? ''),
    switchMap((id) =>
      combineLatest({
        record: this.recordService.getRecordById(id),
        history: this.recordService.getRecordHistory(id)
      })
    )
  );
}
