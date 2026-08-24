import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, of } from 'rxjs';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';
import { POPUP_DEFAULTS } from './popup.models';
import { PopupService } from './popup.service';

describe('PopupService', () => {
  let service: PopupService;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let action$: Subject<void>;

  beforeEach(() => {
    action$ = new Subject<void>();
    snackBar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    snackBar.open.and.returnValue({
      onAction: () => action$.asObservable()
    } as ReturnType<MatSnackBar['open']>);

    TestBed.configureTestingModule({
      providers: [
        PopupService,
        { provide: MatSnackBar, useValue: snackBar },
        { provide: MatDialog, useValue: dialog }
      ]
    });

    service = TestBed.inject(PopupService);
  });

  it('opens success, error, warning, and info snackbars with typed classes', () => {
    service.success('Saved.');
    service.error('Failed.');
    service.warning('Careful.');
    service.info('Heads up.');

    expect(snackBar.open.calls.allArgs().map((args) => args[0])).toEqual([
      'Saved.',
      'Failed.',
      'Careful.',
      'Heads up.'
    ]);
    expect(snackBar.open.calls.allArgs().map((args) => args[2]?.panelClass)).toEqual([
      ['aiw-toast', 'aiw-toast--success'],
      ['aiw-toast', 'aiw-toast--error'],
      ['aiw-toast', 'aiw-toast--warning'],
      ['aiw-toast', 'aiw-toast--info']
    ]);
    expect(snackBar.open.calls.mostRecent().args[2]).toEqual(
      jasmine.objectContaining({
        horizontalPosition: 'end',
        verticalPosition: 'top'
      })
    );
  });

  it('allows snackbar position to be configured per toast', () => {
    service.info('Saved.', undefined, {
      position: {
        horizontal: 'center',
        vertical: 'bottom'
      }
    });

    expect(snackBar.open).toHaveBeenCalledWith(
      'Saved.',
      undefined,
      jasmine.objectContaining({
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      })
    );
  });

  it('uses a fallback message when no toast message is provided', () => {
    service.error(undefined);

    expect(snackBar.open).toHaveBeenCalledWith(
      POPUP_DEFAULTS.fallbackMessage,
      undefined,
      jasmine.objectContaining({ panelClass: ['aiw-toast', 'aiw-toast--error'] })
    );
  });

  it('normalizes unknown errors through the shared error-message service', () => {
    service.errorFrom(
      new HttpErrorResponse({
        status: 500,
        error: {
          detail: 'Database timeout.'
        }
      }),
      'Unable to save role.'
    );

    expect(snackBar.open).toHaveBeenCalledWith(
      'Unable to save role.',
      POPUP_DEFAULTS.detailsAction,
      jasmine.objectContaining({ panelClass: ['aiw-toast', 'aiw-toast--error'] })
    );

    action$.next();

    expect(dialog.open).toHaveBeenCalledWith(
      MessageDialogComponent,
      jasmine.objectContaining({
        data: {
          title: 'Error Details',
          message: 'Database timeout.'
        }
      })
    );
  });

  it('shows a View Details action for detailed messages and opens the details dialog', () => {
    service.error('Unable to save.', 'Server stack trace');

    expect(snackBar.open).toHaveBeenCalledWith(
      'Unable to save.',
      POPUP_DEFAULTS.detailsAction,
      jasmine.any(Object)
    );

    action$.next();

    expect(dialog.open).toHaveBeenCalledWith(
      MessageDialogComponent,
      jasmine.objectContaining({
        data: {
          title: 'Error Details',
          message: 'Server stack trace'
        }
      })
    );
  });

  it('moves long messages into the details dialog without truncating them', () => {
    const longMessage = 'x'.repeat(POPUP_DEFAULTS.maxToastLength + 1);

    service.warning(longMessage);
    action$.next();

    expect(snackBar.open).toHaveBeenCalledWith(
      POPUP_DEFAULTS.fallbackMessage,
      POPUP_DEFAULTS.detailsAction,
      jasmine.any(Object)
    );
    expect(dialog.open).toHaveBeenCalledWith(
      MessageDialogComponent,
      jasmine.objectContaining({
        data: jasmine.objectContaining({ message: longMessage })
      })
    );
  });

  it('executes the confirmation callback only when confirmed', async () => {
    const callback = jasmine.createSpy('callback').and.resolveTo();
    dialog.open.and.returnValue({
      afterClosed: () => of(true)
    } as ReturnType<MatDialog['open']>);

    await service.confirm({ message: 'Delete?' }, callback);

    expect(dialog.open).toHaveBeenCalledWith(
      ConfirmationDialogComponent,
      jasmine.objectContaining({
        data: jasmine.objectContaining({ message: 'Delete?' })
      })
    );
    expect(callback).toHaveBeenCalled();
  });

  it('does not execute the confirmation callback when canceled', async () => {
    const callback = jasmine.createSpy('callback');
    dialog.open.and.returnValue({
      afterClosed: () => of(false)
    } as ReturnType<MatDialog['open']>);

    await service.confirm({ message: 'Delete?' }, callback);

    expect(callback).not.toHaveBeenCalled();
  });
});
