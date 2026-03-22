import { CanActivateFn } from '@angular/router';

const isAuthenticated = (): boolean => true;

export const authGuard: CanActivateFn = () => isAuthenticated();
