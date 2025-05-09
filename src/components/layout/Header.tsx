import React, { useState } from 'react';
import Link from 'next/link';
import { useSiteSettings } from '@/contexts/site-settings-context';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, Search, X } from 'lucide-react';

// قائمة الروابط الرئيسية
const mainLinks = [
  { title: 'الرئيسية', href: '/' },
  { title: 'المنح الدراسية', href: '/scholarships' },
  { title: 'الدول', href: '/countries' },
  { title: 'التخصصات', href: '/categories' },
  { title: 'المقالات', href: '/blog' },
  { title: 'عن المنصة', href: '/about' },
];

export default function Header() {
  const { siteSettings } = useSiteSettings();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // تحديد اتجاه الصفحة (RTL للعربية)
  const isRTL = siteSettings?.theme?.rtlDirection !== false;
  
  // التعامل مع البحث
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* الشعار */}
        <div className="flex items-center gap-2">
          <Link 
            href="/" 
            className="flex items-center space-x-2 rtl:space-x-reverse font-tajawal"
          >
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
        </div>

        {/* القائمة الرئيسية - تظهر فقط على الشاشات الكبيرة */}
        <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
          {mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.title}
            </Link>
          ))}
        </nav>

        {/* أزرار الإجراءات */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {/* زر البحث */}
          <Button variant="ghost" size="icon" onClick={toggleSearch} aria-label="بحث">
            {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>

          {/* زر القائمة المتنقلة - يظهر فقط على الشاشات الصغيرة */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="القائمة">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? "right" : "left"} className="font-tajawal">
              <div className="grid gap-4 py-4">
                <Link
                  href="/"
                  className="text-lg font-semibold hover:text-primary transition-colors"
                >
                  الرئيسية
                </Link>
                {mainLinks.map((link, index) => (
                  link.href !== '/' && (
                    <Link
                      key={index}
                      href={link.href}
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      {link.title}
                    </Link>
                  )
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* شريط البحث */}
      {isSearchOpen && (
        <div className="border-t border-border py-3 px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground rtl:left-auto rtl:right-3" />
              <input
                type="search"
                placeholder="ابحث عن منح دراسية، مقالات، دول..."
                className="w-full rounded-md border border-input px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                autoFocus
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}