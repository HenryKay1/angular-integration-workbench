import { FormControl, FormGroup } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, isObservable, of, throwError } from 'rxjs';
import {
  FormFieldConfig,
  ValidationContext
} from '../components/form-shell/form-config.model';
import { AsyncValidatorRegistry } from './async-validator-registry.service';

describe('AsyncValidatorRegistry', () => {
  let registry: AsyncValidatorRegistry;
  const field: FormFieldConfig = {
    key: 'name',
    label: 'Role name',
    type: 'text'
  };
  const context: ValidationContext = {
    form: new FormGroup({}),
    values: {}
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    registry = TestBed.inject(AsyncValidatorRegistry);
  });

  it('returns the validator error when the validation result is invalid', async () => {
    const [validator] = registry.resolveAll(
      field,
      [
        {
          validator: 'roleNameIsUnique',
          validate: () => of({ isValid: false })
        }
      ],
      () => context
    );

    const result = validator(new FormControl('Administrator'));

    expect(isObservable(result) ? await firstValueFrom(result) : await result).toEqual({
      roleNameIsUnique: true
    });
  });

  it('does not show a validation error when server validation cannot be reached', async () => {
    const [validator] = registry.resolveAll(
      field,
      [
        {
          validator: 'roleNameIsUnique',
          validate: () => throwError(() => new Error('API unavailable'))
        }
      ],
      () => context
    );

    const result = validator(new FormControl('Administrator'));

    expect(isObservable(result) ? await firstValueFrom(result) : await result).toBeNull();
  });
});
