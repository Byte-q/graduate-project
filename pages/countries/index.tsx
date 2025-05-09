import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import MainLayout from '@/components/layout/MainLayout';
import { SearchForm } from '@/components/search/SearchForm';
import { Pagination } from '@/components/ui/Pagination';

// تعريف نوع البيانات للدولة
interface Country {
  id: number;
  name: string;
  slug: string;
  description?: string;
  flagUrl?: string;
  scholarshipCount?: number;
}

// تعريف نوع البيانات لصفحة الدول
interface CountriesPageProps {
  countries: Country[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export default function CountriesPage({
  countries,
  totalPages,
  currentPage,
  totalItems,
}: CountriesPageProps) {
  const router = useRouter();
  const { search } = router.query;
  const [isLoading, setIsLoading] = useState(false);

  // تحديث عنوان المتصفح عند تغيير معلمات البحث
  useEffect(() => {
    const title = search
      ? `نتائج البحث عن "${search}" - الدراسة في الخارج`
      : 'الدراسة في الخارج - وجهات الدراسة';
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
      title="الدراسة في الخارج - وجهات الدراسة"
      description="استكشف وجهات الدراسة في الخارج والمنح الدراسية المتاحة في مختلف البلدان حول العالم"
    >
      <Head>
        <meta name="keywords" content="دراسة في الخارج, وجهات دراسية, منح خارجية, دراسة خارج البلاد" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-primary dark:text-gray-100 mb-2">
            وجهات الدراسة في الخارج
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            استكشف المنح الدراسية حسب البلد واعثر على فرص الدراسة في مختلف أنحاء العالم
          </p>

          {/* قسم البحث */}
          <div className="mb-8">
            <SearchForm
              defaultQuery={search as string}
              onSearch={handleSearch}
              placeholder="ابحث عن دولة..."
              showLabel={true}
            />
          </div>

          {/* عرض الدول */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {countries.map((country) => (
              <div
                key={country.id}
                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300"
              >
                {country.flagUrl && (
                  <div className="h-32 overflow-hidden bg-gray-100 dark:bg-gray-600">
                    <img
                      src={country.flagUrl}
                      alt={`علم ${country.name}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    {country.name}
                  </h2>
                  {country.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                      {country.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {country.scholarshipCount || 0} منحة
                    </span>
                    <a
                      href={`/countries/${country.slug}`}
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
          {countries.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                لم يتم العثور على أي دول{search ? ` تطابق "${search}"` : ''}
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
    const handler = (await import('../api/countries/index')).default;
    
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

    // جلب الدول من قاعدة البيانات مباشرة إذا كان واجهة API لا تعمل
    if (!responseData.countries) {
      const db = (await import('@/db')).db;
      const { sql } = await import('drizzle-orm');
      const countries = (await import('@/shared/schema')).countries;
      
      const countriesList = await db.select().from(countries).orderBy(countries.name);
      
      return {
        props: {
          countries: countriesList || [],
          totalPages: 1,
          currentPage: 1,
          totalItems: countriesList.length || 0,
        },
      };
    }

    return {
      props: {
        countries: responseData.countries || [],
        totalPages: responseData.pagination?.totalPages || 1,
        currentPage: responseData.pagination?.page || 1,
        totalItems: responseData.pagination?.totalItems || 0,
      },
    };
  } catch (error) {
    console.error('Error fetching countries:', error);
    
    // إرجاع بيانات فارغة في حالة وجود خطأ
    return {
      props: {
        countries: [],
        totalPages: 1,
        currentPage: 1,
        totalItems: 0,
      },
    };
  }
};