import React from 'react';
import { GetServerSideProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, ArrowRight, GraduationCap, MapPin } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { db } from '@/server/db';
import { successStories } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { formatDate } from '@/lib/utils';

interface SuccessStoryDetailsProps {
  story: {
    id: number;
    title: string;
    slug: string;
    content?: string;
    excerpt?: string;
    studentName?: string;
    name?: string;
    country?: string;
    university?: string;
    imageUrl?: string;
    thumbnailUrl?: string;
    graduationYear?: string;
    scholarshipName?: string;
    degree?: string;
    createdAt: string | Date;
    updatedAt: string | Date;
  };
}

export default function SuccessStoryDetailPage({ story }: SuccessStoryDetailsProps) {
  if (!story) {
    return (
      <MainLayout title="قصة النجاح غير موجودة" description="لا يمكن العثور على قصة النجاح المطلوبة">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">قصة النجاح غير موجودة</h1>
            <p className="mb-6">عذراً، لا يمكن العثور على قصة النجاح المطلوبة. قد تكون قد تم حذفها أو تغيير عنوانها.</p>
            <Link
              href="/success-stories"
              className="inline-flex items-center bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md transition-colors"
            >
              <ArrowRight className="ml-2 w-5 h-5" />
              العودة إلى قصص النجاح
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  // استخدام الاسم من أي من الحقلين المتاحين
  const studentNameDisplay = story.name || story.studentName || 'صاحب القصة';

  return (
    <MainLayout
      title={`قصة نجاح ${studentNameDisplay} - ${story.title}`}
      description={story.excerpt || story.content?.substring(0, 160).replace(/<[^>]*>/g, '')}
    >
      <div className="container mx-auto px-4 py-8">
        <article className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          {/* صورة قصة النجاح */}
          <div className="relative h-80 md:h-96 w-full bg-gray-200 dark:bg-gray-700">
            {story.imageUrl ? (
              <Image
                src={story.imageUrl}
                alt={story.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <span className="text-gray-400">لا توجد صورة</span>
              </div>
            )}
          </div>
          
          {/* معلومات قصة النجاح */}
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">{story.title}</h1>
            <p className="text-xl text-primary-600 dark:text-primary-400 mb-6">{studentNameDisplay}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              {story.scholarshipName && (
                <div className="flex items-center">
                  <GraduationCap className="w-5 h-5 ml-2 text-primary-600 dark:text-primary-400" />
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-sm">المنحة:</span>
                    <span className="font-medium">{story.scholarshipName}</span>
                  </div>
                </div>
              )}
              
              {story.university && (
                <div className="flex items-center">
                  <GraduationCap className="w-5 h-5 ml-2 text-primary-600 dark:text-primary-400" />
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-sm">الجامعة:</span>
                    <span className="font-medium">{story.university}</span>
                  </div>
                </div>
              )}
              
              {story.country && (
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 ml-2 text-primary-600 dark:text-primary-400" />
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-sm">الدولة:</span>
                    <span className="font-medium">{story.country}</span>
                  </div>
                </div>
              )}
              
              {story.graduationYear && (
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 ml-2 text-primary-600 dark:text-primary-400" />
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-sm">سنة التخرج:</span>
                    <span className="font-medium">{story.graduationYear}</span>
                  </div>
                </div>
              )}
              
              {story.degree && (
                <div className="flex items-center">
                  <GraduationCap className="w-5 h-5 ml-2 text-primary-600 dark:text-primary-400" />
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-sm">الدرجة العلمية:</span>
                    <span className="font-medium">{story.degree}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* محتوى قصة النجاح */}
            <div
              className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-img:rounded-md"
              dangerouslySetInnerHTML={{ __html: story.content || '' }}
            />
            
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                تم النشر: {formatDate(story.createdAt)}
              </p>
            </div>
          </div>
        </article>
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
    // استراتيجية جديدة: استخدام قاعدة البيانات مباشرة لتجنب الطلبات المتكررة للـ API
    console.log(`Direct database query for success story: ${slug}`);
    
    // استعلام لقصة النجاح بناءً على الاسم المستعار (slug)
    const storyResult = await db
      .select()
      .from(successStories)
      .where(eq(successStories.slug, slug))
      .limit(1);
    
    if (!storyResult || storyResult.length === 0) {
      console.log(`Success story not found: ${slug}`);
      return { notFound: true };
    }
    
    const story = storyResult[0];
    
    // تنسيق البيانات للعرض
    const formattedStory = {
      ...story,
      // ضمان توافق الحقول الأساسية
      content: story.content || '',
      imageUrl: story.imageUrl || null,
      thumbnailUrl: story.thumbnailUrl || story.imageUrl || null,
      name: story.name || story.studentName || null,
      studentName: story.studentName || story.name || null,
      // ضمان توافق تنسيق التاريخ
      createdAt: story.createdAt ? new Date(story.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: story.updatedAt ? new Date(story.updatedAt).toISOString() : new Date().toISOString()
    };
    
    // تحسين الأداء: إضافة خيار التخزين المؤقت Cache-Control لمدة ساعة
    context.res.setHeader(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=59'
    );
    
    // تحويل البيانات إلى صيغة يمكن تمثيلها كـ JSON
    return {
      props: {
        story: JSON.parse(JSON.stringify(formattedStory))
      }
    };
  } catch (error) {
    console.error(`Error in getServerSideProps for success story slug ${slug}:`, error);
    
    // في حالة الخطأ، نعيد صفحة 404
    return { notFound: true };
  }
};