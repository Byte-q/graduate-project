import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import { SuccessStoryCard, SuccessStoryCardSkeleton } from '@/components/success-stories/SuccessStoryCard';
import { SearchForm } from '@/components/search/SearchForm';
import { Pagination } from '@/components/ui/Pagination';
import { fetchWithCache } from '@/hooks/use-cached-data';
import { apiGet } from '@/lib/api';

interface SuccessStoriesPageProps {
  initialStories: any[]; // Changed from SuccessStory[] to any[] as schema is removed
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  search?: string;
}

export default function SuccessStoriesPage({
  initialStories,
  total,
  page,
  limit,
  totalPages,
  search
}: SuccessStoriesPageProps) {
  const [stories, setStories] = useState<any[]>(initialStories); // Changed from SuccessStory[] to any[]
  const [currentPage, setCurrentPage] = useState(page);
  const [searchQuery, setSearchQuery] = useState(search || '');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTotal, setCurrentTotal] = useState(total);
  const [currentTotalPages, setCurrentTotalPages] = useState(totalPages);

  useEffect(() => {
    // إعادة تحميل قصص النجاح عند تغيير الصفحة أو البحث
    const fetchStories = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString()
        });

        if (searchQuery) {
          queryParams.append('search', searchQuery);
        }

        const data = await apiGet(`/success-stories`);
        
        setStories(data.data || []);
        setCurrentTotal(data.total);
        setCurrentTotalPages(data.totalPages);
      } catch (error) {
        console.error('خطأ في جلب قصص النجاح:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, [currentPage, searchQuery, limit]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // إعادة التعيين للصفحة الأولى عند البحث
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainLayout title="قصص النجاح | FULLSCO" description="قصص نجاح الطلاب وتجاربهم مع المنح الدراسية">
      <Head>
        <meta name="keywords" content="قصص نجاح، تجارب طلاب، منح دراسية، النجاح الأكاديمي، دراسة في الخارج" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">قصص النجاح</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            استلهم من قصص نجاح الطلاب وتجاربهم مع المنح الدراسية في مختلف أنحاء العالم
          </p>

          <div className="mb-6">
            <SearchForm 
              defaultQuery={searchQuery}
              onSearch={handleSearch}
              placeholder="ابحث في قصص النجاح..."
              showLabel={true}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <SuccessStoryCardSkeleton key={index} />
            ))}
          </div>
        ) : stories.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <SuccessStoryCard key={story._id} story={story} />
              ))}
            </div>

            <div className="mt-8">
              <Pagination 
                currentPage={currentPage}
                totalPages={currentTotalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {searchQuery 
                ? `لم يتم العثور على نتائج للبحث عن "${searchQuery}"`
                : 'لا توجد قصص نجاح متاحة حالياً'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const page = Number(query.page) || 1;
  const limit = 12;
  const search = query.search as string || '';

  try {
    // بناء معلمات الاستعلام
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (search) {
      queryParams.append('search', search);
    }

    // استعلام لجلب قصص النجاح من API داخلي (سيتم تنفيذه من الخادم)
    const data = await apiGet(`/success-stories`);
    
    // إعادة البيانات إلى الصفحة
    if (!data || !data.data) {
      console.error('Invalid data format from success stories API:', data);
      return {
        props: {
          initialStories: [],
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 1,
          search: search || ''
        }
      };
    };

    return {
      props: {
        initialStories: data.data || [],
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 12,
        totalPages: data.totalPages || 1,
        search: search || ''
      }
    };
  } catch (error) {
    console.error('Error fetching success stories:', error);
    
    // في حالة حدوث خطأ، نعيد بيانات فارغة
    return {
      props: {
        initialStories: [],
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 1,
        search: search || ''
      }
    };
  }
};