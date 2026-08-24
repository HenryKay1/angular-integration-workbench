import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmationOptions, POPUP_DEFAULTS } from '../popup.models';

@Component({
  selector: 'aiw-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.css'
})
export class ConfirmationDialogComponent {
  protected readonly data = inject<ConfirmationOptions>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ConfirmationDialogComponent>);

  protected get title(): string {
    return this.data.title?.trim() || POPUP_DEFAULTS.confirmationTitle;
  }

  protected get confirmText(): string {
    return this.data.confirmText?.trim() || POPUP_DEFAULTS.confirmationConfirmText;
  }

  protected get cancelText(): string {
    return this.data.cancelText?.trim() || POPUP_DEFAULTS.confirmationCancelText;
  }

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  protected confirm(): void {
    this.dialogRef.close(true);
  }
}
