import { ReactNode } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from './Header';
import Footer from './Footer';
import { useSiteSettings } from '../../contexts/site-settings-context';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  hideFooter?: boolean;
}

export default function MainLayout({
  children,
  title,
  description,
  hideFooter = false
}: MainLayoutProps) {
  const router = useRouter();
  const { siteSettings } = useSiteSettings();
  
  // تنسيق العنوان
  const formattedTitle = title 
    ? `${title} | ${siteSettings?.siteName || 'FULLSCO'}`
    : siteSettings?.siteName || 'FULLSCO';
  
  // تنسيق الوصف
  const formattedDescription = description || siteSettings?.siteDescription || 'منصة المنح الدراسية والفرص التعليمية';
  
  // استخدام RTL دائمًا للمحتوى العربي
  const isRtl = true; // موقعنا عربي بالكامل
  
  return (
    <div dir="rtl" className="font-tajawal">
      <Head>
        <title>{formattedTitle}</title>
        <meta name="description" content={formattedDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={siteSettings?.faviconUrl || '/favicon.ico'} />
        <meta property="og:title" content={formattedTitle} />
        <meta property="og:description" content={formattedDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL || ''}${router.asPath}`} />
        <meta property="og:locale" content={isRtl ? 'ar_SA' : 'en_US'} />
        {siteSettings?.logoUrl && (
          <meta property="og:image" content={siteSettings.logoUrl} />
        )}
      </Head>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          {children}
        </main>
        
        {!hideFooter && <Footer />}
      </div>
    </div>
  );
}