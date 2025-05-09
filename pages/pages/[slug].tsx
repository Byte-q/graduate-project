import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useSiteSettings } from '@/contexts/site-settings-context';

// نوع البيانات للصفحة الثابتة
interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  imageUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PageProps {
  page: Page | null;
  error?: string;
}

export default function StaticPage({ page, error }: PageProps) {
  const router = useRouter();
  const { slug } = router.query;
  const { siteSettings } = useSiteSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [pageData, setPageData] = useState<Page | null>(page);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(error);

  // نحن لا نحتاج إلى جلب البيانات من العميل لأننا نستخدم SSR فقط
  useEffect(() => {
    // عند تغيير المسار نتحقق إذا كان لدينا البيانات بالفعل
    if (!page && slug && router.isReady) {
      setIsLoading(true);
      // يمكننا استخدام إعادة التوجيه كحل بديل
      router.replace(`/pages/${slug}`);
    }
  }, [slug, page, router]);

  // إذا كانت الصفحة قيد التحميل
  if (isLoading) {
    return (
      <MainLayout title="جاري التحميل..." description="جاري تحميل الصفحة">
        <div className="container py-12">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h1 className="text-xl font-medium text-gray-700 dark:text-gray-300">جاري التحميل...</h1>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // إذا كان هناك خطأ
  if (errorMessage || !pageData) {
    return (
      <MainLayout title="صفحة غير موجودة" description="الصفحة المطلوبة غير موجودة">
        <div className="container py-12">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center max-w-md">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                الصفحة غير موجودة
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {errorMessage || 'لم يتم العثور على الصفحة المطلوبة. يرجى التحقق من الرابط أو الاتصال بمسؤول الموقع.'}
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-focus transition-colors"
              >
                العودة إلى الصفحة الرئيسية
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title={pageData.metaTitle || `${pageData.title} | ${siteSettings?.siteName || 'FULLSCO'}`}
      description={pageData.metaDescription || `${pageData.title} - منصة المنح الدراسية`}
    >
      <Head>
        <meta property="og:title" content={pageData.metaTitle || pageData.title} />
        <meta property="og:description" content={pageData.metaDescription || `${pageData.title} - منصة المنح الدراسية`} />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}/pages/${pageData.slug}`} />
        {pageData.imageUrl && <meta property="og:image" content={pageData.imageUrl} />}
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={pageData.createdAt} />
        <meta property="article:modified_time" content={pageData.updatedAt} />
      </Head>

      <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 pt-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="container">
          <div className="mb-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {pageData.title}
            </h1>
            
            {/* خط فاصل مزخرف */}
            <div className="flex items-center justify-center">
              <div className="w-16 h-1 bg-primary rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-12">
        {/* صورة الصفحة (إذا وجدت) */}
        {pageData.imageUrl && (
          <div className="mb-8 relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
            <Image 
              src={pageData.imageUrl}
              alt={pageData.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* محتوى الصفحة */}
        <div className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
          <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
        </div>

        {/* وقت التحديث */}
        <div className="mt-12 text-sm text-gray-500 dark:text-gray-400 text-center">
          آخر تحديث: {new Date(pageData.updatedAt).toLocaleDateString('ar-EG')}
        </div>
      </div>
    </MainLayout>
  );
}

// استيراد قاعدة البيانات والمخططات
import { db } from '@/db';
import { pages as pagesTable } from '@/shared/schema';
import { eq } from 'drizzle-orm';

export const getServerSideProps: GetServerSideProps<PageProps> = async ({ params, res }) => {
  // تعيين مدة التخزين المؤقت - 30 دقيقة للصفحات الثابتة
  res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=600');
  
  if (!params?.slug || typeof params.slug !== 'string') {
    return {
      props: {
        page: null,
        error: 'معرف الصفحة غير صالح'
      }
    };
  }
  
  try {
    const slug = params.slug;
    console.log(`جلب بيانات الصفحة مع slug: ${slug}`);
    
    // استخدام قاعدة البيانات مباشرة
    const pageData = await db.select()
      .from(pagesTable)
      .where(eq(pagesTable.slug, slug))
      .limit(1);
    
    console.log(`تم العثور على ${pageData.length} صفحة`);
    
    // التحقق من وجود الصفحة
    if (!pageData || pageData.length === 0) {
      console.log(`لم يتم العثور على الصفحة: ${slug}`);
      return {
        props: {
          page: null,
          error: 'الصفحة غير موجودة'
        }
      };
    }
    
    const page = pageData[0];
    console.log(`تم العثور على الصفحة بالعنوان: ${page.title}`);
    
    // التحقق من حالة نشر الصفحة
    if (!page.isPublished) {
      return {
        props: {
          page: null,
          error: 'هذه الصفحة غير منشورة حاليًا'
        }
      };
    }
    
    // إعداد بيانات الصفحة
    const formattedPage = {
      ...page,
      createdAt: page.createdAt instanceof Date ? page.createdAt.toISOString() : page.createdAt,
      updatedAt: page.updatedAt instanceof Date ? page.updatedAt.toISOString() : page.updatedAt
    };
    
    return {
      props: {
        page: formattedPage
      }
    };
  } catch (error) {
    console.error('خطأ في تحميل الصفحة:', error);
    
    return {
      props: {
        page: null,
        error: 'حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى لاحقاً.'
      }
    };
  }
}