import { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import { ScholarshipCard } from '@/components/scholarships/ScholarshipCard';
import { CalendarClock, MapPin, GraduationCap, BookOpen, Briefcase, Clock, AlertCircle, Award, DollarSign, School, FileText, Share2, Bookmark, ExternalLink } from 'lucide-react';
import { useSiteSettings } from '@/contexts/site-settings-context';
import { safeObjectEntries, safeReduce } from '@/lib/utils';
import { detectLevelFromTitle, getSafeRelation } from '@/lib/scholarship-helpers';
import { apiGet } from '@/lib/api';

// دالة مساعدة لضمان أن تكون جميع قيم التاريخ مسلسلة بشكل صحيح
function serializeDate(date: any): string | null {
  if (!date) return null;
  
  try {
    if (date instanceof Date) {
      return date.toISOString();
    } else if (typeof date === 'string') {
      return new Date(date).toISOString();
    }
    return null;
  } catch (e) {
    console.warn(`Error serializing date: ${date}`, e);
    return null;
  }
}

// تعريف واجهة تفاصيل المنحة الدراسية
interface ScholarshipDetail {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  thumbnailUrl?: string;
  isFeatured: boolean;
  deadline: string;
  fundingType: string;
  studyDestination?: string;
  eligibilityCriteria?: string;
  applicationProcess?: string;
  benefits?: string;
  requirements?: string;
  categoryId?: number;
  countryId?: number;
  levelId?: number;
  category?: { id: number; name: string; slug: string };
  country?: { id: number; name: string; slug: string };
  level?: { id: number; name: string; slug: string };
  createdAt: string;
  updatedAt: string;
}

// تعريف واجهة المنح ذات الصلة
interface RelatedScholarship {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl?: string;
  deadline: string;
  isFeatured: boolean;
}

// تعريف واجهة خصائص صفحة تفاصيل المنحة
interface ScholarshipDetailPageProps {
  scholarship: ScholarshipDetail;
  relatedScholarships: RelatedScholarship[];
}

// مكون صفحة تفاصيل المنحة
export default function ScholarshipDetailPage({ 
  scholarship,
  relatedScholarships
}: ScholarshipDetailPageProps) {
  const router = useRouter();
  const { siteSettings } = useSiteSettings();
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // الوظائف
  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // يمكن هنا تنفيذ المنطق الخاص بحفظ المنحة في قائمة المحفوظات
  };
  
  const shareScholarship = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: scholarship.title,
          text: scholarship.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // نسخ الرابط إلى الحافظة إذا كانت ميزة المشاركة غير متوفرة
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط!');
    }
  };
  
  // تنسيق التاريخ
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'غير محدد';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'غير محدد';
    }
  };
  
  // إذا كانت الصفحة قيد التحميل
  if (router.isFallback) {
    return (
      <MainLayout title="جاري التحميل..." description="جاري تحميل تفاصيل المنحة الدراسية">
        <div className="container py-12">
          <div className="flex justify-center items-center h-80">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <h2 className="text-xl font-bold">جاري تحميل تفاصيل المنحة...</h2>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout title={`${scholarship.title} | ${siteSettings?.siteName || 'FULLSCO'}`} description={scholarship.description}>
      <Head>
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}/scholarships/${scholarship.slug}`} />
        <meta property="og:title" content={scholarship.title} />
        <meta property="og:description" content={scholarship.description} />
        {scholarship.thumbnailUrl && (
          <meta property="og:image" content={scholarship.thumbnailUrl} />
        )}
        <meta property="article:published_time" content={scholarship.createdAt} />
        <meta property="article:modified_time" content={scholarship.updatedAt} />
      </Head>
      
      {/* رأس الصفحة */}
      <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 pt-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="container">
          <nav className="flex mb-6 text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 space-x-reverse">
              <li className="inline-flex items-center">
                <Link href="/" className="hover:text-primary">
                  الرئيسية
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mx-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <Link href="/scholarships" className="hover:text-primary">
                  المنح الدراسية
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mx-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300" aria-current="page">
                  {scholarship.title.length > 30 ? `${scholarship.title.substring(0, 30)}...` : scholarship.title}
                </span>
              </li>
            </ol>
          </nav>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              {scholarship.isFeatured && (
                <div className="inline-block bg-amber-500 text-white text-sm px-3 py-1 rounded-full mb-4">
                  منحة مميزة
                </div>
              )}
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {scholarship.title}
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                {scholarship.description}
              </p>
              
              <div className="flex flex-wrap gap-3 mb-6">
                {scholarship.category && (
                  <Link href={`/scholarships?category=${scholarship.category.slug}`} className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                    <BookOpen className="w-4 h-4" />
                    {scholarship.category.name}
                  </Link>
                )}
                
                {scholarship.level && scholarship.level.slug && (
                  <Link href={`/scholarships?level=${scholarship.level.slug}`} className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-3 py-1.5 rounded-full text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                    <GraduationCap className="w-4 h-4" />
                    {scholarship.level.name || 'المستوى الأكاديمي'}
                  </Link>
                )}
                
                {scholarship.country && (
                  <Link href={`/scholarships?country=${scholarship.country.slug}`} className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1.5 rounded-full text-sm hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                    <MapPin className="w-4 h-4" />
                    {scholarship.country.name}
                  </Link>
                )}
                
                {scholarship.fundingType && (
                  <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-full text-sm">
                    <Award className="w-4 h-4" />
                    {scholarship.fundingType}
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:w-80 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    الموعد النهائي
                  </h3>
                  <div className="text-lg font-medium text-red-600 dark:text-red-400">
                    {formatDate(scholarship.deadline)}
                  </div>
                </div>
                
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-sm text-gray-500 dark:text-gray-400 mb-1">بلد الدراسة:</span>
                      <span className="font-medium">{scholarship.country?.name || scholarship.studyDestination || 'غير محدد'}</span>
                    </div>
                  </li>
                  
                  <li className="flex gap-3">
                    <School className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-sm text-gray-500 dark:text-gray-400 mb-1">المستوى الدراسي:</span>
                      <span className="font-medium">{scholarship.level?.name || 'جميع المستويات'}</span>
                    </div>
                  </li>
                  
                  <li className="flex gap-3">
                    <Award className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-sm text-gray-500 dark:text-gray-400 mb-1">نوع التمويل:</span>
                      <span className="font-medium">{scholarship.fundingType}</span>
                    </div>
                  </li>
                </ul>
                
                <div className="border-t border-gray-200 dark:border-gray-700 mt-5 pt-5">
                  <a 
                    href={`https://www.google.com/search?q=${encodeURIComponent(scholarship.title + ' ' + scholarship.studyDestination + ' application')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex justify-center items-center gap-2 w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                  >
                    <ExternalLink className="w-5 h-5" />
                    تقديم طلب المنحة
                  </a>
                </div>
                
                <div className="mt-4 flex justify-between">
                  <button 
                    onClick={toggleBookmark}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium ${isBookmarked ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 dark:fill-amber-400' : ''}`} />
                    {isBookmarked ? 'محفوظة' : 'حفظ'}
                  </button>
                  
                  <button 
                    onClick={shareScholarship}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium dark:bg-gray-700 dark:text-gray-300"
                  >
                    <Share2 className="w-4 h-4" />
                    مشاركة
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* المحتوى */}
      <div className="container py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            {/* محتوى المنحة الدراسية */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                معلومات المنحة
              </h2>
              
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <div dangerouslySetInnerHTML={{ __html: scholarship.content }} />
              </div>
            </div>
            
            {/* معلومات إضافية */}
            <div className="grid md:grid-cols-2 gap-6">
              {scholarship.requirements && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    المتطلبات
                  </h3>
                  <div className="prose prose-lg max-w-none dark:prose-invert">
                    <div dangerouslySetInnerHTML={{ __html: scholarship.requirements }} />
                  </div>
                </div>
              )}
              
              {scholarship.eligibilityCriteria && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-gray-500" />
                    معايير الأهلية
                  </h3>
                  <div className="prose prose-lg max-w-none dark:prose-invert">
                    <div dangerouslySetInnerHTML={{ __html: scholarship.eligibilityCriteria }} />
                  </div>
                </div>
              )}
              
              {scholarship.applicationProcess && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    إجراءات التقديم
                  </h3>
                  <div className="prose prose-lg max-w-none dark:prose-invert">
                    <div dangerouslySetInnerHTML={{ __html: scholarship.applicationProcess }} />
                  </div>
                </div>
              )}
              
              {scholarship.benefits && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-gray-500" />
                    المميزات
                  </h3>
                  <div className="prose prose-lg max-w-none dark:prose-invert">
                    <div dangerouslySetInnerHTML={{ __html: scholarship.benefits }} />
                  </div>
                </div>
              )}
            </div>
            
            {/* منح ذات صلة */}
            {relatedScholarships && relatedScholarships.length > 0 && (
              <div className="mt-10">
                <h3 className="text-2xl font-bold mb-6">
                  منح دراسية ذات صلة
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedScholarships.map((related) => (
                    <ScholarshipCard 
                      key={related.id}
                      scholarship={related}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* الجانب */}
          <div className="lg:w-1/3">
            {/* قسم التقديم */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6" id="apply">
              <h3 className="text-xl font-bold mb-4">
                طريقة التقديم على المنحة
              </h3>
              
              <div className="space-y-4 mb-6">
                <p>
                  تأكد من استيفاء جميع المتطلبات المذكورة قبل تقديم طلبك. اتبع الإرشادات المذكورة في موقع المنحة الرسمي.
                </p>
                
                <div className="flex flex-col space-y-2">
                  <strong className="block mb-1">موعد نهائي للتقديم:</strong>
                  <div className="flex items-center">
                    <CalendarClock className="w-5 h-5 mr-2 text-red-500" />
                    <span className="text-red-600 font-medium">
                      {formatDate(scholarship.deadline)}
                    </span>
                  </div>
                </div>
              </div>
              
              <a 
                href={`https://www.google.com/search?q=${encodeURIComponent(scholarship.title + ' ' + scholarship.studyDestination + ' application')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex justify-center items-center gap-2 w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
              >
                <ExternalLink className="w-5 h-5" />
                الانتقال إلى موقع التقديم
              </a>
            </div>
            
            {/* دليل سريع */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold mb-4">
                نصائح للتقديم
              </h3>
              
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-800 dark:text-blue-300 font-medium">1</span>
                  </div>
                  <div>
                    <strong className="block mb-1">اقرأ متطلبات المنحة بعناية</strong>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      تأكد من فهمك لجميع المعايير والمؤهلات المطلوبة قبل تقديم طلبك.
                    </p>
                  </div>
                </li>
                
                <li className="flex gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-800 dark:text-blue-300 font-medium">2</span>
                  </div>
                  <div>
                    <strong className="block mb-1">جهز الوثائق اللازمة</strong>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      جهز نسخ جديدة من جميع الشهادات والمستندات المطلوبة بتنسيق واضح.
                    </p>
                  </div>
                </li>
                
                <li className="flex gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-800 dark:text-blue-300 font-medium">3</span>
                  </div>
                  <div>
                    <strong className="block mb-1">قدم قبل الموعد النهائي</strong>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      لا تنتظر حتى آخر لحظة. قدم طلبك مبكرًا لتجنب أي مشكلات تقنية أو تأخيرات غير متوقعة.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// جلب البيانات من الخادم
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const slug = params?.slug as string;
    console.log(`جلب بيانات المنحة مع slug: ${slug}`);
    
    if (!slug) {
      return {
        notFound: true
      };
    }
    
    // استخدام وحدة API الجديدة
    console.log(`استدعاء API للحصول على المنحة: ${slug}`);
    
    let scholarshipDD = null;
    let relatedScholarships = [];
    let scholarshipData = [];
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      // نستخدم المسار الكامل مع بادئة /server/api/ للتوافق مع Express
      console.log(`Using URL: ${API_BASE_URL}/scholarships/by-slug/${slug}`);
      scholarshipDD = await apiGet(`/scholarships/slug/${slug}`);
      scholarshipData = scholarshipDD.data;

      // محاولة الحصول على المنح ذات الصلة
      if (scholarshipData && scholarshipData.related) {
        relatedScholarships = scholarshipData.related;
      } else if (scholarshipData && scholarshipData._id) {
        // إذا لم يتم توفير المنح ذات الصلة من API، نحاول الحصول عليها بشكل منفصل
        console.log(`محاولة الحصول على المنح ذات الصلة للمنحة ${scholarshipData.id}`);
        try {
          let relatedData = await apiGet(`/scholarships/${scholarshipData._id}`);
          if (relatedData && Array.isArray(relatedData)) {
            relatedScholarships = relatedData;
          }
        } catch (relatedError) {
          console.error('فشل في الحصول على المنح ذات الصلة:', relatedError);
          // الاستمرار بدون منح ذات صلة
        }
      }
      
      console.log(`تم الحصول على المنحة الدراسية بنجاح من API: ${scholarshipData?.title || 'غير معروف'}`);
    } catch (apiError) {
      console.error('فشل في الحصول على المنحة من API:', apiError);
      return { notFound: true };
    }
    
    // التحقق من وجود المنحة
    if (!scholarshipData) {
      console.log(`لم يتم العثور على المنحة الدراسية: ${slug}`);
      return { notFound: true };
    }
    
    const scholarship = scholarshipData;
    
    // اذا كان البيانات المعادة من API ليست منسقة بشكل صحيح، نقوم بتنسيقها
    const safeScholarship = typeof scholarship === 'object' && scholarship !== null ? scholarship : {};
    
    // تنسيق البيانات لضمان التوافق مع واجهة التفاصيل المطلوبة
    const formattedScholarship = {
      ...safeScholarship,
      // التأكد من وجود الحقول المطلوبة
      id: safeScholarship._id || 0,
      title: safeScholarship.title || '',
      slug: safeScholarship.slug || slug,
      description: safeScholarship.description || '',
      content: safeScholarship.content || safeScholarship.description || '',
      thumbnailUrl: safeScholarship.thumbnailUrl || safeScholarship.imageUrl || null,
      isFeatured: !!safeScholarship.isFeatured,
      deadline: (() => {
        try { return serializeDate(safeScholarship.deadline) || safeScholarship.deadline || null; } 
        catch (e) { console.error('خطأ في معالجة الموعد النهائي:', e); return null; }
      })(),
      fundingType: safeScholarship.isFullyFunded ? "ممول بالكامل" : "غير ممول بالكامل",
      studyDestination: safeScholarship.studyDestination || null,
      eligibilityCriteria: safeScholarship.eligibilityCriteria || null,
      applicationProcess: safeScholarship.applicationProcess || null,
      benefits: safeScholarship.benefits || null,
      requirements: safeScholarship.requirements || null,
      category: safeScholarship.category || null,
      country: safeScholarship.country || null,
      level: safeScholarship.level || {
        id: 0,
        name: 'جميع المستويات',
        slug: 'all-levels'
      },
      // ضمان تنسيق التواريخ
      createdAt: (() => {
        try { return serializeDate(safeScholarship.createdAt) || new Date().toISOString(); } 
        catch (e) { console.error('خطأ في معالجة تاريخ الإنشاء:', e); return new Date().toISOString(); }
      })(),
      updatedAt: (() => {
        try { return serializeDate(safeScholarship.updatedAt) || new Date().toISOString(); } 
        catch (e) { console.error('خطأ في معالجة تاريخ التحديث:', e); return new Date().toISOString(); }
      })()
    };
    
    // تنسيق المنح ذات الصلة
    const formattedRelatedScholarships = Array.isArray(relatedScholarships) 
      ? safeReduce(
          relatedScholarships,
          (acc, relatedItem) => {
            if (!relatedItem || typeof relatedItem !== 'object') return acc;
            
            try {
              const item = relatedItem as {
                id?: number;
                title?: string;
                slug?: string;
                thumbnailUrl?: string;
                imageUrl?: string;
                deadline?: string;
                isFeatured?: boolean;
              };
              acc.push({
                id: item.id || 0,
                title: item.title || '',
                slug: item.slug || '',
                thumbnailUrl: item.thumbnailUrl || item.imageUrl || null,
                deadline: item.deadline || null,
                isFeatured: !!item.isFeatured
              });
            } catch (err) {
              console.error('خطأ في معالجة منحة ذات صلة:', err);
            }
            
            return acc;
          },
          [] as Array<{
            id: number;
            title: string;
            slug: string;
            thumbnailUrl: string | null;
            deadline: string | null;
            isFeatured: boolean;
          }>
        )
      : [];
    
    return {
      props: {
        scholarship: formattedScholarship,
        relatedScholarships: formattedRelatedScholarships || []
      }
    };
  } catch (error) {
    console.error('Error fetching scholarship details:', error);
    
    return {
      notFound: true
    };
  }
};