import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { categories, scholarships } from '@/shared/schema';
import { eq, sql, count } from 'drizzle-orm';

/**
 * واجهة برمجة التطبيقات لتفاصيل التصنيف
 * تتيح جلب تفاصيل تصنيف محدد والمنح المرتبطة به
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`API Request: GET /categories/${req.query.slug}`);
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'طريقة الطلب غير مدعومة' });
  }

  try {
    const { slug } = req.query;
    
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'معرّف التصنيف غير صالح' });
    }

    // جلب تفاصيل التصنيف
    const categoryData = await db
      .select()
      .from(categories)
      .where(sql`${categories.slug} = ${slug}`)
      .limit(1);

    if (!categoryData || categoryData.length === 0) {
      return res.status(404).json({ error: 'التصنيف غير موجود' });
    }

    const category = categoryData[0];

    // استخراج معلمات الترقيم للمنح
    const { page = '1', limit = '10' } = req.query;
    const pageNumber = parseInt(page.toString(), 10);
    const limitNumber = parseInt(limit.toString(), 10);
    const offset = (pageNumber - 1) * limitNumber;

    // جلب المنح المرتبطة بالتصنيف
    const [{ value: totalItems }] = await db
      .select({ value: count() })
      .from(scholarships)
      .where(sql`${scholarships.categoryId} = ${category.id}`);

    const categoryScholarships = await db
      .select()
      .from(scholarships)
      .where(sql`${scholarships.categoryId} = ${category.id}`)
      .limit(limitNumber)
      .offset(offset)
      .orderBy(sql`${scholarships.createdAt} DESC`);

    const totalPages = Math.ceil(totalItems / limitNumber);

    console.log(`API: تم العثور على ${categoryScholarships.length} منحة من أصل ${totalItems} للتصنيف ${category.name}`);

    return res.status(200).json({
      category,
      scholarships: categoryScholarships,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalItems,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching category details:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء جلب تفاصيل التصنيف' });
  }
}