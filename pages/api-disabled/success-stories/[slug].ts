import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { successStories } from '@/shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // استخراج slug من المعلمات
  const { slug } = req.query;
  
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'يجب توفير معرف قصة النجاح (slug)'
    });
  }
  
  try {
    // تحسين الأداء: إضافة رأس التخزين المؤقت Cache-Control
    // يسمح بتخزين الاستجابة لمدة ساعة واحدة
    res.setHeader(
      'Cache-Control',
      'public, max-age=3600, s-maxage=3600, stale-while-revalidate=59'
    );
    
    // البحث عن قصة النجاح بواسطة slug
    const storyResult = await db
      .select()
      .from(successStories)
      .where(eq(successStories.slug, slug))
      .limit(1);
    
    if (!storyResult || storyResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'قصة النجاح غير موجودة'
      });
    }
    
    const story = storyResult[0];
    
    // تنسيق البيانات للاستجابة
    const formattedStory = {
      ...story,
      name: story.studentName || story.name || null, // ضمان وجود الاسم
      studentName: story.studentName || story.name || null, // ضمان وجود الاسم
      
      // ضمان وجود البيانات الأساسية
      imageUrl: story.imageUrl || null,
      content: story.content || '',
      scholarshipName: story.scholarshipName || null,
      university: story.university || null,
      country: story.country || null,
      degree: story.degree || null,
      graduationYear: story.graduationYear || null
    };
    
    return res.status(200).json({
      success: true,
      story: formattedStory
    });
  } catch (error) {
    console.error('خطأ في جلب قصة النجاح:', error);
    
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات قصة النجاح'
    });
  }
}