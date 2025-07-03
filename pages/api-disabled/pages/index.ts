import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { pages } from '@/shared/schema';
import { desc, sql, eq } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // نسمح فقط بطلبات GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // معلمات الاستعلام
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;
    const showUnpublished = req.query.unpublished === 'true' ? true : false;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';
    const menu = req.query.menu as string;

    // بناء شروط الاستعلام
    const whereConditions = [];
    if (!showUnpublished) {
      whereConditions.push(eq(pages.isPublished, true));
    }
    // إضافة فلتر القائمة (إذا كان مطلوبًا)
    if (menu) {
      // في هذه الحالة، نفترض أن هناك علاقة بين الصفحات والقوائم
      // ويمكن تنفيذ هذا الجزء بناءً على تصميم قاعدة البيانات
    }

    // تنفيذ استعلام الإحصاء
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(pages)
      .where(whereConditions.length > 0 ? sql.join(whereConditions, sql` AND `) : undefined);

    // إضافة الترتيب والحد والإزاحة للاستعلام الرئيسي
    const validSortColumns = [
      'id',
      'title',
      'slug',
      'metaTitle',
      'metaDescription',
      'imageUrl',
      'isPublished',
      'createdAt',
      'updatedAt'
    ] as const;
    const sortColumn = validSortColumns.includes(sortBy as any) ? sortBy : 'createdAt';
    // Ensure orderColumn is a column, not the table itself
    const orderColumn = (pages as Record<string, any>)[sortColumn];

    if (!orderColumn) {
      throw new Error('Invalid sort column');
    }

    const items = await db
      .select({
        id: pages.id,
        title: pages.title,
        slug: pages.slug,
        metaTitle: pages.metaTitle,
        metaDescription: pages.metaDescription,
        imageUrl: pages.imageUrl,
        isPublished: pages.isPublished,
        createdAt: pages.createdAt,
        updatedAt: pages.updatedAt,
        excerpt: sql<string>`SUBSTRING(${pages.content}, 1, 200)`
      })
      .from(pages)
      .where(whereConditions.length > 0 ? sql.join(whereConditions, sql` AND `) : undefined)
      .orderBy(sortOrder === 'asc' ? orderColumn : desc(orderColumn))
      .limit(limit)
      .offset(offset);

    // إعداد الاستجابة
    const totalItems = Number(count);
    const totalPages = Math.ceil(totalItems / limit);

    // تعيين رأس التخزين المؤقت
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');

    // إرجاع البيانات
    return res.status(200).json({
      items,
      meta: {
        totalItems,
        itemsPerPage: limit,
        currentPage: page,
        totalPages
      }
    });
  } catch (error) {
    console.error('خطأ في تحميل الصفحات:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء تحميل الصفحات. يرجى المحاولة مرة أخرى لاحقاً.' });
  }
}