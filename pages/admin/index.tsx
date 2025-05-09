import { useState, useEffect } from 'react';
import AdminLayout from './layouts/AdminLayout';
import Link from 'next/link';
import {
  Users,
  Award,
  FileText,
  Book,
  Search,
  Archive,
  TrendingUp,
  MessageSquare,
  Calendar,
  Clock,
  AlertTriangle
} from 'lucide-react';

// نموذج لبيانات الإحصائيات
interface StatsData {
  totalScholarships: number;
  totalUsers: number;
  totalPosts: number;
  totalSuccessStories: number;
  recentScholarships: Array<{
    id: number;
    title: string;
    slug: string;
    createdAt: string;
  }>;
  recentMessages: Array<{
    id: number;
    name: string;
    email: string;
    subject: string;
    createdAt: string;
    isRead: boolean;
  }>;
  popularScholarships: Array<{
    id: number;
    title: string;
    slug: string;
    viewCount: number;
  }>;
}

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // في البيئة الحقيقية، نجلب البيانات من API
        const response = await fetch('/api/admin/dashboard');
        
        if (!response.ok) {
          throw new Error('فشل في جلب بيانات لوحة القيادة');
        }

        const data = await response.json();
        setStatsData(data);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // إحصائيات افتراضية للعرض خلال التطوير
  const defaultStats: StatsData = {
    totalScholarships: 0,
    totalUsers: 0,
    totalPosts: 0,
    totalSuccessStories: 0,
    recentScholarships: [],
    recentMessages: [],
    popularScholarships: []
  };

  // استخدام البيانات المجلوبة أو الافتراضية
  const stats = statsData || defaultStats;

  return (
    <AdminLayout title="لوحة القيادة" description="ملخص إحصائيات وأنشطة الموقع">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-800 dark:text-red-300">
          <AlertTriangle className="inline-block w-5 h-5 ml-2" />
          {error}
        </div>
      ) : (
        <>
          {/* بطاقات الإحصائيات */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المنح</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalScholarships}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المستخدمين</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المقالات</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPosts}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
                <Book className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">قصص النجاح</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSuccessStories}</h3>
              </div>
            </div>
          </div>

          {/* روابط سريعة */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">إجراءات سريعة</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Link 
                href="/admin/scholarships/add"
                className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Award className="w-6 h-6 text-primary mb-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">إضافة منحة</span>
              </Link>
              
              <Link 
                href="/admin/posts/add"
                className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <FileText className="w-6 h-6 text-primary mb-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">إضافة مقال</span>
              </Link>
              
              <Link 
                href="/admin/success-stories/add"
                className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Book className="w-6 h-6 text-primary mb-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">قصة نجاح</span>
              </Link>
              
              <Link 
                href="/admin/users"
                className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Users className="w-6 h-6 text-primary mb-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">المستخدمين</span>
              </Link>
              
              <Link 
                href="/admin/messages"
                className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <MessageSquare className="w-6 h-6 text-primary mb-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">الرسائل</span>
              </Link>
              
              <Link 
                href="/admin/analytics"
                className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <TrendingUp className="w-6 h-6 text-primary mb-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">التحليلات</span>
              </Link>
            </div>
          </div>

          {/* القسم الرئيسي للبيانات */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* العمود الأول */}
            <div className="col-span-2 space-y-8">
              {/* آخر المنح المضافة */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">آخر المنح المضافة</h2>
                  <Link 
                    href="/admin/scholarships" 
                    className="text-sm text-primary hover:text-primary-dark dark:hover:text-primary-light"
                  >
                    عرض الكل
                  </Link>
                </div>
                
                <div className="p-6">
                  {stats.recentScholarships.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {stats.recentScholarships.map((scholarship) => (
                        <div key={scholarship.id} className="py-4 flex justify-between items-center">
                          <div>
                            <Link 
                              href={`/admin/scholarships/edit/${scholarship.id}`}
                              className="text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary-light"
                            >
                              {scholarship.title}
                            </Link>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <Calendar className="inline-block w-4 h-4 ml-1" />
                              {new Date(scholarship.createdAt).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                          <div className="flex space-x-2 space-x-reverse">
                            <Link 
                              href={`/admin/scholarships/edit/${scholarship.id}`}
                              className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </Link>
                            <Link 
                              href={`/scholarships/${scholarship.slug}`} 
                              target="_blank"
                              className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                              </svg>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      <Archive className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
                      <p>لا توجد منح دراسية حالياً</p>
                      <Link 
                        href="/admin/scholarships/add" 
                        className="mt-2 inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                      >
                        إضافة منحة جديدة
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* المنح الأكثر مشاهدة */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">المنح الأكثر مشاهدة</h2>
                  <Link 
                    href="/admin/analytics/scholarships" 
                    className="text-sm text-primary hover:text-primary-dark dark:hover:text-primary-light"
                  >
                    تفاصيل أكثر
                  </Link>
                </div>
                
                <div className="p-6">
                  {stats.popularScholarships.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {stats.popularScholarships.map((scholarship, index) => (
                        <div key={scholarship.id} className="py-4 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                              {index + 1}
                            </div>
                            <Link 
                              href={`/admin/scholarships/edit/${scholarship.id}`}
                              className="text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary-light"
                            >
                              {scholarship.title}
                            </Link>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Search className="w-4 h-4 ml-1" />
                            {scholarship.viewCount} مشاهدة
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      <TrendingUp className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
                      <p>لا توجد بيانات مشاهدات كافية</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* العمود الثاني */}
            <div className="space-y-8">
              {/* آخر الرسائل */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">آخر الرسائل</h2>
                  <Link 
                    href="/admin/messages" 
                    className="text-sm text-primary hover:text-primary-dark dark:hover:text-primary-light"
                  >
                    عرض الكل
                  </Link>
                </div>
                
                <div className="p-6">
                  {stats.recentMessages.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {stats.recentMessages.map((message) => (
                        <div key={message.id} className="py-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-2 h-2 rounded-full ${message.isRead ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-500'}`}></span>
                            <Link 
                              href={`/admin/messages/${message.id}`}
                              className={`${message.isRead ? 'text-gray-700' : 'font-medium text-gray-900'} dark:text-white hover:text-primary dark:hover:text-primary-light`}
                            >
                              {message.subject}
                            </Link>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {message.name} - {message.email}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            <Clock className="inline-block w-3 h-3 ml-1" />
                            {new Date(message.createdAt).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      <MessageSquare className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
                      <p>لا توجد رسائل جديدة</p>
                    </div>
                  )}
                </div>
              </div>

              {/* نظرة عامة سريعة */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">روابط مفيدة</h2>
                </div>
                
                <div className="p-6 space-y-4">
                  <Link 
                    href="/admin/settings/seo"
                    className="flex items-center gap-3 p-3 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">إعدادات SEO</span>
                  </Link>
                  
                  <Link 
                    href="/admin/appearance"
                    className="flex items-center gap-3 p-3 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l9 4.9V17L12 22 3 17V7L12 2z"></path>
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">تخصيص المظهر</span>
                  </Link>
                  
                  <Link 
                    href="/admin/menus"
                    className="flex items-center gap-3 p-3 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">إدارة القوائم</span>
                  </Link>
                  
                  <Link 
                    href="/admin/media"
                    className="flex items-center gap-3 p-3 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">مكتبة الوسائط</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}