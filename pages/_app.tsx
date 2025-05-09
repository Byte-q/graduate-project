import React, { useEffect } from 'react';
import { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SiteSettingsProvider } from '@/contexts/site-settings-context';
import { MenusProvider } from '@/contexts/menus-context';
import '@/styles/globals.css';
import '@/styles/base.css';

// أدوات تشخيص خاصة بالتطبيق
import { safeObjectEntries, safeReduce } from '@/lib/utils';

// إنشاء كائن QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 دقائق
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // تصحيح Object.entries للتعامل مع القيم الفارغة
    const originalObjectEntries = Object.entries;
    Object.entries = function<T>(obj: T): [string, any][] {
      if (obj === null || obj === undefined) {
        console.error('ERROR: Cannot convert undefined or null to object with Object.entries');
        console.error(new Error().stack);
        return [];
      }
      return originalObjectEntries.call(this, obj);
    };

    // تصحيح Array.prototype.reduce للتعامل مع القيم الفارغة
    const originalArrayReduce = Array.prototype.reduce;
    // @ts-ignore: تجاهل تحذيرات TypeScript لأننا نقوم بتعديل الوظيفة الأصلية
    Array.prototype.reduce = function<T, U>(
      callback: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U,
      initialValue?: U
    ): U {
      if (this === null || this === undefined) {
        console.error('ERROR: Cannot convert undefined or null to object with Array.reduce');
        console.error(new Error().stack);
        if (initialValue !== undefined) {
          return initialValue;
        }
        throw new TypeError('Cannot convert undefined or null to object');
      }
      return originalArrayReduce.call(this, callback, initialValue);
    };

    console.log('تم تطبيق تصحيحات Object.entries و Array.reduce');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SiteSettingsProvider>
        <MenusProvider>
          <Component {...pageProps} />
        </MenusProvider>
      </SiteSettingsProvider>
    </QueryClientProvider>
  );
}