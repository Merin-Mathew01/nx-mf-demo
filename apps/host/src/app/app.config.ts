import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {provideAnimations}from '@angular/platform-browser/animations';
import { authInterceptor } from '@nx-demo/shared/data-access';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(appRoutes),provideHttpClient(withInterceptors([authInterceptor])),provideAnimations()],
};
