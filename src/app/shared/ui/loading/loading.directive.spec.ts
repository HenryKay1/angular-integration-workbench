import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LoadingDirective } from './loading.directive';
import { LoadingConfig } from './loading.models';

@Component({
  standalone: true,
  imports: [LoadingDirective],
  template: `
    <div class="host" appLoading [loading]="loading" [loadingConfig]="config">
      <button type="button">Action</button>
    </div>
  `
})
class LoadingHostComponent {
  loading = false;
  config: LoadingConfig = {};
}

describe('LoadingDirective', () => {
  let fixture: ComponentFixture<LoadingHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingHostComponent);
    fixture.detectChanges();
  });

  it('creates an overlay when loading is true', () => {
    fixture.componentInstance.loading = true;
    fixture.detectChanges();

    expect(getOverlay()).not.toBeNull();
    expect(getHost().classList.contains('aiw-loading-host')).toBeTrue();
  });

  it('removes the overlay when loading is false', () => {
    fixture.componentInstance.loading = true;
    fixture.detectChanges();
    fixture.componentInstance.loading = false;
    fixture.detectChanges();

    expect(getOverlay()).toBeNull();
    expect(getHost().classList.contains('aiw-loading-host')).toBeFalse();
  });

  it('uses the spinner by default', () => {
    fixture.componentInstance.loading = true;
    fixture.detectChanges();

    expect(getHost().querySelector('mat-progress-spinner')).not.toBeNull();
  });

  it('uses the logo loader when configured', () => {
    fixture.componentInstance.loading = true;
    fixture.componentInstance.config = {
      indicator: 'logo',
      logoSrc: 'assets/images/logo.png'
    };
    fixture.detectChanges();

    const logo = getHost().querySelector<HTMLImageElement>('.loading-overlay__logo');
    expect(logo).not.toBeNull();
    expect(logo?.getAttribute('src')).toBe('assets/images/logo.png');
    expect(logo?.classList.contains('loading-overlay__logo--spin-3d')).toBeTrue();
  });

  it('can use the flat logo spin when configured', () => {
    fixture.componentInstance.loading = true;
    fixture.componentInstance.config = {
      indicator: 'logo',
      logoAnimation: 'spin2d'
    };
    fixture.detectChanges();

    const logo = getHost().querySelector<HTMLImageElement>('.loading-overlay__logo');
    expect(logo?.classList.contains('loading-overlay__logo--spin-2d')).toBeTrue();
    expect(logo?.classList.contains('loading-overlay__logo--spin-3d')).toBeFalse();
  });

  it('displays an optional loading message', () => {
    fixture.componentInstance.loading = true;
    fixture.componentInstance.config = {
      message: 'Loading companies...'
    };
    fixture.detectChanges();

    expect(getHost().textContent).toContain('Loading companies...');
  });

  it('applies interaction blocking by default and allows passthrough when disabled', () => {
    fixture.componentInstance.loading = true;
    fixture.detectChanges();

    expect(getOverlay()?.classList.contains('loading-overlay--passthrough')).toBeFalse();

    fixture.componentInstance.config = {
      blockInteraction: false
    };
    fixture.detectChanges();

    expect(getOverlay()?.classList.contains('loading-overlay--passthrough')).toBeTrue();
  });

  function getHost(): HTMLElement {
    return fixture.debugElement.query(By.css('.host')).nativeElement as HTMLElement;
  }

  function getOverlay(): HTMLElement | null {
    return getHost().querySelector('.loading-overlay');
  }
});
