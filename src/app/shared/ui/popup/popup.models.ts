export type PopupType = 'success' | 'error' | 'warning' | 'info';
export type PopupHorizontalPosition = 'start' | 'center' | 'end' | 'left' | 'right';
export type PopupVerticalPosition = 'top' | 'bottom';

export interface PopupPosition {
  horizontal?: PopupHorizontalPosition;
  vertical?: PopupVerticalPosition;
}

export interface ToastOptions {
  message?: string | null;
  type?: PopupType;
  details?: string | null;
  duration?: number;
  detailsTitle?: string;
  position?: PopupPosition;
}

export interface MessageDialogData {
  title: string;
  message: string;
}

export interface ConfirmationOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const POPUP_DEFAULTS = {
  toastDuration: 5000,
  maxToastLength: 140,
  fallbackMessage: 'Unable to complete the request.',
  detailsAction: 'View Details',
  detailsDialogWidth: '700px',
  detailsDialogMaxWidth: '90vw',
  detailsDialogMaxHeight: '70vh',
  toastHorizontalPosition: 'end',
  toastVerticalPosition: 'top',
  confirmationTitle: 'Confirm',
  confirmationConfirmText: 'Confirm',
  confirmationCancelText: 'Cancel'
} as const;
