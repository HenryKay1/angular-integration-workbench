import { HttpInterceptorFn } from '@angular/common/http';

const MOCK_AUTHORIZATION = 'Bearer mock-auth-token';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authenticatedRequest = request.clone({
    setHeaders: {
      Authorization: MOCK_AUTHORIZATION
    }
  });

  return next(authenticatedRequest);
};
