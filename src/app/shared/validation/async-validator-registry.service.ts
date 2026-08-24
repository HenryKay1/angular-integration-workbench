import { Injectable } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors
} from '@angular/forms';
import { Observable, catchError, map, of, switchMap, timer } from 'rxjs';
import {
  AsyncValidatorConfig,
  FormFieldConfig,
  ValidationContext
} from '../components/form-shell/form-config.model';

type ValidationContextFactory = () => ValidationContext;

@Injectable({
  providedIn: 'root'
})
export class AsyncValidatorRegistry {
  resolveAll(
    _field: FormFieldConfig,
    configs: AsyncValidatorConfig[],
    contextFactory: ValidationContextFactory
  ): AsyncValidatorFn[] {
    return configs.map((config) => this.resolve(config, contextFactory));
  }

  getErrorKey(validatorName: string): string {
    return validatorName;
  }

  private resolve(
    config: AsyncValidatorConfig,
    contextFactory: ValidationContextFactory
  ): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (config.when && !config.when(contextFactory())) {
        return of(null);
      }

      if (this.isEmptyValue(control.value)) {
        return of(null);
      }

      const debounceMs = Math.max(0, config.debounceMs ?? 0);
      const context = contextFactory();

      if (!config.validate) {
        throw new Error(`Async validator "${config.validator}" must provide a validate callback.`);
      }

      return timer(debounceMs).pipe(
        switchMap(() => config.validate!(control.value, context)),
        map((result) =>
          result.isValid ? null : { [config.validator]: true }
        ),
        catchError(() => of(null))
      );
    };
  }

  private isEmptyValue(value: unknown): boolean {
    return value === null || value === undefined || value === '';
  }
}
