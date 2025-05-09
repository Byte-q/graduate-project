import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { pages } from '@/shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // نسمح فقط بطلبات GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ message: 'معرف الصفحة مطلوب' });
  }

  try {
    // الحصول على بيانات الصفحة من قاعدة البيانات
    const page = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);

    // إذا لم يتم العثور على الصفحة
    if (!page || page.length === 0) {
      console.log(`الصفحة غير موجودة: ${slug}`);
      return res.status(404).json({ message: 'الصفحة غير موجودة' });
    }

    const pageData = page[0];

    // إذا كانت الصفحة غير منشورة وليست في وضع المعاينة
    if (!pageData.isPublished && req.query.preview !== 'true') {
      console.log(`محاولة الوصول إلى صفحة غير منشورة: ${slug}`);
      return res.status(404).json({ message: 'الصفحة غير موجودة' });
    }

    // زيادة عدد مشاهدات الصفحة (اختياري)
    if (pageData.isPublished) {
      // يمكننا هنا تحديث عداد المشاهدات إذا كان ذلك مطلوبًا
    }

    // إضافة بيانات وقت الاستجابة للتتبع (اختياري)
    const responseTime = Date.now() - (req.headers['x-request-start'] ? parseInt(req.headers['x-request-start'] as string) : Date.now());
    console.log(`تم تحميل الصفحة ${slug} في ${responseTime}ms`);

    // تعيين رأس التخزين المؤقت - 30 دقيقة للصفحات الثابتة
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=600');
    
    // إرجاع بيانات الصفحة
    return res.status(200).json(pageData);
  } catch (error) {
    console.error('خطأ في تحميل الصفحة:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى لاحقاً.' });
  }
}