import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';


import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { loadingInterceptor } from './interceptors/loading.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';

import { MAT_DATE_LOCALE } from '@angular/material/core';
import { DEFAULT_CURRENCY_CODE } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, loadingInterceptor, errorInterceptor])),
    provideAnimations(),
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, // Force dd/MM/yyyy
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'INR' } // Force Rupees
  ]
};
