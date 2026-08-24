export interface PermissionViewModel {
  permissionId: number;
  code: string;
  name: string;
  description?: string | null;
}

export interface RoleViewModel {
  roleId: number;
  name: string;
  description?: string | null;
  companyScopeValue: number;
  companyScopeName?: string | null;
  hasAllPermissions: boolean;
  isActive: boolean;
}

export interface RoleDetailsViewModel extends RoleViewModel {
  permissions: PermissionViewModel[];
}

export interface UpsertRoleRequest {
  name: string;
  description?: string | null;
  companyScopeValue: number;
  hasAllPermissions: boolean;
  isActive: boolean;
  permissionIds: number[];
}

export interface RoleNameValidationRequest {
  name: string;
  roleId?: number | null;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string | null;
}

export interface CompanyScopeOption {
  label: string;
  value: number;
}

export const COMPANY_SCOPE_OPTIONS: CompanyScopeOption[] = [
  { label: 'Internal', value: 1 },
  { label: 'External', value: 2 },
  { label: 'Both', value: 3 }
];
