import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import Image from 'next/image';
import { Search } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { PostCard } from '@/components/posts/PostCard';
import { db } from '@/server/db';
import { posts, categories } from '@/shared/schema';
import { desc, eq, like, sql } from 'drizzle-orm';
import { apiGet } from '@/lib/api';

interface Post {
  id: number;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  authorId?: number;
  authorName?: string;
  categoryId?: number;
  status?: string;
  isFeatured?: boolean;
  viewCount?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  category?: { id: number; name: string; slug: string; };
}

interface Category {
  id: number;
  name: string;
  slug: string;
  postCount?: number;
}

interface PostsPageProps {
  posts: Post[];
  categories: Category[];
  totalPages: number;
  currentPage: number;
  totalPosts: number;
  categorySlug?: string;
  searchQuery?: string;
}

export default function PostsPage({
  posts: initialPosts,
  categories,
  totalPages,
  currentPage,
  totalPosts,
  categorySlug,
  searchQuery
}: PostsPageProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [search, setSearch] = useState(searchQuery || '');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(currentPage);

  // التعامل مع تغيير صفحة
  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    
    setLoading(true);
    
    try {
      // إعداد معلمات الاستعلام
      const queryParams: Record<string, any> = {
        page: newPage,
        limit: 12
      };
      
      if (categorySlug) queryParams.category = categorySlug;
      if (search) queryParams.search = search;
      
      // استخدام وحدة API الجديدة مع مسار Express المحدث
      console.log("Using server/api path for posts pagination");
      const data = await apiGet('/server/api/posts', queryParams);
      
      if (data.posts) {
        setPosts(data.posts);
        setPage(newPage);
        
        // تحديث URL بدون إعادة تحميل الصفحة
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('page', newPage.toString());
        window.history.pushState({}, '', newUrl.toString());
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // التعامل مع البحث
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // إعداد معلمات الاستعلام
      const queryParams: Record<string, any> = {
        page: 1,
        limit: 12
      };
      
      if (categorySlug) queryParams.category = categorySlug;
      if (search) queryParams.search = search;
      
      // استخدام وحدة API الجديدة مع مسار Express المحدث
      console.log("Using server/api path for posts search");
      const data = await apiGet('/server/api/posts', queryParams);
      
      if (data.posts) {
        setPosts(data.posts);
        setPage(1);
        
        // تحديث URL بدون إعادة تحميل الصفحة
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('search', search);
        newUrl.searchParams.set('page', '1');
        window.history.pushState({}, '', newUrl.toString());
      }
    } catch (error) {
      console.error('Error searching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // توليد محتوى العنوان بناءً على الفلاتر
  const generateTitle = () => {
    if (categorySlug) {
      const category = categories.find(c => c.slug === categorySlug);
      if (category) return `مقالات ${category.name}`;
    }
    
    if (searchQuery) return `نتائج البحث: ${searchQuery}`;
    
    return 'جميع المقالات';
  };

  return (
    <MainLayout
      title={generateTitle()}
      description="اطلع على أحدث المقالات المتعلقة بالمنح الدراسية حول العالم، نصائح للدراسة في الخارج، وإرشادات لتحسين فرصك في الحصول على منح دراسية."
    >
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-6">{generateTitle()}</h1>
          
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            {/* نموذج البحث */}
            <form
              onSubmit={handleSearch}
              className="relative w-full md:w-96"
            >
              <input
                type="text"
                placeholder="ابحث في المقالات..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary"
                aria-label="بحث"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
            
            {/* عدد المقالات */}
            <div className="text-gray-500">
              عدد المقالات: <span className="font-semibold">{totalPosts}</span>
            </div>
          </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* قائمة التصنيفات */}
          <aside className="md:col-span-3 order-2 md:order-1">
            <div className="sticky top-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4">التصنيفات</h2>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/posts"
                    className={`block px-3 py-2 rounded-md transition-colors ${
                      !categorySlug
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-100 font-medium'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    جميع المقالات
                    <span className="mr-2 text-sm text-gray-500 dark:text-gray-400">
                      ({totalPosts})
                    </span>
                  </a>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <a
                      href={`/posts?category=${category.slug}`}
                      className={`block px-3 py-2 rounded-md transition-colors ${
                        categorySlug === category.slug
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-100 font-medium'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {category.name}
                      <span className="mr-2 text-sm text-gray-500 dark:text-gray-400">
                        ({category.postCount || 0})
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
          
          {/* قائمة المقالات */}
          <main className="md:col-span-9 order-1 md:order-2">
            {loading ? (
              // حالة التحميل
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 dark:bg-gray-800 rounded-xl h-96 animate-pulse"
                  ></div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              // عرض المقالات
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
                
                {/* ترقيم الصفحات */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center space-x-2 space-x-reverse rtl">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        aria-label="الصفحة السابقة"
                      >
                        السابق
                      </button>
                      
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        // عرض أول صفحتين وآخر صفحتين والصفحة الحالية والصفحات المجاورة
                        if (
                          pageNum <= 2 ||
                          pageNum >= totalPages - 1 ||
                          (pageNum >= page - 1 && pageNum <= page + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-1 rounded ${
                                pageNum === page
                                  ? 'bg-primary text-white'
                                  : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          (pageNum === 3 && page > 4) ||
                          (pageNum === totalPages - 2 && page < totalPages - 3)
                        ) {
                          // عرض النقاط للصفحات المحذوفة
                          return <span key={pageNum}>...</span>;
                        }
                        return null;
                      })}
                      
                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        aria-label="الصفحة التالية"
                      >
                        التالي
                      </button>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              // رسالة عندما لا توجد مقالات
              <div className="text-center py-12">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <Image
                    src="/images/empty-box.svg"
                    alt="لا توجد مقالات"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2">لم يتم العثور على مقالات</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery
                    ? `لا توجد نتائج مطابقة لـ "${searchQuery}"`
                    : categorySlug
                    ? 'لا توجد مقالات في هذا التصنيف'
                    : 'لا توجد مقالات متاحة حاليًا'}
                </p>
                {(searchQuery || categorySlug) && (
                  <a
                    href="/posts"
                    className="inline-block px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark transition-colors"
                  >
                    عرض كل المقالات
                  </a>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // استخراج معلمات الاستعلام
    const { page = '1', limit = '12', category, search } = context.query;
    const currentPage = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 12;
    const categorySlug = category as string | undefined;
    const searchQuery = search as string | undefined;
    
    // إعداد معلمات الاستعلام
    const queryParams: Record<string, any> = {
      page: currentPage,
      limit: pageSize
    };
    
    if (categorySlug) queryParams.category = categorySlug;
    if (searchQuery) queryParams.search = searchQuery;
    
    // استخدام وحدة API الجديدة للحصول على المقالات
    let postsData: any = { posts: [], totalPosts: 0, totalPages: 0 };
    let categoriesWithCount: Category[] = [];
    
    // جلب المقالات
    try {
      console.log("Using server/api path for posts in SSR");
      postsData = await apiGet('/server/api/posts', queryParams);
    } catch (error) {
      console.error('API request for posts failed:', error);
    }
    
    // جلب التصنيفات
    try {
      console.log("Using server/api path for categories in SSR");
      const categoriesData = await apiGet('/server/api/categories');
      categoriesWithCount = categoriesData.categories || [];
    } catch (error) {
      console.error('API request for categories failed:', error);
    }
    
    // تحويل البيانات إلى صيغة يمكن تمثيلها كـ JSON
    return {
      props: {
        posts: JSON.parse(JSON.stringify(postsData.posts || [])),
        totalPages: postsData.totalPages || 1,
        currentPage,
        totalPosts: postsData.totalPosts || 0,
        categories: JSON.parse(JSON.stringify(categoriesWithCount)),
        categorySlug: categorySlug || null,
        searchQuery: searchQuery || null
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps for posts page:', error);
    
    // في حالة حدوث خطأ، نعيد قيم افتراضية فارغة
    return {
      props: {
        posts: [],
        totalPages: 1,
        currentPage: 1,
        totalPosts: 0,
        categories: [],
        categorySlug: null,
        searchQuery: null
      }
    };
  }
};