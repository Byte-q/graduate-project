import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import MainLayout from '@/components/layout/MainLayout';
import { ScholarshipCard } from '@/components/scholarships/ScholarshipCard';
import { FilterComponent } from '@/components/search/FilterComponent';
import { SearchForm } from '@/components/search/SearchForm';
import { Pagination } from '@/components/ui/Pagination';

// تعريف نوع البيانات للتصنيف
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  scholarshipCount?: number;
}

// تعريف نوع البيانات لصفحة التصنيفات
interface CategoriesPageProps {
  categories: Category[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export default function CategoriesPage({
  categories,
  totalPages,
  currentPage,
  totalItems,
}: CategoriesPageProps) {
  const router = useRouter();
  const { search } = router.query;
  const [isLoading, setIsLoading] = useState(false);

  // تحديث عنوان المتصفح عند تغيير معلمات البحث
  useEffect(() => {
    const title = search
      ? `نتائج البحث عن "${search}" - تصنيفات المنح الدراسية`
      : 'تصنيفات المنح الدراسية - موقع المنح الدراسية';
    document.title = title;
  }, [search]);

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
    router.push({
      pathname: router.pathname,
      query: query ? { search: query, page: '1' } : { page: '1' },
    });
  };

  return (
    <MainLayout
      title="تصنيفات المنح الدراسية"
      description="استكشف تصنيفات المنح الدراسية المختلفة وابحث عن المنح المناسبة لك"
    >
      <Head>
        <meta name="keywords" content="تصنيفات, منح دراسية, دراسة, فئات المنح الدراسية" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-primary dark:text-gray-100 mb-2">
            تصنيفات المنح الدراسية
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            استكشف المنح الدراسية حسب التصنيف واعثر على الفرص التي تناسب اهتماماتك ومجال دراستك
          </p>

          {/* قسم البحث */}
          <div className="mb-8">
            <SearchForm
              defaultQuery={search as string}
              onSearch={handleSearch}
              placeholder="ابحث في التصنيفات..."
              showLabel={true}
            />
          </div>

          {/* عرض التصنيفات */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300"
              >
                <div className="p-4">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {category.scholarshipCount || 0} منحة
                    </span>
                    <a
                      href={`/categories/${category.slug}`}
                      className="text-primary dark:text-primary-400 hover:text-primary-700 text-sm font-medium"
                    >
                      عرض المنح &larr;
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* عرض رسالة عندما لا توجد نتائج */}
          {categories.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                لم يتم العثور على أي تصنيفات{search ? ` تطابق "${search}"` : ''}
              </p>
            </div>
          )}

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
        </div>
      </div>
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  try {
    // استخراج معلمات الاستعلام
    const page = parseInt(query.page as string || '1', 10);
    const limit = parseInt(query.limit as string || '12', 10);
    const search = query.search as string;

    // استيراد API handler مباشرة
    const handler = (await import('../api/categories/index')).default;
    
    // محاكاة طلب واستجابة
    const req: any = {
      method: 'GET',
      query: {
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      }
    };
    
    // إنشاء كائن استجابة وهمي
    let responseData: any = null;
    const res: any = {
      status: (code: number) => ({
        json: (data: any) => {
          responseData = data;
          return res;
        }
      }),
      setHeader: () => res,
      end: () => res,
    };
    
    // استدعاء API handler مباشرة
    await handler(req, res);
    
    // التحقق من الاستجابة
    if (!responseData) {
      throw new Error('لم يتم استلام بيانات من واجهة برمجة التطبيقات');
    }

    return {
      props: {
        categories: responseData.categories || [],
        totalPages: responseData.pagination?.totalPages || 1,
        currentPage: responseData.pagination?.page || 1,
        totalItems: responseData.pagination?.totalItems || 0,
      },
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // إرجاع بيانات فارغة في حالة وجود خطأ
    return {
      props: {
        categories: [],
        totalPages: 1,
        currentPage: 1,
        totalItems: 0,
      },
    };
  }
};