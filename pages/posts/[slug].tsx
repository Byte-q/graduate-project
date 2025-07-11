import React, { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { Calendar, User, ArrowRight, Tag, Eye, Share2, Clock, ArrowLeft } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { formatDate } from '@/lib/utils';
import { OptimizedImage } from '@/components/OptimizedImage';
import { apiGet, apiPost } from '@/lib/api';

interface PostDetailsProps {
  post: {
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
    tags?: string[];
    createdAt: string | Date;
    updatedAt: string | Date;
    category?: { id: number; name: string; slug: string; };
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    focusKeyword?: string;
  };
}

export default function PostDetailPage({ post }: PostDetailsProps) {
  // حالة لإدارة عرض زر نسخ رابط المشاركة
  const [copied, setCopied] = useState(false);
  
  if (!post) {
    return (
      <MainLayout title="المقال غير موجود" description="لا يمكن العثور على المقال المطلوب">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">المقال غير موجود</h1>
            <p className="mb-6">عذراً، لا يمكن العثور على المقال المطلوب. قد يكون قد تم حذفه أو تغيير عنوانه.</p>
            <Link 
              href="/posts"
              className="inline-flex items-center bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md transition-colors"
            >
              <ArrowRight className="ml-2 w-5 h-5" />
              العودة إلى قائمة المقالات
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // تحديث عدد المشاهدات عند تحميل الصفحة - فقط مرة واحدة
  useEffect(() => {
    // استخدام متغير عام للتأكد من عدم تكرار الطلب بين عمليات إعادة التقديم
    if (typeof window !== 'undefined') {
      // تحقق مما إذا كان هذا المقال قد تمت زيادة مشاهداته بالفعل في هذه الجلسة
      const viewedPosts = JSON.parse(sessionStorage.getItem('viewedPosts') || '{}');
      
      if (!viewedPosts[post.slug]) {
        // إضافة هذا المقال إلى القائمة المخزنة مؤقتًا
        viewedPosts[post.slug] = true;
        sessionStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
        
        // تنفيذ الطلب بشكل غير متزامن باستخدام وحدة API الجديدة
        setTimeout(async () => {
          try {
            await apiPost(`posts/${post.slug}/view`);
            console.log('View count updated successfully');
          } catch (error) {
            console.error('Error updating view count:', error);
          }
        }, 1000);
      }
    }
    
    // إضافة معالج للتمرير السلس للروابط الداخلية (أقسام المقال)
    const handleHashChange = () => {
      const id = window.location.hash.replace('#', '');
      if (id) {
        const element = document.getElementById(id);
        if (element) {
          // تأخير صغير للسماح للعناصر بالتحميل
          setTimeout(() => {
            window.scrollTo({
              top: element.offsetTop - 100,
              behavior: 'smooth',
            });
          }, 100);
        }
      }
    };
    
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [post.slug]);
  
  // تنظيف وتحسين محتوى المقال (إضافة معرفات للعناوين)
  const enhanceContent = () => {
    if (!post.content) return '';
    
    // إضافة معرفات للعناوين داخل المحتوى
    let enhancedContent = post.content.replace(
      /<h([1-6])[^>]*>(.*?)<\/h\1>/g,
      (match, level, content) => {
        const id = content
          .replace(/<[^>]*>/g, '') // إزالة العلامات HTML
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-') // استبدال المسافات بشرطات
          .replace(/[^\u0621-\u064A\w-]/g, ''); // الاحتفاظ فقط بالحروف العربية والإنجليزية والأرقام والشرطات
        
        return `<h${level} id="${id}">${content}</h${level}>`;
      }
    );
    
    return enhancedContent;
  };
  
  // نسخ رابط المشاركة
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // حساب وقت القراءة التقريبي
  const calculateReadingTime = () => {
    if (!post.content) return 1;
    
    // متوسط سرعة القراءة: 200 كلمة بالدقيقة
    const wordCount = post.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    return readingTime || 1;
  };
  
  // تحويل التاريخ إلى كائن Date صالح
  const getValidDate = (dateStr: string | Date) => {
    if (!dateStr) return new Date();
    if (dateStr instanceof Date) return dateStr;
    return new Date(dateStr);
  };

  return (
    <MainLayout
      title={post.metaTitle || post.title}
      description={post.metaDescription || post.excerpt || post.content?.substring(0, 160).replace(/<[^>]*>/g, '')}
    >
      <div className="bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-900 py-6">
        <div className="container mx-auto px-4">
          <article className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            {/* صورة المقال */}
            <div className="relative h-80 md:h-96 w-full bg-gray-200 dark:bg-gray-700">
              <OptimizedImage
                src={post.imageUrl}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 800px"
                loading="eager"
                quality={85}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+"
              />
            </div>
            
            {/* معلومات المقال */}
            <div className="p-6 md:p-8">
              {/* التصنيف */}
              {post.category && (
                <div className="mb-4">
                  <Link 
                    href={`/posts?category=${post.category.slug}`}
                    className="inline-block bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100 px-3 py-1 rounded-md text-sm font-medium hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
                  >
                    {post.category.name}
                  </Link>
                </div>
              )}
              
              {/* العنوان */}
              <h1 className="text-2xl md:text-4xl font-bold mb-6 leading-tight">{post.title}</h1>
              
              {/* معلومات المنشور */}
              <div className="flex flex-wrap gap-4 items-center text-sm text-gray-500 dark:text-gray-400 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 ml-1" />
                  <time dateTime={getValidDate(post.createdAt).toISOString()}>
                    {formatDate(post.createdAt)}
                  </time>
                </div>
                
                <div className="flex items-center">
                  <User className="w-4 h-4 ml-1" />
                  <span>{post.authorName || 'كاتب المقال'}</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="w-4 h-4 ml-1" />
                  <span>{calculateReadingTime()} دقائق للقراءة</span>
                </div>
                
                <div className="flex items-center">
                  <Eye className="w-4 h-4 ml-1" />
                  <span>{post.viewCount || 0} مشاهدة</span>
                </div>
                
                <button 
                  onClick={handleShare}
                  className="flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors ml-auto"
                  aria-label="مشاركة المقال"
                >
                  <Share2 className="w-4 h-4 ml-1" />
                  <span>{copied ? 'تم النسخ!' : 'مشاركة'}</span>
                </button>
              </div>
              
              {/* ملخص المقال */}
              {post.excerpt && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg italic text-gray-700 dark:text-gray-300 text-sm">
                  {post.excerpt}
                </div>
              )}
              
              {/* محتوى المقال - مع دعم الانتقال السلس بين الأقسام */}
              <div
                className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:scroll-mt-20 prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-img:rounded-md"
                dangerouslySetInnerHTML={{ __html: enhanceContent() }}
              />
              
              {/* الوسوم */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">الوسوم:</span>
                    {post.tags.map((tag, index) => (
                      <Link 
                        key={index} 
                        href={`/posts?tag=${encodeURIComponent(tag)}`}
                        className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {/* أزرار التنقل */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link 
                  href="/posts"
                  className="inline-flex items-center bg-primary text-white hover:bg-primary-dark py-2 px-4 rounded-md transition-colors"
                >
                  <ArrowLeft className="ml-2 w-5 h-5" />
                  العودة إلى قائمة المقالات
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params || {};
  
  if (!slug || typeof slug !== 'string') {
    return { notFound: true };
  }
  
  try {
    // استخدام وحدة API الجديدة
    console.log(`Fetching post data for: ${slug}`);
    
    let post = null;
    
    try {
      // محاولة استخدام API للحصول على المقال مع مسار Express المحدث
      console.log(`Using server/api path for post details`);
      post = await apiGet(`/server/api/posts/${slug}`);
      console.log(`Successfully fetched post data from API for: ${slug}`);
    } catch (error) {
      console.error(`API request failed for post: ${slug}`, error);
      
      // في حالة فشل API، نعيد صفحة 404
      return { notFound: true };
    }
    
    if (!post) {
      console.log(`Post not found: ${slug}`);
      return { notFound: true };
    }
    
    // تحسين الأداء: إضافة خيار التخزين المؤقت Cache-Control
    context.res.setHeader(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=59'
    );
    
    // تحويل البيانات إلى صيغة يمكن تمثيلها كـ JSON
    return {
      props: {
        post: JSON.parse(JSON.stringify(post))
      }
    };
  } catch (error) {
    console.error(`Error in getServerSideProps for post slug ${slug}:`, error);
    
    // في حالة الخطأ، نعيد صفحة 404
    return { notFound: true };
  }
};