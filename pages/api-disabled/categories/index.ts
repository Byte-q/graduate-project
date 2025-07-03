import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { categories } from '@/shared/schema';
import { count, sql } from 'drizzle-orm';

/**
 * واجهة برمجة التطبيقات للتصنيفات
 * تتيح جلب قائمة التصنيفات مع دعم الترقيم والبحث
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API Request: GET /categories');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'طريقة الطلب غير مدعومة' });
  }

  try {
    // استخراج معلمات الطلب
    const { page = '1', limit = '50', search } = req.query;
    const pageNumber = parseInt(page.toString(), 10);
    const limitNumber = parseInt(limit.toString(), 10);
    const offset = (pageNumber - 1) * limitNumber;
    
    console.log(`API: معلمات البحث: page=${pageNumber}, limit=${limitNumber}, search=${search}`);

    // إعداد شرط البحث إذا تم تحديده
    const searchTerm = search ? '%' + search.toString() + '%' : undefined;

    // جلب إجمالي عدد التصنيفات للترقيم (مع شرط البحث إذا وجد)
    const [{ value: totalItems }] = await db
      .select({ value: count() })
      .from(categories)
      .where(searchTerm ? sql`${categories.name} ILIKE ${searchTerm}` : undefined);

    // استعلام التصنيفات مع الترقيم والبحث
    const categoriesList = await db
      .select()
      .from(categories)
      .where(searchTerm ? sql`${categories.name} ILIKE ${searchTerm}` : undefined)
      .limit(limitNumber)
      .offset(offset)
      .orderBy(categories.name);
    
    const totalPages = Math.ceil(totalItems / limitNumber);
    
    console.log(`API: تم العثور على ${categoriesList.length} تصنيف من أصل ${totalItems}`);
    
    // ترتيب البيانات وإرجاعها
    return res.status(200).json({
      categories: categoriesList,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalItems,
        totalPages
      }
    });
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء جلب التصنيفات' });
  }
}