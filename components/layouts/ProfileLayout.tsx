import { ReactNode, useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSiteSettings } from '../../contexts/site-settings-context';
import Link from 'next/link';
import { User, Settings, Globe, GraduationCap } from 'lucide-react';

interface ProfileLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function ProfileLayout({
  children,
  title,
  description,
}: ProfileLayoutProps) {
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

  const linksData = [
    { href: '/profile/', label: 'لوحة التحكم', icon: <User className="inline mr-2" /> },
    { href: '/profile/scholarships', label: 'المنح الدراسية', icon: <GraduationCap className="inline mr-2" /> },
    { href: '/profile/countries', label: 'الدول', icon: <Globe className="inline mr-2" /> },
    { href: '/profile/universities', label: 'الجامعات', icon: <GraduationCap className="inline mr-2" /> },
]

    const [user, setUser] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // التحقق من حالة تسجيل الدخول
    const checkLoginStatus = async () => {
      try {
        // const response = await fetch(`http://localhost:3500/server/api/auth/me`);
        const user = JSON.parse(sessionStorage.getItem('user') || 'null');
        if (user) {
          // const data = await response.json();
          setUser(user);
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUser(null);
        setIsLoggedIn(false);
      }
    }
    checkLoginStatus();
}, []);

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

        <main className="flex flex-1">

            <div className="container mx-auto px-4 py-6">
            {children}
            </div>

            <nav className="shadow-lg w-[50%] md:w-[30%] lg:w-[20%] flex flex-col items-center p-4">
                <div className="text-lg font-bold mb-4">
                    لوحة التحكم
                    </div>
                <div className="mb-4 mt-3 flex flex-col items-center">

                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                    {user?.fullName?.charAt(0) || 'U'}
                    </div>
                      <div className="font-bold text-gray-900 dark:text-white">{user?.fullName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</div>

                </div>

                <div className='w-full flex flex-col'>
                    {isLoggedIn ? linksData.map((link, index) => (
                        <Link key={index} href={link.href} title={link.label} className="hover:bg-gray-100 mb-2 border-b border-gray-200 pb-2">
                            {link.icon}
                            {link.label}
                        </Link>)) : (
                        <Link href="/login" title="تسجيل الدخول" className="hover:bg-gray-100 mb-2 border-b border-gray-200 pb-2">
                            تسجيل الدخول
                        </Link>
                        )}
                </div>
            </nav>
        
        </main>
        
      </div>
    </div>
  );
}