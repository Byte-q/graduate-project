import React, { ReactNode } from 'react';
import { Inter, Tajawal } from 'next/font/google';
import { useSiteSettings } from '@/contexts/site-settings-context';
import Header from './Header';
import Footer from './Footer';
import Head from 'next/head';

// تحميل الخطوط
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-tajawal',
});

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function MainLayout({
  children,
  title,
  description,
}: MainLayoutProps) {
  const { siteSettings, isLoading } = useSiteSettings();

  // استخدام قيم من إعدادات الموقع إذا كانت متاحة
  const pageTitle = title 
    ? `${title} | ${siteSettings?.siteName || 'FULLSCO'}`
    : siteSettings?.siteName || 'FULLSCO - منصة المنح الدراسية';
    
  const pageDescription = description || siteSettings?.siteDescription || 'منصة المنح الدراسية للطلاب العرب';
  
  // تحديد اتجاه الصفحة (RTL للعربية)
  const isRTL = siteSettings?.theme?.rtlDirection !== false;
  
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={siteSettings?.faviconUrl || '/favicon.ico'} />
        
        {/* Open Graph / Social Media Meta Tags */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={siteSettings?.siteName || 'FULLSCO'} />
      </Head>
      
      <div
        className={`flex min-h-screen flex-col ${inter.variable} ${tajawal.variable}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <Header />
        
        <main className="flex-grow">
          {!isLoading && children}
        </main>
        
        <Footer />
      </div>
    </>
  );
}