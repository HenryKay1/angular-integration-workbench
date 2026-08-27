import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  NavigationComponent,
  NavigationSection
} from './shared/components/navigation/navigation.component';

@Component({
  selector: 'aiw-root',
  standalone: true,
  imports: [CommonModule, NavigationComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  protected isNavigationOpen = false;

  protected readonly mainNavigationSections: NavigationSection[] = [
    {
      label: 'Main',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: 'home',
          route: '/'
        },
        {
          id: 'forms',
          label: 'Forms',
          icon: 'form',
          route: '/forms',
          children: [
            {
              id: 'forms-foundation',
              label: 'Form foundation',
              icon: 'settings',
              route: '/forms'
            },
            {
              id: 'forms-permissions',
              label: 'Permissions setup',
              icon: 'shield'
            }
          ]
        },
        {
          id: 'records',
          label: 'Records',
          icon: 'records',
          route: '/records',
          children: [
            {
              id: 'records-active',
              label: 'Active records',
              icon: 'records',
              route: '/records'
            },
            {
              id: 'records-history',
              label: 'History review',
              icon: 'schedule'
            }
          ]
        },
        {
          id: 'projects',
          label: 'Projects',
          icon: 'project',
          children: [
            {
              id: 'projects-schedules',
              label: 'Schedules',
              icon: 'schedule'
            },
            {
              id: 'projects-products',
              label: 'Products',
              icon: 'product'
            }
          ]
        }
      ]
    },
    {
      label: 'Administration',
      items: [
        {
          id: 'users',
          label: 'Users',
          icon: 'users'
        },
        {
          id: 'roles',
          label: 'Roles and permissions',
          icon: 'shield',
          route: '/roles',
          children: [
            {
              id: 'roles-list',
              label: 'Role list',
              icon: 'records',
              route: '/roles'
            },
            {
              id: 'roles-new',
              label: 'Add role',
              icon: 'form',
              route: '/roles/new'
            }
          ]
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: 'settings'
        }
      ]
    }
  ];

  protected closeNavigation(): void {
    this.isNavigationOpen = false;
  }

  protected openNavigation(): void {
    this.isNavigationOpen = true;
  }
}
