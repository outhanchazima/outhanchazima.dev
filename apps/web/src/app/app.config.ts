import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    // Transfer server-fetched GET responses to the client so live data
    // (GitHub, Medium) renders during SSR and isn't re-fetched on hydration.
    provideClientHydration(withHttpTransferCacheOptions({ includePostRequests: false })),
  ],
};
