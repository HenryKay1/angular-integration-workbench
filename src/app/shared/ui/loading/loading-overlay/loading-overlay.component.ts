import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DEFAULT_LOADING_CONFIG, LoadingConfig } from '../loading.models';

@Component({
  selector: 'aiw-loading-overlay',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './loading-overlay.component.html',
  styleUrl: './loading-overlay.component.css'
})
export class LoadingOverlayComponent {
  @Input() config: LoadingConfig = {};

  protected get resolvedConfig(): Required<Omit<LoadingConfig, 'message'>> & Pick<LoadingConfig, 'message'> {
    return {
      ...DEFAULT_LOADING_CONFIG,
      ...this.config,
      opacity: this.clampOpacity(this.config.opacity ?? DEFAULT_LOADING_CONFIG.opacity)
    };
  }

  private clampOpacity(opacity: number): number {
    if (!Number.isFinite(opacity)) {
      return DEFAULT_LOADING_CONFIG.opacity;
    }

    return Math.min(1, Math.max(0, opacity));
  }
}
