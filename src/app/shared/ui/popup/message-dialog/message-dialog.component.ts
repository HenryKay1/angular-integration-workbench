import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MessageDialogData } from '../popup.models';

@Component({
  selector: 'aiw-message-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './message-dialog.component.html',
  styleUrl: './message-dialog.component.css'
})
export class MessageDialogComponent {
  protected readonly data = inject<MessageDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<MessageDialogComponent>);

  protected close(): void {
    this.dialogRef.close();
  }
}
