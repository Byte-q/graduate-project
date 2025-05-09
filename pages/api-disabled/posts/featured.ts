import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { posts, type Post } from '@/shared/schema';
import { desc, eq } from 'drizzle-orm';

interface FeaturedPostsResponse {
  posts: Post[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FeaturedPostsResponse | { error: string }>
) {
  // تسجيل طلب API للمقالات المميزة
  console.log('API: استلام طلب للمقالات المميزة');

  // التحقق من طريقة الطلب
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // الحصول على المقالات المميزة
    const limit = Number(req.query.limit) || 6;
    
    const featuredPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.isFeatured, true))
      .where(eq(posts.status, 'published'))
      .orderBy(desc(posts.createdAt))
      .limit(limit);

    // تسجيل نجاح العملية
    console.log(`API Featured Posts: تم العثور على ${featuredPosts.length} مقال مميز`);

    // إرجاع النتائج
    return res.status(200).json({ posts: featuredPosts });
  } catch (error) {
    console.error('خطأ في الحصول على المقالات المميزة:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء معالجة الطلب' });
  }
}