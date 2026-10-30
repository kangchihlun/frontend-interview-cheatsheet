import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor, loggingInterceptor, mockBackendInterceptor, retryInterceptor } from './pages/http/interceptors';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    // 函式型攔截器依陣列順序執行：auth → logging → retry → mockBackend（最後一個攔下 /api/* 回假資料）
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, loggingInterceptor, retryInterceptor, mockBackendInterceptor])),
  ],
};
