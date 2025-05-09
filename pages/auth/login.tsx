import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import MainLayout from '@/components/layout/MainLayout';
import { useSiteSettings } from '@/contexts/site-settings-context';

export default function LoginPage() {
  const router = useRouter();
  const { siteSettings } = useSiteSettings();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ أثناء تسجيل الدخول');
      }

      // تسجيل الدخول بنجاح - التوجيه للصفحة الرئيسية
      console.log('تم تسجيل الدخول بنجاح:', data.user);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في عملية تسجيل الدخول، يرجى المحاولة مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout 
      title={`تسجيل الدخول | ${siteSettings?.siteName || 'FULLSCO'}`}
      description="تسجيل الدخول إلى حسابك للوصول إلى ميزات إضافية"
    >
      <Head>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">تسجيل الدخول</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  أدخل بيانات الدخول الخاصة بك للوصول إلى حسابك
                </p>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    اسم المستخدم
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="أدخل اسم المستخدم"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      كلمة المرور
                    </label>
                    <Link 
                      href="/auth/forgot-password"
                      className="text-sm text-primary hover:text-primary-dark transition-colors dark:text-primary-light"
                    >
                      نسيت كلمة المرور؟
                    </Link>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="أدخل كلمة المرور"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full ml-2"></span>
                        جاري تسجيل الدخول...
                      </>
                    ) : (
                      'تسجيل الدخول'
                    )}
                  </button>
                </div>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ليس لديك حساب؟{' '}
                    <Link
                      href="/auth/register"
                      className="text-primary hover:text-primary-dark transition-colors dark:text-primary-light font-medium"
                    >
                      إنشاء حساب جديد
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}