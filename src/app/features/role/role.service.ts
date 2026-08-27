import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/http/api.config';
import {
  DataViewProcessingState,
  DataViewResult
} from '../../shared/components/data-view/data-view.models';
import {
  PermissionViewModel,
  RoleDetailsViewModel,
  RoleNameValidationRequest,
  RoleViewModel,
  UpsertRoleRequest,
  ValidationResult
} from './role.models';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly accessUrl = `${this.apiBaseUrl}/access`;

  listRoles(): Observable<RoleViewModel[]> {
    return this.http.get<RoleViewModel[]>(`${this.accessUrl}/roles`);
  }

  listRolesDataView(
    request: DataViewProcessingState<RoleViewModel>
  ): Observable<DataViewResult<RoleViewModel>> {
    return this.http.post<DataViewResult<RoleViewModel>>(
      `${this.accessUrl}/roles/dataview`,
      request
    );
  }

  getRole(roleId: number): Observable<RoleViewModel> {
    return this.http.get<RoleViewModel>(`${this.accessUrl}/roles/${roleId}`);
  }

  getRoleDetails(roleId: number): Observable<RoleDetailsViewModel> {
    return this.http.get<RoleDetailsViewModel>(
      `${this.accessUrl}/roles/${roleId}/details`
    );
  }

  createRole(request: UpsertRoleRequest): Observable<RoleViewModel> {
    return this.http.post<RoleViewModel>(`${this.accessUrl}/roles`, request);
  }

  updateRole(roleId: number, request: UpsertRoleRequest): Observable<void> {
    return this.http.put<void>(`${this.accessUrl}/roles/${roleId}`, request);
  }

  deactivateRole(roleId: number): Observable<void> {
    return this.http.delete<void>(`${this.accessUrl}/roles/${roleId}`);
  }

  roleNameIsUnique(
    name: string,
    roleId?: number | null
  ): Observable<ValidationResult> {
    const request: RoleNameValidationRequest = {
      name,
      roleId
    };

    return this.http.post<ValidationResult>(
      `${this.accessUrl}/roles/validate-name`,
      request
    );
  }

  listPermissions(): Observable<PermissionViewModel[]> {
    return this.http.get<PermissionViewModel[]>(
      `${this.accessUrl}/permissions`
    );
  }
}
