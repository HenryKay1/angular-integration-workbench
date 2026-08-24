import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, finalize, forkJoin, of, switchMap } from 'rxjs';
import {
  DropdownOption,
  DropdownSelection,
  FormConfig,
  FormSubmissionValue
} from '../../shared/components/form-shell/form-config.model';
import { FormShellComponent } from '../../shared/components/form-shell/form-shell.component';
import { LoadingConfig } from '../../shared/ui/loading/loading.models';
import { LoadingDirective } from '../../shared/ui/loading/loading.directive';
import { PopupService } from '../../shared/ui/popup/popup.service';
import {
  COMPANY_SCOPE_OPTIONS,
  PermissionViewModel,
  RoleDetailsViewModel,
  UpsertRoleRequest
} from './role.models';
import { RoleService } from './role.service';

@Component({
  selector: 'aiw-upsert-role',
  standalone: true,
  imports: [CommonModule, FormShellComponent, LoadingDirective, RouterLink],
  templateUrl: './upsert-role.component.html',
  styleUrl: './upsert-role.component.css'
})
export class UpsertRoleComponent implements OnInit {
  @ViewChild(FormShellComponent) private formShell?: FormShellComponent;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly popup = inject(PopupService);
  private readonly roleService = inject(RoleService);

  protected roleId: number | null = null;
  protected formConfig: FormConfig = this.buildFormConfig([]);
  protected initialValue: FormSubmissionValue = this.buildInitialValue();
  protected isLoading = false;
  protected isSaving = false;
  protected errorMessage: string | null = null;

  protected get isEditMode(): boolean {
    return this.roleId !== null;
  }

  protected get loadingConfig(): LoadingConfig {
    return {
      indicator: this.isSaving ? 'logo' : 'spinner',
      message: this.isSaving ? 'Saving role...' : 'Loading role setup...'
    };
  }

  ngOnInit(): void {
    this.loadRoleForm();
  }

