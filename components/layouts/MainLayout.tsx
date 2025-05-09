import React, { ReactNode } from 'react';
import Head from 'next/head';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  className?: string;
  withContainer?: boolean;
}

export default function MainLayout({
  children,
  title,
  description,
  keywords,
  ogImage,
  className,
  withContainer = true
}: MainLayoutProps) {
  // في المرحلة النهائية، سنستخدم useSiteSettings بدلاً من القيم الثابتة
  const siteName = 'منصة المنح الدراسية';
  const siteDescription = 'منصة المنح الدراسية - تقدم أفضل المنح الدراسية في العالم';
  const siteOgImage = '/logo.svg';
  const rtlDirection = true;
  
  const siteTitle = title 
    ? `${title} | ${siteName}`
    : siteName;
  
  const metaDescription = description || siteDescription;
  const metaOgImage = ogImage || siteOgImage;
  
  return (
    <>
      <Head>
        <title>{siteTitle}</title>
        <meta name="description" content={metaDescription} />
        {keywords && <meta name="keywords" content={keywords} />}
        
        {/* OpenGraph Tags */}
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={metaOgImage} />
        <meta property="og:type" content="website" />
        
        {/* Twitter Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={metaOgImage} />
      </Head>
      
      <div className={cn("min-h-screen flex flex-col", rtlDirection ? 'rtl' : 'ltr')}>
        {/* Header would be added here */}
        
        <main className={cn("flex-grow pb-16", className)}>
          {withContainer ? (
            <div className="container mx-auto px-4">
              {children}
            </div>
          ) : (
            children
          )}
        </main>
        
        {/* Footer would be added here */}
      </div>
    </>
  );
}