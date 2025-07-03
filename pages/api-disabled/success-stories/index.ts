import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { successStories, type SuccessStory } from '@/shared/schema';
import { desc, eq, like, sql, and } from 'drizzle-orm';

interface SuccessStoriesResponse {
  stories: SuccessStory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessStoriesResponse | { error: string }>
) {
  // التحقق من طريقة الطلب
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // تحسين الأداء: إضافة رأس التخزين المؤقت Cache-Control
  // استخدام وقت أقصر للتخزين المؤقت في حالة طلبات البحث
  if (req.query.search) {
    res.setHeader(
      'Cache-Control',
      'public, max-age=300, s-maxage=600, stale-while-revalidate=59'
    );
  } else {
    res.setHeader(
      'Cache-Control',
      'public, max-age=1800, s-maxage=3600, stale-while-revalidate=59'
    );
  }

  try {
    // استخراج معلمات الاستعلام
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const search = req.query.search as string || '';
    const offset = (page - 1) * limit;
    
    console.log(`API: استلام طلب لقصص النجاح - صفحة ${page}, حد ${limit}${search ? `, بحث: ${search}` : ''}`);

    // ملاحظة: نستخدم الرؤوس التي تم تعيينها أعلاه بناءً على وجود معلمات البحث
    
    // بناء استعلام للبحث
    const conditions = [eq(successStories.isPublished, true)];
    if(search) conditions.push(like(successStories.title, `%${search}%`));
    const query = db.select().from(successStories).where(and(...conditions));
    
    // الحصول على إجمالي عدد القصص التي تطابق شروط البحث
    const countConditions = [eq(successStories.isPublished, true)];
    if(search) countConditions.push(like(successStories.title, `%${search}%`));
    const countQuery = db.select({ count: sql<number>`count(*)` }).from(successStories)
      .where(eq(successStories.isPublished, true));
    
    const [{ count }] = await countQuery;
    
    // إعادة الاستعلام الأصلي مع الترتيب والتحديد
    const results = await query
      .orderBy(desc(successStories.createdAt))
      .limit(limit)
      .offset(offset);
    
    // تحسين الأداء: تجهيز البيانات وضمان توافقها
    const formattedResults = results.map(story => ({
      ...story,
      content: story.content ? story.content.substring(0, 300) : '', // نقصر المحتوى لتحسين الأداء في القائمة
      imageUrl: story.imageUrl || '',
      thumbnailUrl: story.thumbnailUrl || story.imageUrl || '',
      name: story.name || story.studentName || '',
      studentName: story.studentName || story.name || ''
    }));
    
    // حساب عدد الصفحات
    const totalPages = Math.ceil(count / limit);
    
    // تسجيل نجاح العملية
    console.log(`API Success Stories: تم العثور على ${results.length} قصة نجاح`);
    
    // إرجاع النتائج
    return res.status(200).json({
      stories: formattedResults,
      total: count,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    console.error('خطأ في الحصول على قصص النجاح:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء معالجة الطلب' });
  }
}