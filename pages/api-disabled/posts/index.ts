import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { posts, type Post } from '@/shared/schema';
import { desc, eq, like, sql } from 'drizzle-orm';

interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PostsResponse | { error: string }>
) {
  // تسجيل طلب API للمقالات
  console.log('API: استلام طلب للمقالات');

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
    const featured = req.query.featured === 'true';
    const offset = (page - 1) * limit;
    
    // بناء استعلام للبحث
    let query = db.select().from(posts);
    
    // إضافة شروط البحث إذا كانت موجودة
    if (search) {
      query = query.where(like(posts.title, `%${search}%`));
    }
    
    // إضافة شرط المقالات المميزة إذا طُلب
    if (featured) {
      query = query.where(eq(posts.isFeatured, true));
    }
    
    // تعيين حالة المقالات إلى "published" فقط للعرض العام
    query = query.where(eq(posts.status, 'published'));
    
    // الحصول على إجمالي عدد المقالات التي تطابق شروط البحث
    const countQuery = db.select({ count: sql<number>`count(*)` }).from(posts)
      .where(eq(posts.status, 'published'));
    
    if (search) {
      countQuery.where(like(posts.title, `%${search}%`));
    }
    if (featured) {
      countQuery.where(eq(posts.isFeatured, true));
    }
    
    const [{ count }] = await countQuery;
    
    // إعادة الاستعلام الأصلي مع الترتيب والتحديد
    const results = await query
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
    
    // حساب عدد الصفحات
    const totalPages = Math.ceil(count / limit);
    
    // تسجيل نجاح العملية
    console.log(`API Posts: تم العثور على ${results.length} مقال`);
    
    // إرجاع النتائج
    return res.status(200).json({
      posts: results,
      total: count,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    console.error('خطأ في الحصول على المقالات:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء معالجة الطلب' });
  }
}