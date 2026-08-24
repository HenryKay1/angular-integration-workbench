import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ErrorMessageService } from './error-message.service';

describe('ErrorMessageService', () => {
  let service: ErrorMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorMessageService);
  });

  it('uses the supplied fallback summary', () => {
    const message = service.fromUnknown(new Error('Backend failed.'), 'Unable to save role.');

    expect(message.summary).toBe('Unable to save role.');
    expect(message.details).toBe('Backend failed.');
  });

  it('extracts details from HttpErrorResponse problem details', () => {
    const message = service.fromUnknown(
      new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: {
          title: 'Validation failed',
          detail: 'The request was invalid.'
        }
      }),
      'Unable to save role.'
    );

    expect(message.details).toBe('The request was invalid.');
  });

  it('formats validation error dictionaries', () => {
    const message = service.fromUnknown(
      new HttpErrorResponse({
        status: 400,
        error: {
          title: 'Validation failed',
          errors: {
            name: ['Role name is required.'],
            permissionIds: ['Select at least one permission.']
          }
        }
      }),
      'Unable to save role.'
    );

    expect(message.details).toBe(
      [
        'Validation failed',
        'name: Role name is required.\npermissionIds: Select at least one permission.'
      ].join('\n\n')
    );
  });

  it('falls back when no details are available', () => {
    const message = service.fromUnknown(null, 'Unable to save role.');

    expect(message).toEqual({
      summary: 'Unable to save role.',
      details: 'No additional error details were provided.'
    });
  });
});