  protected submitRole(value: FormSubmissionValue): void {
    if (this.isSaving) {
      return;
    }

    const wasEditMode = this.isEditMode;
    const request = this.buildRequest(value);
    const save$: Observable<unknown> =
      this.roleId === null
        ? this.roleService.createRole(request)
        : this.roleService.updateRole(this.roleId, request);

    this.isSaving = true;
    this.errorMessage = null;

    save$.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => {
        this.popup.success(
          wasEditMode
            ? 'Role updated successfully.'
            : 'Role created successfully.'
        );

        if (!wasEditMode) {
          const resetValue = this.buildInitialValue();
          this.initialValue = resetValue;
          this.formShell?.reset(resetValue);
        }
      },
      error: (error: unknown) => {
        this.popup.errorFrom(error, 'Unable to save role.');
      }
    });
  }

  protected cancel(): void {
    void this.router.navigate(['/']);
  }

  private loadRoleForm(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const roleId = Number(params.get('roleId'));
          this.roleId = Number.isFinite(roleId) && roleId > 0 ? roleId : null;
          // this.isLoading = true;
          this.errorMessage = null;

          return forkJoin({
            permissions: this.roleService.listPermissions(),
            role: this.roleId
              ? this.roleService.getRoleDetails(this.roleId)
              : of(null)
          });
        }),
      )
      .subscribe({
        next: ({ permissions, role }) => {
          this.formConfig = this.buildFormConfig(permissions);
          this.initialValue = role
            ? this.buildInitialValue(role)
            : this.buildInitialValue();
          // this.isLoading = false;
        },
        error: (error: unknown) => {
          this.errorMessage = 'Unable to load role setup.';
          this.popup.errorFrom(error, this.errorMessage);
          // this.isLoading = false;
        }
      });
  }

  private buildFormConfig(permissions: PermissionViewModel[]): FormConfig {
    return {
      formWidth: '100%',
      fieldsPerLine: 2,
      fieldMinWidth: '18rem',
      fieldSpacing: '1rem',

      fields: [
        {
          key: 'name',
          label: 'Role name',
          type: 'text',
          placeholder: 'Role Name',
          validators: [
            {
              validator: 'required',
              message: 'Role name is required.'
            },
            {
              validator: 'maxLength',
              value: 120,
              message: 'Role name cannot exceed 120 characters.'
            }
          ],
          asyncValidators: [
            {
              validator: 'roleNameIsUnique',
              message: 'Role name must be unique.',
              debounceMs: 350,
              validate: (value, context) =>
                this.roleService.roleNameIsUnique(
                  String(value ?? ''),
                  this.toOptionalNumber(context.values['roleId'])
                )
            }
          ],
        },
        {
          key: 'roleId',
          label: 'Role id',
          type: 'number',
          hidden: true,
        },
        {
          key: 'companyScope',
          label: 'Company scope',
          type: 'dropdown',
          searchable: false,
          options: this.companyScopeDropdownOptions,
          placeholder: 'Choose Company Scope',
          validators: [
            {
              validator: 'required',
              message: 'Company scope is required.'
            }
          ],
        },
       
      
       
 
        {
          key: 'permissions',
          label: 'Permissions',
          type: 'dropdown',
          searchable: true,
          multiSelect: true,
          options: this.toPermissionOptions(permissions),
          placeholder: 'Choose permissions',
          helperText: '',
          colSpan: 2,
        },
         {
          key: 'hasAllPermissions',
          label: 'Grant all permissions',
          type: 'checkbox',
          controlStyle: 'toggle',
        },
          {
          key: 'description',
          label: 'Description',
          type: 'textarea',
          rows: 4,
          placeholder: 'Describe where this role should be used.',
          colSpan: 2,
        },
         {
          key: 'isActive',
          label: 'Active',
          type: 'checkbox',
          controlStyle: 'toggle',
          align: 'right',
          colSpan: 2,
        },
      ],
      stateRules: [
        {
          dependsOn: ['hasAllPermissions'],
          execute: ({ values, fields }) => {
            if (values['hasAllPermissions'] === true) {
              fields.disable('permissions');
              fields.clear('permissions');
              fields.update('permissions', {
                helperText: 'All permissions are granted for this role.'
              });
              return;
            }

            fields.enable('permissions');
            fields.update('permissions', {
              helperText: ''
            });
          }
        }
      ]
    };
  }

  private buildInitialValue(role?: RoleDetailsViewModel): FormSubmissionValue {
    return {
      roleId: role?.roleId ?? this.roleId,
      name: role?.name ?? '',
      description: role?.description ?? '',
      companyScope: this.toCompanyScopeSelection(role?.companyScopeValue ?? 1),
      hasAllPermissions: role?.hasAllPermissions ?? false,
      isActive: role?.isActive ?? true,
      permissions:
        role?.permissions.map((permission) =>
          this.toPermissionSelection(permission)
        ) ?? []
    };
  }

  private buildRequest(value: FormSubmissionValue): UpsertRoleRequest {
    const companyScope = this.readDropdownSelection(value['companyScope']);
    const permissions = this.readDropdownSelections(value['permissions']);
    const hasAllPermissions = value['hasAllPermissions'] === true;

    return {
      name: String(value['name'] ?? '').trim(),
      description: String(value['description'] ?? '').trim() || null,
      companyScopeValue: Number(companyScope?.selectedKey ?? 1),
      hasAllPermissions,
      isActive: value['isActive'] === true,
      permissionIds: hasAllPermissions
        ? []
        : permissions
            .map((permission) => Number(permission.selectedKey))
            .filter((permissionId) => Number.isFinite(permissionId))
    };
  }

  private get companyScopeDropdownOptions(): DropdownOption[] {
    return COMPANY_SCOPE_OPTIONS.map((option) => ({
      label: option.label,
      value: option.value
    }));
  }

  private toPermissionOptions(
    permissions: PermissionViewModel[]
  ): DropdownOption[] {
    return permissions.map((permission) => ({
      label: `${permission.name}`,
      value: permission.permissionId
    }));
  }

  private toCompanyScopeSelection(value: number): DropdownSelection {
    const option =
      COMPANY_SCOPE_OPTIONS.find((scope) => scope.value === value) ??
      COMPANY_SCOPE_OPTIONS[0];

    return {
      selectedKey: option.value,
      selectedLabel: option.label,
      isOther: false
    };
  }

  private toPermissionSelection(
    permission: PermissionViewModel
  ): DropdownSelection {
    return {
      selectedKey: permission.permissionId,
      selectedLabel: `${permission.name} (${permission.code})`,
      isOther: false
    };
  }

  private readDropdownSelection(value: unknown): DropdownSelection | null {
    if (Array.isArray(value)) {
      return (value[0] as DropdownSelection | undefined) ?? null;
    }

    return (value as DropdownSelection | null) ?? null;
  }

  private readDropdownSelections(value: unknown): DropdownSelection[] {
    return Array.isArray(value) ? (value as DropdownSelection[]) : [];
  }

  private toOptionalNumber(value: unknown): number | null {
    const numberValue = Number(value);

    return Number.isFinite(numberValue) && numberValue > 0
      ? numberValue
      : null;
  }
}
