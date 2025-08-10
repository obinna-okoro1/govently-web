import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withPreloading } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // <-- Modern alternative to HttpClientModule
import { PreloadAllModules } from '@angular/router'; // <-- For route preloading
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules) // <-- Optional: Preload lazy routes in background
    ),
    provideHttpClient(), // <-- Replacement for HttpClientModule (modern standalone approach)
  ]
};