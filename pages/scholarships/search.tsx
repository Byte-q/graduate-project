import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import MainLayout from '@/components/layout/MainLayout';
import { SearchForm } from '@/components/search/SearchForm';
import { FilterComponent } from '@/components/search/FilterComponent';
import { ScholarshipCard } from '@/components/scholarships/ScholarshipCard';
import { Pagination } from '@/components/ui/Pagination';
import { Search, Filter, X } from 'lucide-react';
import { useSiteSettings } from '@/contexts/site-settings-context';
import { apiGet } from '@/lib/api';

// تعريف واجهة بيانات المنحة الدراسية
interface ScholarshipData {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl?: string;
  isFeatured: boolean;
  deadline: string;
  fundingType: string;
  studyDestination?: string;
  categoryId?: number;
  countryId?: number;
  levelId?: number;
  category?: { id: number; name: string; slug: string };
  country?: { id: number; name: string; slug: string };
  level?: { id: number; name: string; slug: string };
}

// تعريف واجهة خيارات التصفية
interface FilterOptions {
  categories: { id: number; name: string; slug: string }[];
  countries: { id: number; name: string; slug: string }[];
  levels: { id: number; name: string; slug: string }[];
}

// تعريف واجهة خصائص الصفحة
interface ScholarshipSearchPageProps {
  initialSearchQuery: string;
  scholarships: ScholarshipData[];
  filterOptions: FilterOptions;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  initialFilters: {
    category?: string;
    country?: string;
    level?: string;
    fundingType?: string;
    sortBy?: string;
  };
}

// مكون صفحة البحث عن المنح الدراسية
export default function ScholarshipSearchPage({
  initialSearchQuery,
  scholarships,
  filterOptions,
  pagination,
  initialFilters
}: ScholarshipSearchPageProps) {
  const router = useRouter();
  const { siteSettings } = useSiteSettings();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  
  // عنوان الصفحة
  const title = `نتائج البحث عن: ${searchQuery} | ${siteSettings?.siteName || 'FULLSCO'}`;
  
  // وصف الصفحة
  const description = `نتائج البحث عن "${searchQuery}" في المنح الدراسية. اكتشف أفضل الفرص التعليمية المتاحة.`;
  
  // معالجة البحث
  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push({
        pathname: '/scholarships/search',
        query: { 
          ...router.query,
          q: query,
          page: 1 
        }
      });
    }
  };
  
  // تبديل عرض الفلاتر للأجهزة المحمولة
  const toggleFilters = () => {
    setIsFiltersVisible(!isFiltersVisible);
  };
  
  return (
    <MainLayout title={title} description={description}>
      <Head>
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}/scholarships/search?q=${searchQuery}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
      </Head>
      
      {/* رأس الصفحة */}
      <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 pt-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              نتائج البحث عن: <span className="text-primary">{searchQuery}</span>
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              وجدنا {pagination.total} نتيجة تطابق بحثك. استخدم أدوات التصفية لتحسين النتائج.
            </p>
            
            <SearchForm 
              defaultQuery={searchQuery}
              onSearch={handleSearch}
              isSearchPage={true}
              className="max-w-2xl mx-auto"
            />
          </div>
        </div>
      </div>
      
      {/* محتوى الصفحة */}
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {pagination.total} نتيجة بحث
          </h2>
          
          <button 
            className="md:hidden flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-2 rounded-lg text-sm font-medium"
            onClick={toggleFilters}
          >
            <Filter className="h-4 w-4" />
            تصفية
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* جزء الفلاتر */}
          <div className={`md:block md:w-72 flex-shrink-0 ${isFiltersVisible ? 'block' : 'hidden'}`}>
            <div className="md:sticky md:top-20">
              <div className="flex items-center justify-between md:hidden mb-4">
                <h3 className="font-bold text-lg">تصفية النتائج</h3>
                <button 
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={toggleFilters}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <FilterComponent
                categories={filterOptions.categories}
                countries={filterOptions.countries}
                levels={filterOptions.levels}
                defaultValues={{
                  category: initialFilters.category,
                  country: initialFilters.country,
                  level: initialFilters.level,
                  fundingType: initialFilters.fundingType,
                  sortBy: initialFilters.sortBy || 'relevance'
                }}
              />
            </div>
          </div>
          
          {/* جزء النتائج */}
          <div className="flex-1">
            {scholarships.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {scholarships.map(scholarship => (
                    <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                  ))}
                </div>
                
                {pagination.totalPages > 1 && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                  />
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
                <div className="flex justify-center mb-4">
                  <Search className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">لم يتم العثور على نتائج</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  لا توجد منح دراسية تطابق كلمات البحث "{searchQuery}". حاول استخدام كلمات مفتاحية أخرى أو تغيير معايير البحث.
                </p>
                <button
                  onClick={() => router.push('/scholarships')}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  عرض جميع المنح
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// جلب البيانات من الخادم
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  try {
    const searchQuery = query.q as string;
    
    if (!searchQuery || searchQuery.trim() === '') {
      return {
        redirect: {
          destination: '/scholarships',
          permanent: false,
        },
      };
    }
    
    const page = query.page ? parseInt(query.page as string) : 1;
    const limit = query.limit ? parseInt(query.limit as string) : 10;
    const category = query.category as string | undefined;
    const country = query.country as string | undefined;
    const level = query.level as string | undefined;
    const fundingType = query.fundingType as string | undefined;
    const sortBy = query.sortBy as string | undefined || 'relevance';
    
    // استخدام وحدة API الموحدة
    console.log("جلب بيانات البحث عن المنح الدراسية...");
    
    // إعداد معلمات الاستعلام للاستخدام في وحدة API
    const params = {
      search: searchQuery,
      page: page,
      limit: limit,
      category: category,
      country: country,
      level: level,
      fundingType: fundingType,
      sortBy: sortBy || 'relevance'
    };
    
    // استدعاء API باستخدام وحدة API الموحدة مع مسار Express المحدث
    console.log(`Using server/api path for scholarships search`);
    const data = await apiGet('/server/api/scholarships', params);
    console.log(`تم العثور على ${data?.scholarships?.length || 0} منحة دراسية`);
    
    // معالجة البيانات
    return {
      props: {
        initialSearchQuery: searchQuery,
        scholarships: data.scholarships || [],
        filterOptions: data.meta.filters || {
          categories: [],
          countries: [],
          levels: []
        },
        pagination: data.meta.pagination || {
          total: 0,
          page,
          limit,
          totalPages: 0
        },
        initialFilters: {
          category,
          country,
          level,
          fundingType,
          sortBy
        }
      }
    };
  } catch (error) {
    console.error('Error fetching search results:', error);
    
    // إرجاع بيانات فارغة في حالة الخطأ
    return {
      props: {
        initialSearchQuery: query.q || '',
        scholarships: [],
        filterOptions: {
          categories: [],
          countries: [],
          levels: []
        },
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        },
        initialFilters: {}
      }
    };
  }
}