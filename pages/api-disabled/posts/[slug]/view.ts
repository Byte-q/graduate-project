import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { posts } from '@/shared/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * تحديث عدد مشاهدات المقال
 * 
 * @param req طلب العميل
 * @param res رد الخادم
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // نتأكد من أن الطلب هو POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'طريقة غير مسموح بها. استخدم POST.' });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ message: 'لم يتم تحديد اسم المقال بشكل صحيح.' });
  }

  try {
    // البحث عن المقال بناءً على slug
    const postResult = await db
      .select()
      .from(posts)
      .where(eq(posts.slug, slug))
      .limit(1);

    if (!postResult || postResult.length === 0) {
      return res.status(404).json({ message: 'المقال غير موجود.' });
    }

    // استخدام معاملات SQL مباشرة للتحديث (لأمان أكثر)
    await db
      .update(posts)
      .set({ views: sql`${posts.views} + 1` })
      .where(eq(posts.id, postResult[0].id));

    // إرجاع استجابة ناجحة
    return res.status(200).json({ success: true, message: 'تم تحديث عدد المشاهدات بنجاح.' });
  } catch (error) {
    console.error('Error updating view count:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء تحديث عدد المشاهدات.', error: String(error) });
  }
}