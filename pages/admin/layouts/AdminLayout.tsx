import { ReactNode, useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Home,
  FileText,
  Book,
  Award,
  Users,
  Settings,
  Layers,
  Flag,
  Grid,
  BarChart2,
  ChevronDown,
  MessageSquare,
  Globe,
  Menu,
  X,
  LogOut,
  User,
  Moon,
  Sun,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export default function AdminLayout({ children, title, description = 'لوحة تحكم المسؤول' }: AdminLayoutProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('المسؤول');
  const [userRole, setUserRole] = useState('مدير النظام');

  // التحقق من حالة تسجيل الدخول وصلاحيات المسؤول
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const response = await fetch('/api/auth/user');
        
        if (response.status === 401) {
          // إعادة التوجيه إلى صفحة تسجيل الدخول
          router.push('/auth/login');
          return;
        }

        const data = await response.json();
        
        // التحقق من صلاحيات المسؤول
        if (data?.user?.role !== 'admin') {
          // إعادة التوجيه إلى الصفحة الرئيسية إذا لم يكن المستخدم مسؤول
          router.push('/');
          return;
        }

        // تعيين اسم المستخدم ودوره
        if (data?.user) {
          setUserName(data.user.fullName || 'المسؤول');
          setUserRole(data.user.role === 'admin' ? 'مدير النظام' : 'مستخدم');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    // التحقق من الوضع المظلم
    if (typeof window !== 'undefined') {
      setIsDarkMode(localStorage.getItem('adminDarkMode') === 'true');
      // تطبيق الوضع المظلم على الصفحة
      if (localStorage.getItem('adminDarkMode') === 'true') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    checkAdminAuth();
  }, [router]);

  // تبديل الوضع المظلم
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminDarkMode', newDarkMode.toString());
      
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  // التحقق مما إذا كان المسار الحالي يطابق الرابط
  const isLinkActive = (path: string) => {
    if (path === '/admin' && router.pathname === '/admin') {
      return true;
    }
    return router.pathname.startsWith(path) && path !== '/admin';
  };

  // تسجيل الخروج
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>{`${title} | لوحة التحكم`}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      {/* الهيدر */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/admin" className="flex items-center gap-2 font-bold text-xl text-primary">
              <Award size={24} />
              <span className="hidden sm:inline">لوحة تحكم FULLSCO</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={isDarkMode ? 'تفعيل الوضع المضيء' : 'تفعيل الوضع المظلم'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <Link href="/" className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Globe size={20} />
            </Link>
            
            <div className="relative group">
              <button className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light">
                <User size={20} />
                <span className="hidden sm:inline">{userName}</span>
                <ChevronDown size={16} />
              </button>
              
              <div className="absolute left-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 hidden group-hover:block z-10">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{userName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{userRole}</div>
                </div>
                <Link 
                  href="/admin/profile"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  الملف الشخصي
                </Link>
                <Link 
                  href="/admin/settings"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  الإعدادات
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-right block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* الشريط الجانبي */}
        <aside
          className={`${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
          } fixed md:static top-16 left-0 h-full w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-md md:shadow-none transition-transform duration-300 md:translate-x-0 z-20`}
        >
          <nav className="p-4 space-y-1">
            <div className="mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              <Link 
                href="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${isLinkActive('/admin') && !isLinkActive('/admin/') ? 'bg-primary bg-opacity-10 text-primary dark:text-primary-light' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Home size={18} />
                <span>لوحة القيادة</span>
              </Link>
            </div>

            <div className="mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="px-4 mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                إدارة المحتوى
              </h3>
              
              <Link 
                href="/admin/scholarships"
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${isLinkActive('/admin/scholarships') ? 'bg-primary bg-opacity-10 text-primary dark:text-primary-light' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Award size={18} />
                <span>المنح الدراسية</span>
              </Link>
              
              <Link 
                href="/admin/posts"
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${isLinkActive('/admin/posts') ? 'bg-primary bg-opacity-10 text-primary dark:text-primary-light' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <FileText size={18} />
                <span>المقالات والأخبار</span>
              </Link>
              
              <Link 
                href="/admin/success-stories"
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${isLinkActive('/admin/success-stories') ? 'bg-primary bg-opacity-10 text-primary dark:text-primary-light' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Book size={18} />
                <span>قصص النجاح</span>
              </Link>
              
              <Link 
                href="/admin/pages"
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${isLinkActive('/admin/pages') ? 'bg-primary bg-opacity-10 text-primary dark:text-primary-light' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Layers size={18} />
                <span>الصفحات الثابتة</span>
              </Link>
              
              <Link 
                href="/admin/media"
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${isLinkActive('/admin/media') ? 'bg-primary bg-opacity-10 text-primary dark:text-primary-light' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Grid size={18} />
                <span>الوسائط المتعددة</span>
              </Link>
            </div>

            <div className="mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="px-4 mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                إدارة التصنيفات
              </h3>
              
              <Link 
                href="/admin/categories"
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${isLinkActive('/admin/categories') ? 'bg-primary bg-opacity-10 text-primary dark:text-primary-light' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Layers size={18} />
                <span>الفئات</span>
              </Link>
              
              <Link 
                href="/admin/levels"
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${isLinkActive('/admin/levels') ? 'bg-primary bg-opacity-10 text-primary dark:text-primary-light' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Award size={18} />
                <span>المستويات الدراسية</span>
              </Link>
              
              <Link 
                href="/admin/countries"
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${isLinkActive('/admin/countries') ? 'bg-primary bg-opacity-10 text-primary dark:text-primary-light' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Flag size={18} />
                <span>الدول</span>
              </Link>
            </div>

            <div className="mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="px-4 mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                إدارة المستخدمين
              </h3>
              
              <Link 
                href="/admin/users"
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${isLinkActive('/admin/users') ? 'bg-primary bg-opacity-10 text-primary dark:text-primary-light' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Users size={18} />
                <span>المستخدمين</span>
              </Link>
              
              <Link 
                href="/admin/messages"
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${isLinkActive('/admin/messages') ? 'bg-primary bg-opacity-10 text-primary dark:text-primary-light' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <MessageSquare size={18} />
                <span>الرسائل</span>
              </Link>
            </div>

            <div className="mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="px-4 mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                إدارة الموقع
              </h3>
              
              <Link 
                href="/admin/menus"
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${isLinkActive('/admin/menus') ? 'bg-primary bg-opacity-10 text-primary dark:text-primary-light' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Layers size={18} />
                <span>القوائم</span>
              </Link>
              
              <Link 
                href="/admin/appearance"
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${isLinkActive('/admin/appearance') ? 'bg-primary bg-opacity-10 text-primary dark:text-primary-light' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Grid size={18} />
                <span>المظهر</span>
              </Link>
              
              <Link 
                href="/admin/analytics"
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${isLinkActive('/admin/analytics') ? 'bg-primary bg-opacity-10 text-primary dark:text-primary-light' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <BarChart2 size={18} />
                <span>التحليلات</span>
              </Link>
              
              <Link 
                href="/admin/settings"
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${isLinkActive('/admin/settings') ? 'bg-primary bg-opacity-10 text-primary dark:text-primary-light' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Settings size={18} />
                <span>الإعدادات</span>
              </Link>
            </div>

            <div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-right"
              >
                <LogOut size={18} />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* المحتوى الرئيسي */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            {description && <p className="mt-1 text-gray-600 dark:text-gray-400">{description}</p>}
          </div>
          
          {/* تغطية للإغلاق عند النقر خارج القائمة في الأجهزة الصغيرة */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
          
          {children}
        </main>
      </div>
    </div>
  );
}