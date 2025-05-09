import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { levels, scholarships } from '@/shared/schema';
import { desc, count, sql, eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("API: استلام طلب للمستويات الدراسية");
    
    // معالجة معلمات الاستعلام
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const search = req.query.search as string | undefined;
    const offset = (page - 1) * limit;
    
    console.log(`API: معلمات البحث: page=${page}, limit=${limit}, search=${search}`);
    
    // بناء الاستعلام مع دعم البحث
    let query = db.select().from(levels);
    
    // إضافة شرط البحث إذا كان موجودًا
    if (search) {
      query = query.where(
        sql`LOWER(${levels.name}) LIKE LOWER(${'%' + search + '%'}) OR 
           LOWER(${levels.description}) LIKE LOWER(${'%' + search + '%'})`
      );
    }
    
    // استعلام للحصول على العدد الإجمالي
    const countQuery = search
      ? db
          .select({ count: count() })
          .from(levels)
          .where(
            sql`LOWER(${levels.name}) LIKE LOWER(${'%' + search + '%'}) OR 
               LOWER(${levels.description}) LIKE LOWER(${'%' + search + '%'})`
          )
      : db.select({ count: count() }).from(levels);
    
    // الحصول على العدد الإجمالي
    const [countResult] = await countQuery;
    const totalLevels = countResult?.count || 0;
    
    // الحصول على نتائج الصفحة الحالية
    const levelsData = await query
      .orderBy(desc(levels.id))
      .limit(limit)
      .offset(offset);
    
    console.log(`API Levels: تم العثور على ${levelsData.length} مستوى من أصل ${totalLevels}`);
    
    // جلب عدد المنح لكل مستوى
    const levelsWithCounts = await Promise.all(
      levelsData.map(async (level) => {
        const [scholarshipCount] = await db
          .select({ count: count() })
          .from(scholarships)
          .where(eq(scholarships.levelId, level.id));
        
        return {
          ...level,
          scholarshipCount: scholarshipCount?.count || 0
        };
      })
    );
    
    // إعداد بيانات الصفحات
    const totalPages = Math.ceil(totalLevels / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    // إرجاع البيانات مع معلومات الصفحات
    res.status(200).json({
      levels: levelsWithCounts,
      pagination: {
        page,
        limit,
        totalLevels,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error("Error fetching levels:", error);
    res.status(500).json({ error: "حدث خطأ أثناء جلب المستويات الدراسية" });
  }
}