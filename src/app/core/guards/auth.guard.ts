import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth-service';
import { map, take } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const authGuard = (): Observable<boolean> => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return of(authService.isAuthenticated()).pipe(
    take(1),
    map(authenticated => {
      if (authenticated) {
        return true;
      }
      
      router.navigate(['/']);
      return false;
    })
  );
};