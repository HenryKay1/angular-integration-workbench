import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { ErrorMessageService } from '../../../core/errors/error-message.service';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';
import {
  ConfirmationOptions,
  MessageDialogData,
  POPUP_DEFAULTS,
  PopupType,
  ToastOptions
} from './popup.models';

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly errorMessage = inject(ErrorMessageService);

  success(message?: string | null, details?: string | null, options?: Partial<ToastOptions>): void {
    this.toast({ ...options, message, details, type: 'success' });
  }

  error(message?: string | null, details?: string | null, options?: Partial<ToastOptions>): void {
    this.toast({ ...options, message, details, type: 'error' });
  }

  errorFrom(
    error: unknown,
    fallbackSummary: string = POPUP_DEFAULTS.fallbackMessage,
    options?: Partial<ToastOptions>
  ): void {
    const message = this.errorMessage.fromUnknown(error, fallbackSummary);

    this.error(message.summary, message.details, options);
  }

  warning(message?: string | null, details?: string | null, options?: Partial<ToastOptions>): void {
    this.toast({ ...options, message, details, type: 'warning' });
  }

  info(message?: string | null, details?: string | null, options?: Partial<ToastOptions>): void {
    this.toast({ ...options, message, details, type: 'info' });
  }

  toast(options: ToastOptions | string): void {
    const toastOptions =
      typeof options === 'string' ? ({ message: options, type: 'info' } satisfies ToastOptions) : options;
    const type = toastOptions.type ?? 'info';
    const normalizedMessage = this.normalizeText(toastOptions.message);
    const normalizedDetails = this.normalizeText(toastOptions.details);
    const messageIsTooLong = !!normalizedMessage && normalizedMessage.length > POPUP_DEFAULTS.maxToastLength;
    const dialogMessage = normalizedDetails || (messageIsTooLong ? normalizedMessage : null);
    const message = this.resolveToastMessage(normalizedMessage, messageIsTooLong);
    const config: MatSnackBarConfig = {
      duration: toastOptions.duration ?? POPUP_DEFAULTS.toastDuration,
      horizontalPosition:
        toastOptions.position?.horizontal ?? POPUP_DEFAULTS.toastHorizontalPosition,
      verticalPosition:
        toastOptions.position?.vertical ?? POPUP_DEFAULTS.toastVerticalPosition,
      panelClass: ['aiw-toast', `aiw-toast--${type}`]
    };

    const snackBarRef = this.snackBar.open(
      message,
      dialogMessage ? POPUP_DEFAULTS.detailsAction : undefined,
      config
    );

    if (dialogMessage) {
      snackBarRef.onAction().subscribe(() => {
        this.openMessageDetails({
          title: toastOptions.detailsTitle ?? this.getDetailsTitle(type),
          message: dialogMessage
        });
      });
    }
  }

  openMessageDetails(data: MessageDialogData): void {
    this.dialog.open(MessageDialogComponent, {
      data,
      width: POPUP_DEFAULTS.detailsDialogWidth,
      maxWidth: POPUP_DEFAULTS.detailsDialogMaxWidth,
      maxHeight: POPUP_DEFAULTS.detailsDialogMaxHeight
    });
  }

  async confirm(
    options: ConfirmationOptions,
    onConfirm: () => void | Promise<void>
  ): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: options.title,
        message: options.message,
        confirmText: options.confirmText,
        cancelText: options.cancelText
      } satisfies ConfirmationOptions,
      width: '420px',
      maxWidth: '90vw'
    });
    const confirmed = await firstValueFrom(dialogRef.afterClosed());

    if (confirmed === true) {
      await onConfirm();
    }
  }

  private normalizeText(value: string | null | undefined): string {
    return value?.trim() ?? '';
  }

  private resolveToastMessage(message: string, messageIsTooLong: boolean): string {
    if (!message || messageIsTooLong) {
      return POPUP_DEFAULTS.fallbackMessage;
    }

    return message;
  }

  private getDetailsTitle(type: PopupType): string {
    const labels: Record<PopupType, string> = {
      success: 'Message Details',
      error: 'Error Details',
      warning: 'Warning Details',
      info: 'Message Details'
    };

    return labels[type];
  }
}
