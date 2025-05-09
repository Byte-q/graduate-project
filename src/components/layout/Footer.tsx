import React from 'react';
import Link from 'next/link';
import { useSiteSettings } from '@/contexts/site-settings-context';
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';

export default function Footer() {
  const { siteSettings } = useSiteSettings();

  // الأقسام الرئيسية للفوتر
  const sections = [
    {
      title: 'روابط سريعة',
      links: [
        { title: 'الرئيسية', href: '/' },
        { title: 'المنح الدراسية', href: '/scholarships' },
        { title: 'الدول', href: '/countries' },
        { title: 'التخصصات', href: '/categories' },
        { title: 'قصص النجاح', href: '/success-stories' },
      ],
    },
    {
      title: 'المزيد',
      links: [
        { title: 'من نحن', href: '/about' },
        { title: 'سياسة الخصوصية', href: '/privacy' },
        { title: 'شروط الاستخدام', href: '/terms' },
        { title: 'اتصل بنا', href: '/contact' },
        { title: 'الأسئلة الشائعة', href: '/faq' },
      ],
    },
  ];

  // وسائل التواصل الاجتماعي
  const socialLinks = [
    { name: 'فيسبوك', icon: <Facebook className="h-5 w-5" />, href: siteSettings?.socialMedia?.facebook || '#' },
    { name: 'تويتر', icon: <Twitter className="h-5 w-5" />, href: siteSettings?.socialMedia?.twitter || '#' },
    { name: 'انستغرام', icon: <Instagram className="h-5 w-5" />, href: siteSettings?.socialMedia?.instagram || '#' },
    { name: 'لينكد إن', icon: <Linkedin className="h-5 w-5" />, href: siteSettings?.socialMedia?.linkedin || '#' },
    { name: 'يوتيوب', icon: <Youtube className="h-5 w-5" />, href: siteSettings?.socialMedia?.youtube || '#' },
  ];

  return (
    <footer className="bg-muted/40 border-t">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* معلومات الموقع */}
          <div>
            <Link href="/" className="inline-block mb-4">
              {siteSettings?.logoUrl ? (
                <img 
                  src={siteSettings.logoUrl} 
                  alt={siteSettings.siteName} 
                  className="h-8 w-auto"
                />
              ) : (
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {siteSettings?.siteName || 'FULLSCO'}
                </span>
              )}
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              {siteSettings?.siteDescription || 'منصة المنح الدراسية للطلاب العرب'}
            </p>
            
            {/* معلومات الاتصال */}
            {siteSettings?.siteEmail && (
              <div className="text-sm text-muted-foreground mb-2">
                البريد الإلكتروني: {siteSettings.siteEmail}
              </div>
            )}
            {siteSettings?.sitePhone && (
              <div className="text-sm text-muted-foreground mb-2">
                الهاتف: {siteSettings.sitePhone}
              </div>
            )}
            {siteSettings?.siteAddress && (
              <div className="text-sm text-muted-foreground mb-4">
                العنوان: {siteSettings.siteAddress}
              </div>
            )}
            
            {/* وسائل التواصل الاجتماعي */}
            <div className="flex space-x-4 rtl:space-x-reverse">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={link.name}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
          
          {/* أقسام الفوتر */}
          {sections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-foreground mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          {/* النشرة البريدية */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">النشرة البريدية</h3>
            <p className="text-sm text-muted-foreground mb-4">
              اشترك في النشرة البريدية ليصلك كل جديد عن المنح الدراسية
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                required
                className="flex-1 rounded-s-md border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button
                type="submit"
                className="rounded-e-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                اشتراك
              </button>
            </form>
          </div>
        </div>
        
        {/* حقوق النشر */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          {siteSettings?.footerText || `© ${new Date().getFullYear()} ${siteSettings?.siteName || 'FULLSCO'}. جميع الحقوق محفوظة.`}
        </div>
      </div>
    </footer>
  );
}