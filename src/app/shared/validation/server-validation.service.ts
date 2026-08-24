import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/http/api.config';

export interface ServerValidationRequest {
  validator: string;
  value: unknown;
  context?: Record<string, unknown>;
}

export interface ServerValidationResult {
  isValid: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServerValidationService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly validationUrl = `${this.apiBaseUrl}/validation`;

  validate(
    validator: string,
    value: unknown,
    context?: Record<string, unknown>
  ): Observable<ServerValidationResult> {
    const request: ServerValidationRequest = {
      validator,
      value,
      context
    };

    return this.http.post<ServerValidationResult>(
      this.validationUrl,
      request
    );
  }
}
