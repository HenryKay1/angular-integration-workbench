export type LoadingIndicatorType = 'spinner' | 'logo';
export type LoadingLogoAnimationType = 'spin2d' | 'spin3d';

export interface LoadingConfig {
  indicator?: LoadingIndicatorType;
  logoAnimation?: LoadingLogoAnimationType;
  message?: string;
  blockInteraction?: boolean;
  opacity?: number;
  logoSrc?: string;
}

export const DEFAULT_LOADING_CONFIG: Required<Omit<LoadingConfig, 'message'>> = {
  indicator: 'spinner',
  logoAnimation: 'spin3d',
  blockInteraction: true,
  opacity: 0.62,
  logoSrc: 'assets/images/logo.png'
};
