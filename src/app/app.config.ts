import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

/**
 * App Configuration — registers providers for the entire application
 *
 * provideHttpClient() = enables HttpClient injection
 * provideRouter()     = enables client-side routing
 * provideZoneChangeDetection() = Angular's event coalescing change detection optimization
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient()
  ]
};
