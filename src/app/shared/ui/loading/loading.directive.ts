import {
  ApplicationRef,
  ComponentRef,
  Directive,
  ElementRef,
  EnvironmentInjector,
  Input,
  OnChanges,
  OnDestroy,
  Renderer2,
  SimpleChanges,
  createComponent,
  inject
} from '@angular/core';
import { LoadingOverlayComponent } from './loading-overlay/loading-overlay.component';
import { LoadingConfig } from './loading.models';

@Directive({
  selector: '[appLoading]',
  standalone: true
})
export class LoadingDirective implements OnChanges, OnDestroy {
  @Input() loading = false;
  @Input() loadingConfig: LoadingConfig = {};

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private overlayRef?: ComponentRef<LoadingOverlayComponent>;
  private previousPosition: string | null = null;
  private positionWasAdjusted = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['loading'] || changes['loadingConfig']) {
      this.syncOverlay();
    }
  }

  ngOnDestroy(): void {
    this.removeOverlay();
  }

  private syncOverlay(): void {
    if (this.loading) {
      this.ensureOverlay();
      this.overlayRef?.setInput('config', this.loadingConfig);
      return;
    }

    this.removeOverlay();
  }

  private ensureOverlay(): void {
    if (this.overlayRef) {
      return;
    }

    this.ensureHostCanContainOverlay();
    this.renderer.addClass(this.elementRef.nativeElement, 'aiw-loading-host');
    this.overlayRef = createComponent(LoadingOverlayComponent, {
      environmentInjector: this.environmentInjector
    });
    this.appRef.attachView(this.overlayRef.hostView);
    this.renderer.appendChild(
      this.elementRef.nativeElement,
      this.overlayRef.location.nativeElement
    );
  }

  private removeOverlay(): void {
    if (!this.overlayRef) {
      return;
    }

    this.appRef.detachView(this.overlayRef.hostView);
    this.overlayRef.destroy();
    this.overlayRef = undefined;
    this.renderer.removeClass(this.elementRef.nativeElement, 'aiw-loading-host');
    this.restoreHostPosition();
  }

  private ensureHostCanContainOverlay(): void {
    const host = this.elementRef.nativeElement;
    const computedPosition = getComputedStyle(host).position;

    this.previousPosition = host.style.position || null;

    if (computedPosition === 'static') {
      this.positionWasAdjusted = true;
      this.renderer.setStyle(host, 'position', 'relative');
    }
  }

  private restoreHostPosition(): void {
    if (!this.positionWasAdjusted) {
      return;
    }

    if (this.previousPosition) {
      this.renderer.setStyle(this.elementRef.nativeElement, 'position', this.previousPosition);
    } else {
      this.renderer.removeStyle(this.elementRef.nativeElement, 'position');
    }

    this.positionWasAdjusted = false;
    this.previousPosition = null;
  }
}
