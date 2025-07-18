import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { countries } from '@/shared/schema';
import { count, sql } from 'drizzle-orm';

/**
 * واجهة برمجة التطبيقات للدول
 * تتيح جلب قائمة الدول مع دعم الترقيم والبحث
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API Request: GET /countries');
  
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

    // تنفيذ استعلام قاعدة البيانات
    // إعداد استعلام الدول مع شرط البحث إذا تم تحديده
    const searchTerm = search ? '%' + search.toString() + '%' : undefined;
    const baseQuery = db.select().from(countries);
    const filteredQuery = searchTerm
      ? baseQuery.where(sql`${countries.name} ILIKE ${searchTerm}`)
      : baseQuery;
    
    // جلب إجمالي عدد الدول للترقيم (مع مراعاة البحث)
    const [{ value: totalItems }] = await db
      .select({ value: count() })
      .from(countries)
      .where(
        searchTerm ? sql`${countries.name} ILIKE ${searchTerm}` : sql`TRUE`
      );
    
    // استعلام الدول مع الترقيم
    const countriesList = await filteredQuery
      .limit(limitNumber)
      .offset(offset)
      .orderBy(countries.name);
    
    const totalPages = Math.ceil(totalItems / limitNumber);
    
    console.log(`API: تم العثور على ${countriesList.length} دولة من أصل ${totalItems}`);
    
    // ترتيب البيانات وإرجاعها
    return res.status(200).json({
      countries: countriesList,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalItems,
        totalPages
      }
    });
    
  } catch (error) {
    console.error('Error fetching countries:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء جلب الدول' });
  }
}