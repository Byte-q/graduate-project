import { useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import MainLayout from '@/components/layout/MainLayout';
import { ScholarshipCard } from '@/components/scholarships/ScholarshipCard';
import { Pagination } from '@/components/ui/Pagination';
import { SearchForm } from '@/components/search/SearchForm';

// تعريف نوع البيانات للتصنيف
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
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

// تعريف نوع البيانات لصفحة تفاصيل التصنيف
interface CategoryDetailPageProps {
  category: Category;
  scholarships: Scholarship[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export default function CategoryDetailPage({
  category,
  scholarships,
  totalPages,
  currentPage,
  totalItems,
}: CategoryDetailPageProps) {
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
    // التوجه إلى صفحة البحث الرئيسية مع تحديد فلتر التصنيف الحالي
    router.push({
      pathname: '/scholarships',
      query: { 
        search: query,
        category: category.slug
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
      title={`${category.name} - تصنيفات المنح الدراسية`}
      description={category.description || `اطلع على المنح الدراسية في تصنيف ${category.name} وتعرف على أحدث فرص التمويل المتاحة`}
    >
      <Head>
        <meta name="keywords" content={`${category.name}, منح دراسية, تصنيفات المنح, فرص تمويل, دراسة`} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* معلومات التصنيف */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-primary dark:text-gray-100 mb-2">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-gray-600 dark:text-gray-300 mb-6">{category.description}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="text-gray-500 dark:text-gray-400">
              {totalItems} منحة متاحة في هذا التصنيف
            </div>
            {/* مربع البحث */}
            <div className="w-full max-w-md">
              <SearchForm
                onSearch={handleSearch}
                placeholder={`ابحث في منح ${category.name}...`}
                isCompact={true}
              />
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
                لم يتم العثور على منح دراسية في هذا التصنيف. يرجى التحقق لاحقاً أو استكشاف تصنيفات أخرى.
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

        {/* قسم التصنيفات ذات الصلة */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            استكشف تصنيفات أخرى
          </h2>
          <div className="flex flex-wrap gap-2">
            <a
              href="/categories"
              className="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-primary hover:text-white dark:hover:bg-primary-700 transition-colors"
            >
              جميع التصنيفات
            </a>
            <a
              href="/scholarships"
              className="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-primary hover:text-white dark:hover:bg-primary-700 transition-colors"
            >
              جميع المنح
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
    const { categories, scholarships } = await import('@/shared/schema');
    
    // جلب تفاصيل التصنيف
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug as string));
    
    // التحقق من وجود التصنيف
    if (!category) {
      return { notFound: true };
    }
    
    // جلب المنح المرتبطة بالتصنيف
    const offset = (page - 1) * limit;
    
    const scholarshipsList = await db
      .select()
      .from(scholarships)
      .where(eq(scholarships.category_id, category.id))
      .limit(limit)
      .offset(offset)
      .orderBy(scholarships.created_at);
    
    // جلب إجمالي عدد المنح للتصنيف
    const [{ count }] = await db
      .select({ count: sql`COUNT(*)`.mapWith(Number) })
      .from(scholarships)
      .where(eq(scholarships.category_id, category.id));
    
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
        category,
        scholarships: serializableScholarships || [],
        totalPages,
        currentPage: page,
        totalItems,
      },
    };
  } catch (error) {
    console.error('Error fetching category details:', error);
    return { notFound: true };
  }
};