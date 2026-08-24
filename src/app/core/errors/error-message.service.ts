import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorMessage } from './error-message.model';

@Injectable({
  providedIn: 'root'
})
export class ErrorMessageService {
  private readonly defaultSummary = 'Unable to complete the request.';
  private readonly defaultDetails = 'No additional error details were provided.';

  fromUnknown(error: unknown, fallbackSummary: string = this.defaultSummary): ErrorMessage {
    const summary = this.normalize(fallbackSummary) || this.defaultSummary;
    const details = this.extractDetails(error);

    return {
      summary,
      details: details || this.defaultDetails
    };
  }

  private extractDetails(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return this.extractHttpErrorDetails(error);
    }

    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    if (this.isRecord(error)) {
      return this.extractRecordMessage(error);
    }

    return '';
  }

  private extractHttpErrorDetails(error: HttpErrorResponse): string {
    const bodyDetails = this.extractBodyDetails(error.error);

    if (bodyDetails) {
      return bodyDetails;
    }

    return error.message || `HTTP ${error.status}: ${error.statusText}`;
  }

  private extractBodyDetails(body: unknown): string {
    if (typeof body === 'string') {
      return body;
    }

    if (!this.isRecord(body)) {
      return '';
    }

    const validationErrors = this.extractValidationErrors(body['errors']);
    const message = this.firstString(
      body['detail'],
      body['message'],
      body['title']
    );

    return [message, validationErrors].filter(Boolean).join('\n\n');
  }

  private extractRecordMessage(record: Record<string, unknown>): string {
    const validationErrors = this.extractValidationErrors(record['errors']);
    const message = this.firstString(
      record['detail'],
      record['message'],
      record['title']
    );

    return [message, validationErrors].filter(Boolean).join('\n\n');
  }

  private extractValidationErrors(errors: unknown): string {
    if (!this.isRecord(errors)) {
      return '';
    }

    return Object.entries(errors)
      .flatMap(([field, messages]) => this.toMessageList(messages).map((message) => `${field}: ${message}`))
      .join('\n');
  }

  private toMessageList(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string');
    }

    return typeof value === 'string' ? [value] : [];
  }

  private firstString(...values: unknown[]): string {
    return values.find((value): value is string => typeof value === 'string' && !!value.trim()) ?? '';
  }

  private normalize(value: string): string {
    return value.trim();
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
