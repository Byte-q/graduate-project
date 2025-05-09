import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import MainLayout from '@/components/layout/MainLayout';
import { SearchForm } from '@/components/search/SearchForm';
import { FilterComponent } from '@/components/search/FilterComponent';
import { ScholarshipCard } from '@/components/scholarships/ScholarshipCard';
import { Pagination } from '@/components/ui/Pagination';
import { GraduationCap, Filter, X, Search } from 'lucide-react';
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
interface ScholarshipsPageProps {
  scholarships: ScholarshipData[];
  filterOptions: FilterOptions;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  initialFilters: {
    search?: string;
    category?: string;
    country?: string;
    level?: string;
    fundingType?: string;
    sortBy?: string;
  };
}

// مكون صفحة المنح الدراسية
export default function ScholarshipsPage({
  scholarships,
  filterOptions,
  pagination,
  initialFilters
}: ScholarshipsPageProps) {
  const { siteSettings } = useSiteSettings();
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  
  // عنوان الصفحة
  const title = initialFilters?.search
    ? `نتائج البحث عن: ${initialFilters.search} | ${siteSettings?.siteName || 'FULLSCO'}`
    : initialFilters?.category
    ? `منح ${filterOptions.categories.find(c => c.slug === initialFilters.category)?.name || ''} | ${siteSettings?.siteName || 'FULLSCO'}`
    : initialFilters?.country
    ? `منح دراسية في ${filterOptions.countries.find(c => c.slug === initialFilters.country)?.name || ''} | ${siteSettings?.siteName || 'FULLSCO'}`
    : initialFilters?.level
    ? `منح ${filterOptions.levels.find(l => l.slug === initialFilters.level)?.name || ''} | ${siteSettings?.siteName || 'FULLSCO'}`
    : `المنح الدراسية | ${siteSettings?.siteName || 'FULLSCO'}`;
  
  // بناء وصف الصفحة
  const description = initialFilters?.search
    ? `نتائج البحث عن "${initialFilters.search}" في المنح الدراسية. اكتشف أفضل الفرص التعليمية المتاحة.`
    : 'اكتشف أحدث المنح الدراسية حول العالم. فرص تعليمية متنوعة للطلاب من مختلف التخصصات والمستويات الدراسية.';
  
  const toggleFilters = () => {
    setIsFiltersVisible(!isFiltersVisible);
  };
  
  return (
    <MainLayout title={title} description={description}>
      <Head>
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}/scholarships`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
      </Head>
      
      <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 pt-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {initialFilters?.search ? (
                <>نتائج البحث عن: <span className="text-primary">{initialFilters.search}</span></>
              ) : initialFilters?.category ? (
                <>منح <span className="text-primary">{filterOptions.categories.find(c => c.slug === initialFilters.category)?.name}</span></>
              ) : initialFilters?.country ? (
                <>منح دراسية في <span className="text-primary">{filterOptions.countries.find(c => c.slug === initialFilters.country)?.name}</span></>
              ) : initialFilters?.level ? (
                <>منح <span className="text-primary">{filterOptions.levels.find(l => l.slug === initialFilters.level)?.name}</span></>
              ) : (
                'استكشف المنح الدراسية'
              )}
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {initialFilters?.search
                ? `وجدنا ${pagination.total} نتيجة تطابق بحثك. استخدم أدوات التصفية لتحسين النتائج.`
                : 'اكتشف أحدث المنح الدراسية المتاحة عالمياً واعثر على الفرصة المناسبة لك.'
              }
            </p>
            
            <SearchForm 
              defaultQuery={initialFilters?.search || ''}
              isSearchPage={true}
              className="max-w-2xl mx-auto"
            />
          </div>
        </div>
      </div>
      
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            {pagination.total} منحة دراسية متاحة
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
                  category: initialFilters?.category || undefined,
                  country: initialFilters?.country || undefined,
                  level: initialFilters?.level || undefined,
                  fundingType: initialFilters?.fundingType || undefined,
                  sortBy: initialFilters?.sortBy || 'newest'
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
                  لا توجد منح دراسية تطابق معايير البحث. حاول تغيير معايير التصفية أو البحث.
                </p>
                <button
                  onClick={() => window.location.href = '/scholarships'}
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
    const page = query.page ? parseInt(query.page as string) : 1;
    const limit = query.limit ? parseInt(query.limit as string) : 10;
    const search = query.search as string | undefined;
    const category = query.category as string | undefined;
    const country = query.country as string | undefined;
    const level = query.level as string | undefined;
    const fundingType = query.fundingType as string | undefined;
    const sortBy = query.sortBy as string | undefined;
    
    // استخدام وحدة API الجديدة
    const queryParams: Record<string, any> = {
      page,
      limit
    };
    
    // إضافة المعلمات الاختيارية فقط إذا كانت موجودة
    if (search) queryParams.search = search;
    if (category) queryParams.category = category;
    if (country) queryParams.country = country;
    if (level) queryParams.level = level;
    if (fundingType) queryParams.fundingType = fundingType;
    if (sortBy) queryParams.sortBy = sortBy;
    
    // استدعاء API باستخدام apiGet
    const data = await apiGet('scholarships', queryParams);
    
    // معالجة البيانات
    return {
      props: {
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
          search: search || null,
          category: category || null,
          country: country || null,
          level: level || null,
          fundingType: fundingType || null,
          sortBy: sortBy || null
        }
      }
    };
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    
    // إرجاع بيانات فارغة في حالة الخطأ
    return {
      props: {
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
        initialFilters: {
          search: null,
          category: null,
          country: null,
          level: null,
          fundingType: null,
          sortBy: null
        }
      }
    };
  }
}