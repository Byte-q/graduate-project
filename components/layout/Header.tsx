import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X, ChevronDown, Sun, Moon, Search, User, LogIn, Bookmark, Bell, BookOpen, Home, Award, FileText, School, MessageSquare, ExternalLink } from 'lucide-react';
import { useSiteSettings } from '../../contexts/site-settings-context';
import { useMenus } from '../../contexts/menus-context';
import { useMobile } from '../../hooks/use-mobile';

// تخزين الأيقونات المناسبة لكل نوع من أنواع القوائم
const menuTypeIcons: Record<string, any> = {
  link: ExternalLink,
  page: FileText,
  category: Home,
  level: Award,
  country: Award,
  scholarship: Award,
  post: FileText,
  default: ChevronDown
};

export default function Header() {
  const { siteSettings } = useSiteSettings();
  const { headerMenu, isLoading: isMenuLoading } = useMenus();
  const router = useRouter();
  const isMobile = useMobile();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // التحقق من وضع العرض (فاتح/داكن) عند تحميل الصفحة
  useEffect(() => {
    // التحقق من التفضيل المخزن محلياً
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
    
    // إضافة مستمع لحدث التمرير
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // التحقق من حالة تسجيل الدخول
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
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
    };
    
    checkLoginStatus();
    
    // إزالة المستمع عند تفكيك المكون
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // تبديل وضع العرض (فاتح/داكن)
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  // إغلاق القائمة المتنقلة عند تغيير المسار
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsUserMenuOpen(false);
  }, [router.pathname]);
  
  // معالجة البحث
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/scholarships?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };
  
  // معالجة تسجيل الخروج
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setUser(null);
        setIsLoggedIn(false);
        router.push('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // القائمة الافتراضية في حالة عدم وجود بيانات من قاعدة البيانات
  const defaultMenuItems = [
    { id: 1, title: 'الرئيسية', type: 'link', url: '/', icon: Home, children: [] },
    { id: 2, title: 'المنح الدراسية', type: 'link', url: '/scholarships', icon: Award, children: [] },
    { 
      id: 3,
      title: 'التصنيفات', 
      type: 'link',
      url: '#',
      icon: ChevronDown,
      children: [
        { id: 31, title: 'حسب التخصص', type: 'link', url: '/categories', icon: Home, children: [] },
        { id: 32, title: 'حسب الدولة', type: 'link', url: '/countries', icon: Home, children: [] },
        { id: 33, title: 'حسب المستوى', type: 'link', url: '/levels', icon: Home, children: [] },
      ]
    },
    { id: 4, title: 'المقالات', type: 'link', url: '/posts', icon: FileText, children: [] },
    { id: 5, title: 'قصص النجاح', type: 'link', url: '/success-stories', icon: School, children: [] },
    { id: 6, title: 'اتصل بنا', type: 'link', url: '/contact', icon: MessageSquare, children: [] },
  ];
  
  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-sm dark:bg-gray-900/95 shadow-md'
          : 'bg-white dark:bg-gray-900 shadow-md'
      }`}
    >
      <div className="container mx-auto">
        <div className="flex h-20 items-center justify-between">
          {/* الشعار */}
          <Link href="/" className="flex items-center">
            {siteSettings?.logoUrl ? (
              <img 
                src={siteSettings.logoUrl} 
                alt={siteSettings.siteName || 'الموقع'} 
                className="h-12 w-auto"
              />
            ) : (
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-3 py-2 rounded-lg shadow-sm">
                <span className="text-xl font-bold">
                  {siteSettings?.siteName || 'FULLSCO'}
                </span>
              </div>
            )}
          </Link>
          
          {/* القائمة الرئيسية - سطح المكتب */}
          <nav className="hidden lg:flex items-center space-x-1 rtl:space-x-reverse">
            {headerMenu.map((item, index) => (
              item.children && item.children.length > 0 ? (
                <div key={index} className="relative group">
                  <button className="flex items-center px-4 py-2 text-base font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200">
                    {item.title}
                    <ChevronDown className="mr-1 h-4 w-4 opacity-70" />
                  </button>
                  <div className="absolute right-0 mt-1 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-50">
                    <div className="py-2 px-1">
                      {item.children.map((child: any, childIndex: number) => {
                        const href = child.type === 'link' ? child.url : `/${child.type}s/${child.slug || ''}`;
                        const IconComponent = menuTypeIcons[child.type] || menuTypeIcons.default;
                        
                        return (
                          <Link 
                            key={childIndex} 
                            href={href}
                            className="block px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 rounded-md mx-1 text-gray-700 dark:text-gray-200"
                          >
                            {child.title}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <Link 
                  key={index} 
                  href={item.type === 'link' ? (item.url || '/') : `/${item.type}s/${item.slug || ''}`}
                  className={`px-4 py-2 text-base font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1.5 ${
                    (item.type === 'link' && router.pathname === item.url) || 
                    (item.type === 'link' && item.url && item.url !== '/' && router.pathname.startsWith(item.url))
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-semibold' 
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {(() => {
                    const IconComponent = menuTypeIcons[item.type] || menuTypeIcons.default;
                    return <IconComponent className="h-4 w-4 opacity-70" />;
                  })()}
                  {item.title}
                </Link>
              )
            ))}
          </nav>
          
          {/* أزرار الإجراءات */}
          <div className="flex items-center gap-2">
            {/* زر البحث */}
            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="بحث"
            >
              <Search className="h-5 w-5" />
            </button>
            
            {/* زر تبديل الثيم */}
            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'تفعيل الوضع الداكن' : 'تفعيل الوضع الفاتح'}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>
            
            {/* قسم المستخدم */}
            {isLoggedIn ? (
              <div className="relative">
                <button 
                  className="ml-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center text-white font-semibold">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute left-0 mt-2 w-64 origin-top-left rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
                    <div className="py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                      <div className="font-bold text-lg">{user?.fullName}</div>
                      <div className="text-sm text-blue-100 truncate">{user?.email}</div>
                    </div>
                    <div className="py-2">
                      <Link 
                        href="/dashboard"
                        className="flex items-center px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 ml-2 text-gray-500 dark:text-gray-400" />
                        <span>الملف الشخصي</span>
                      </Link>
                      <Link 
                        href="/dashboard/saved-scholarships"
                        className="flex items-center px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Bookmark className="w-4 h-4 ml-2 text-gray-500 dark:text-gray-400" />
                        <span>المنح المحفوظة</span>
                      </Link>
                      <Link 
                        href="/dashboard/notifications"
                        className="flex items-center px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Bell className="w-4 h-4 ml-2 text-gray-500 dark:text-gray-400" />
                        <span>الإشعارات</span>
                      </Link>
                      {user?.role === 'admin' && (
                        <Link 
                          href="/admin"
                          className="flex items-center px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-t border-gray-100 dark:border-gray-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <BookOpen className="w-4 h-4 ml-2 text-gray-500 dark:text-gray-400" />
                          <span>لوحة الإدارة</span>
                        </Link>
                      )}
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                      <button 
                        className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={handleLogout}
                      >
                        <LogIn className="w-4 h-4 ml-2 transform rotate-180" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden md:flex items-center gap-2 py-2 px-4 font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-lg transition-all shadow-sm hover:shadow"
              >
                <LogIn className="h-4 w-4" />
                <span>تسجيل الدخول</span>
              </Link>
            )}
            
            {/* زر القائمة المتنقلة */}
            <button 
              className="lg:hidden ml-2 p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* نموذج البحث */}
      {isSearchOpen && (
        <div className="absolute top-20 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg p-4 animate-fade-in border-b border-gray-200 dark:border-gray-700 z-50">
          <div className="container mx-auto">
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                type="search"
                placeholder="ابحث عن منح دراسية..."
                className="flex-1 px-4 py-2.5 text-base bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-r-lg hover:from-blue-700 hover:to-blue-600 transition-all"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* القائمة المتنقلة */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg animate-slide-in-top z-50 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto">
            <nav className="flex flex-col">
              {!isLoggedIn && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <Link
                    href="/auth/login"
                    className="flex items-center justify-center gap-2 py-2.5 px-4 w-full font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-lg transition-all shadow-sm hover:shadow"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogIn className="h-5 w-5" />
                    <span>تسجيل الدخول</span>
                  </Link>
                </div>
              )}
              
              <div className="py-2">
                {headerMenu.map((item: any, index: number) => (
                  item.children && item.children.length > 0 ? (
                    <div key={index} className="py-2 px-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                        {(() => {
                          const IconComponent = menuTypeIcons[item.type] || menuTypeIcons.default;
                          return <IconComponent className="h-5 w-5 text-blue-500" />;
                        })()}
                        {item.title}
                      </div>
                      <div className="pr-8 space-y-1">
                        {item.children.map((child: any, childIndex: number) => {
                          const href = child.type === 'link' ? child.url : `/${child.type}s/${child.slug || ''}`;
                          return (
                            <Link 
                              key={childIndex} 
                              href={href}
                              className="block py-1.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {child.title}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <Link 
                      key={index} 
                      href={item.type === 'link' ? (item.url || '/') : `/${item.type}s/${item.slug || ''}`}
                      className={`py-3 px-4 flex items-center gap-1.5 border-b border-gray-200 dark:border-gray-700 ${
                        (item.type === 'link' && router.pathname === item.url) || 
                        (item.type === 'link' && item.url && item.url !== '/' && router.pathname.startsWith(item.url))
                          ? 'font-semibold text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-white'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {(() => {
                        const IconComponent = menuTypeIcons[item.type] || menuTypeIcons.default;
                        return <IconComponent className="h-5 w-5 text-blue-500" />;
                      })()}
                      {item.title}
                    </Link>
                  )
                ))}
              </div>
              
              {isLoggedIn && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{user?.fullName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Link
                      href="/dashboard"
                      className="block py-2 px-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>الملف الشخصي</span>
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="block py-2 px-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>لوحة الإدارة</span>
                      </Link>
                    )}
                    <button
                      className="w-full text-left py-2 px-3 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogIn className="h-4 w-4 transform rotate-180" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}