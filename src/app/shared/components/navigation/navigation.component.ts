import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

export type NavigationIcon =
  | 'home'
  | 'dashboard'
  | 'form'
  | 'records'
  | 'project'
  | 'schedule'
  | 'product'
  | 'users'
  | 'settings'
  | 'shield';

export interface NavigationItem {
  id: string;
  label: string;
  icon: NavigationIcon;
  route?: string | string[];
  children?: NavigationItem[];
}

export interface NavigationSection {
  label: string;
  items: NavigationItem[];
}

interface RouterBreadcrumb {
  label: string;
  route: string;
}

@Component({
  selector: 'aiw-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent {
  private readonly router = inject(Router);

  @Input() items: NavigationItem[] = [];
  @Input() sections: NavigationSection[] = [];
  @Input() homeRoute: string | string[] = '/';
  @Input() homeLabel = 'Dashboard';
  @Input() showBreadcrumb = true;
  @Input() appName = 'Angular Workbench';
  @Input() sidebarOpen = true;

  @Output() itemSelected = new EventEmitter<NavigationItem>();
  @Output() collapsed = new EventEmitter<void>();
  @Output() expanded = new EventEmitter<void>();

  protected readonly expandedItemIds = new Set<string>();
  protected activePath: NavigationItem[] = [];
  protected activeRoute = this.router.url;
  protected routerBreadcrumbs: RouterBreadcrumb[] = [];

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.activeRoute = event.urlAfterRedirects;
        this.syncActivePath();
        this.syncRouterBreadcrumbs();
      });

    this.syncRouterBreadcrumbs();
  }

  ngOnChanges(): void {
    this.syncActivePath();
  }

  protected get visibleSections(): NavigationSection[] {
    if (this.sections.length) {
      return this.sections;
    }

    return [{ label: 'Main', items: this.items }];
  }

  protected hasChildren(item: NavigationItem): boolean {
    return Boolean(item.children?.length);
  }

  protected isExpanded(item: NavigationItem): boolean {
    return this.expandedItemIds.has(item.id);
  }

  protected isActive(item: NavigationItem): boolean {
    return this.activePath.some((pathItem) => pathItem.id === item.id);
  }

  protected getRoute(item: NavigationItem): string | string[] | null {
    return item.route ?? null;
  }

  protected toggleItem(item: NavigationItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.expandedItemIds.has(item.id)) {
      this.expandedItemIds.delete(item.id);
      return;
    }

    this.expandedItemIds.add(item.id);
    this.activePath = this.findPathById(this.allItems, item.id) ?? this.activePath;
  }

  protected selectItem(item: NavigationItem): void {
    this.activePath = this.findPathById(this.allItems, item.id) ?? [item];
    this.expandPath(this.activePath);
    this.itemSelected.emit(item);
  }

  protected activateBreadcrumb(item: NavigationItem): void {
    const nextPath = this.findPathById(this.allItems, item.id);

    if (!nextPath) {
      return;
    }

    this.activePath = nextPath;
    this.expandPath(nextPath);

    if (item.route) {
      void this.router.navigate(Array.isArray(item.route) ? item.route : [item.route]);
    }
  }

  protected navigateBreadcrumb(route: string): void {
    void this.router.navigateByUrl(route);
  }

  protected collapseNavigation(): void {
    this.collapsed.emit();
  }

  protected expandNavigation(): void {
    this.expanded.emit();
  }

  protected iconPath(icon: NavigationIcon): string {
    const icons: Record<NavigationIcon, string> = {
      home: 'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3V10.5Z',
      dashboard: 'M4 4h7v7H4V4Zm9 0h7v4h-7V4ZM4 13h7v7H4v-7Zm9-3h7v10h-7V10Z',
      form: 'M6 3h9l3 3v15H6V3Zm8 0v4h4M8.5 11h7M8.5 15h7M8.5 19h4',
      records: 'M5 4h14v16H5V4Zm3 4h8M8 12h8M8 16h5',
      project: 'M4 7h7l2 2h7v10H4V7Z',
      schedule: 'M7 3v4M17 3v4M4 8h16M5 5h14v16H5V5Zm3 7h3v3H8v-3Z',
      product: 'M12 3 4 7v10l8 4 8-4V7l-8-4Zm0 8 8-4M12 11 4 7M12 11v10',
      users: 'M8 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm8-1a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM2 21a6 6 0 0 1 12 0M13 18a5 5 0 0 1 8 3',
      settings: 'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm8.5 4a7.8 7.8 0 0 0-.2-1.7l2-1.5-2-3.4-2.4 1a8 8 0 0 0-2.9-1.7L14.7 2h-5.4L9 4.7A8 8 0 0 0 6.1 6.4l-2.4-1-2 3.4 2 1.5a7.8 7.8 0 0 0 0 3.4l-2 1.5 2 3.4 2.4-1A8 8 0 0 0 9 19.3l.3 2.7h5.4l.3-2.7a8 8 0 0 0 2.9-1.7l2.4 1 2-3.4-2-1.5c.1-.5.2-1.1.2-1.7Z',
      shield: 'M12 3 5 6v6c0 4.4 2.8 7.6 7 9 4.2-1.4 7-4.6 7-9V6l-7-3Z'
    };

    return icons[icon];
  }

  protected iconFill(icon: NavigationIcon): string {
    return icon === 'home' || icon === 'dashboard' || icon === 'project' || icon === 'product'
      ? 'currentColor'
      : 'none';
  }

  private syncActivePath(): void {
    const matchedPath = this.findPathByRoute(this.allItems, this.activeRoute);

    if (matchedPath) {
      this.activePath = matchedPath;
      this.expandPath(matchedPath);
    }
  }

  private syncRouterBreadcrumbs(): void {
    const cleanRoute = this.activeRoute.split('?')[0].split('#')[0];
    const segments = cleanRoute.split('/').filter(Boolean);
    let route = '';

    this.routerBreadcrumbs = segments.map((segment) => {
      route += `/${segment}`;

      return {
        label: decodeURIComponent(segment),
        route
      };
    });
  }

  private expandPath(path: NavigationItem[]): void {
    path.slice(0, -1).forEach((item) => this.expandedItemIds.add(item.id));
  }

  private get allItems(): NavigationItem[] {
    return this.visibleSections.flatMap((section) => section.items);
  }

  private findPathById(items: NavigationItem[], id: string, parents: NavigationItem[] = []): NavigationItem[] | null {
    for (const item of items) {
      const nextPath = [...parents, item];

      if (item.id === id) {
        return nextPath;
      }

      const childPath = this.findPathById(item.children ?? [], id, nextPath);

      if (childPath) {
        return childPath;
      }
    }

    return null;
  }

  private findPathByRoute(items: NavigationItem[], route: string, parents: NavigationItem[] = []): NavigationItem[] | null {
    for (const item of items) {
      const nextPath = [...parents, item];

      if (this.routeMatches(item.route, route)) {
        return nextPath;
      }

      const childPath = this.findPathByRoute(item.children ?? [], route, nextPath);

      if (childPath) {
        return childPath;
      }
    }

    return null;
  }

  private routeMatches(candidate: string | string[] | undefined, activeRoute: string): boolean {
    if (!candidate) {
      return false;
    }

    const route = Array.isArray(candidate) ? `/${candidate.join('/')}` : candidate;
    const normalizedRoute = route === '/' ? '/' : route.replace(/\/$/, '');
    const normalizedActiveRoute = activeRoute === '/' ? '/' : activeRoute.split('?')[0].replace(/\/$/, '');

    return normalizedActiveRoute === normalizedRoute;
  }
}
