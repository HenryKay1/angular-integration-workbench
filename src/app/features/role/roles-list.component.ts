import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { DataViewComponent } from '../../shared/components/data-view/data-view.component';
import {
  DataViewCardConfig,
  DataViewColumn,
  DataViewPaginationConfig,
  DataViewProcessingState
} from '../../shared/components/data-view/data-view.models';
import { RoleViewModel } from './role.models';
import { RoleService } from './role.service';

@Component({
  selector: 'aiw-roles-list',
  standalone: true,
  imports: [CommonModule, DataViewComponent, RouterLink],
  templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.css'
})
export class RolesListComponent implements OnInit {
  private readonly roleService = inject(RoleService);

  protected roles: RoleViewModel[] = [];
  protected totalRoles = 0;
  protected isLoading = false;
  protected errorMessage = '';

  protected readonly columns: DataViewColumn<RoleViewModel>[] = [
    {
      fieldName: 'name',
      header: 'Role',
      value: (role) => role.name,
      sortable: true,
      searchable: true,
      filter: {
        valueType: 'string',
        controlType: 'input'
      }
    },
    {
      fieldName: 'description',
      header: 'Description',
      value: (role) => role.description ?? '',
      sortable: true,
      searchable: true,
      filter: {
        valueType: 'string',
        controlType: 'input'
      }
    },
    {
      fieldName: 'companyScopeName',
      header: 'Company Scope',
      value: (role) => role.companyScopeName ?? '',
      sortable: true,
      searchable: true,
      filter: {
        valueType: 'string',
        controlType: 'input'
      }
    },
    {
      fieldName: 'hasAllPermissions',
      header: 'All Permissions',
      value: (role) => (role.hasAllPermissions ? 'Yes' : 'No'),
      sortable: true,
      filter: {
        valueType: 'boolean',
        controlType: 'select',
        options: [
          { label: 'Yes', value: true },
          { label: 'No', value: false }
        ]
      }
    },
    {
      fieldName: 'isActive',
      header: 'Status',
      value: (role) => (role.isActive ? 'Active' : 'Inactive'),
      sortable: true,
      filter: {
        valueType: 'boolean',
        controlType: 'select',
        options: [
          { label: 'Active', value: true },
          { label: 'Inactive', value: false }
        ]
      }
    }
  ];

  protected readonly cardConfig: DataViewCardConfig<RoleViewModel> = {
    eyebrow: (role) => role.companyScopeName ?? 'Unscoped',
    title: (role) => role.name,
    description: (role) => role.description ?? '',
    fields: [
      {
        label: 'Status',
        value: (role) => (role.isActive ? 'Active' : 'Inactive')
      },
      {
        label: 'Permissions',
        value: (role) =>
          role.hasAllPermissions ? 'All permissions' : 'Assigned permissions'
      }
    ]
  };

  protected readonly roleLink = (role: RoleViewModel): string[] => [
    '/roles',
    String(role.roleId)
  ];

  protected readonly pagination: DataViewPaginationConfig = {
    enabled: true,
    defaultPageSize: 5,
    fastStep: 5
  };

  private currentRequest: DataViewProcessingState<RoleViewModel> = {
    searchTerm: '',
    sort: {
      fieldName: 'name',
      direction: 'asc'
    },
    filters: [],
    filterLogic: 'and',
    pagination: {
      pageIndex: 0,
      pageSize: this.pagination.defaultPageSize ?? 10
    }
  };

  ngOnInit(): void {
    this.loadRoles(this.currentRequest);
  }

  protected handleProcessingChanged(
    state: DataViewProcessingState<RoleViewModel>
  ): void {
    this.currentRequest = state;
    this.loadRoles(state);
  }

  private loadRoles(request: DataViewProcessingState<RoleViewModel>): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.roleService
      .listRolesDataView(request)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (result) => {
          this.roles = result.items;
          this.totalRoles = result.totalCount;
        },
        error: () => {
          this.roles = [];
          this.totalRoles = 0;
          this.errorMessage = 'Roles could not be loaded from the API.';
        }
      });
  }
}
