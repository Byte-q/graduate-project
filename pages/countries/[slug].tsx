import { useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import MainLayout from '@/components/layout/MainLayout';
import { ScholarshipCard } from '@/components/scholarships/ScholarshipCard';
import { Pagination } from '@/components/ui/Pagination';
import { SearchForm } from '@/components/search/SearchForm';

// تعريف نوع البيانات للدولة
interface Country {
  id: number;
  name: string;
  slug: string;
  description?: string;
  flagUrl?: string;
}

// تعريف نوع البيانات للمنحة الدراسية
interface Scholarship {
  id: number;
  title: string;
  slug: string;
  description?: string;
  image_url?: string;
  deadline?: string;
  amount?: string;
  currency?: string;
  university?: string;
  department?: string;
  is_featured?: boolean;
  is_fully_funded?: boolean;
  country_id?: number;
  level_id?: number;
  category_id?: number;
  created_at?: string;
  updated_at?: string;
  start_date?: string;
  end_date?: string;
}

// تعريف نوع البيانات لصفحة تفاصيل الدولة
interface CountryDetailPageProps {
  country: Country;
  scholarships: Scholarship[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export default function CountryDetailPage({
  country,
  scholarships,
  totalPages,
  currentPage,
  totalItems,
}: CountryDetailPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // التعامل مع تغيير الصفحة
  const handlePageChange = (page: number) => {
    setIsLoading(true);
    const query = { ...router.query, page: page.toString() };
    router.push({
      pathname: router.pathname,
      query,
    });
  };

  // التعامل مع البحث
  const handleSearch = (query: string) => {
    setIsLoading(true);
    // التوجه إلى صفحة البحث الرئيسية مع تحديد فلتر الدولة الحالية
    router.push({
      pathname: '/scholarships',
      query: { 
        search: query,
        country: country.slug
      },
    });
  };

  if (router.isFallback) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                  <div className="h-40 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title={`الدراسة في ${country.name} - منح دراسية`}
      description={country.description || `اطلع على المنح الدراسية المتاحة للدراسة في ${country.name} وتعرف على أحدث فرص التمويل المتاحة`}
    >
      <Head>
        <meta name="keywords" content={`${country.name}, منح دراسية, الدراسة في الخارج, فرص تمويل, دراسة`} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* معلومات الدولة */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {country.flagUrl && (
              <div className="w-full md:w-1/4 lg:w-1/5 overflow-hidden">
                <img
                  src={country.flagUrl}
                  alt={`علم ${country.name}`}
                  className="w-full rounded-lg object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-primary dark:text-gray-100 mb-2">
                الدراسة في {country.name}
              </h1>
              {country.description && (
                <p className="text-gray-600 dark:text-gray-300 mb-6">{country.description}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="text-gray-500 dark:text-gray-400">
                  {totalItems} منحة متاحة في {country.name}
                </div>
                {/* مربع البحث */}
                <div className="w-full max-w-md">
                  <SearchForm
                    onSearch={handleSearch}
                    placeholder={`ابحث في منح ${country.name}...`}
                    isCompact={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* قائمة المنح الدراسية */}
        <div className="mb-8">
          {scholarships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scholarships.map((scholarship) => (
                <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                لا توجد منح متاحة حالياً
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                لم يتم العثور على منح دراسية في {country.name}. يرجى التحقق لاحقاً أو استكشاف دول أخرى.
              </p>
            </div>
          )}
        </div>

        {/* عنصر الترقيم */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* قسم الروابط المفيدة */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            روابط مفيدة حول الدراسة في {country.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href={`/scholarships?country=${country.slug}`}
              className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <h3 className="font-semibold text-primary dark:text-primary-400">كل المنح في {country.name}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">عرض جميع المنح الدراسية المتاحة في {country.name}</p>
            </a>
            <a 
              href="/countries"
              className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <h3 className="font-semibold text-primary dark:text-primary-400">استكشف وجهات دراسية أخرى</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">تصفح مختلف الدول والمنح الدراسية المتاحة فيها</p>
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  try {
    const { slug } = params!;
    
    // استخراج معلمات الاستعلام
    const page = parseInt(query.page as string || '1', 10);
    const limit = parseInt(query.limit as string || '9', 10);

    // استيراد الوحدات اللازمة
    const { db } = await import('@/db');
    const { eq, sql } = await import('drizzle-orm');
    const { countries, scholarships } = await import('@/shared/schema');
    
    // جلب تفاصيل الدولة
    const [country] = await db
      .select()
      .from(countries)
      .where(eq(countries.slug, slug as string));
    
    // التحقق من وجود الدولة
    if (!country) {
      console.error('Country not found:', slug);
      return { notFound: true };
    }
    
    // جلب المنح المرتبطة بالدولة
    const offset = (page - 1) * limit;
    
    const scholarshipsList = await db
      .select()
      .from(scholarships)
      .where(eq(scholarships.country_id, country.id))
      .limit(limit)
      .offset(offset)
      .orderBy(scholarships.created_at);
    
    // جلب إجمالي عدد المنح للدولة
    const [{ count }] = await db
      .select({ count: sql`COUNT(*)`.mapWith(Number) })
      .from(scholarships)
      .where(eq(scholarships.country_id, country.id));
    
    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / limit);
    
    // تحويل كائن المنحة إلى كائن قابل للتسلسل (JSON serializable)
    const serializableScholarships = scholarshipsList.map(scholarship => {
      // استخراج الخصائص الأساسية
      const { 
        id, title, slug, description, amount, currency, university, department, website,
        is_featured, is_fully_funded, country_id, level_id, category_id, requirements,
        application_link, image_url, content, seo_title, seo_description, seo_keywords,
        focus_keyword, is_published
      } = scholarship;
      
      // تحويل التواريخ إلى سلاسل نصية
      const created_at = scholarship.created_at instanceof Date ? scholarship.created_at.toISOString() : 
                        scholarship.created_at ? String(scholarship.created_at) : null;
                        
      const updated_at = scholarship.updated_at instanceof Date ? scholarship.updated_at.toISOString() : 
                        scholarship.updated_at ? String(scholarship.updated_at) : null;
                        
      const start_date = scholarship.start_date instanceof Date ? scholarship.start_date.toISOString() : 
                        scholarship.start_date ? String(scholarship.start_date) : null;
                        
      const end_date = scholarship.end_date instanceof Date ? scholarship.end_date.toISOString() : 
                      scholarship.end_date ? String(scholarship.end_date) : null;
                      
      const deadline = scholarship.deadline instanceof Date ? scholarship.deadline.toISOString() : 
                      scholarship.deadline ? String(scholarship.deadline) : null;
      
      // إرجاع كائن جديد مع جميع الخصائص محولة بشكل صحيح
      return {
        id, title, slug, description, amount, currency, university, department, website,
        is_featured, is_fully_funded, country_id, level_id, category_id, requirements,
        application_link, image_url, content, seo_title, seo_description, seo_keywords,
        focus_keyword, is_published, created_at, updated_at, start_date, end_date, deadline
      };
    });
    
    return {
      props: {
        country,
        scholarships: serializableScholarships || [],
        totalPages,
        currentPage: page,
        totalItems,
      },
    };
  } catch (error) {
    console.error('Error fetching country details:', error);
    
    // توجيه المستخدم إلى صفحة 404 في حالة وجود خطأ
    return { notFound: true };
  }
};