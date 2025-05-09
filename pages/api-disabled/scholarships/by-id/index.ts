import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../db';
import { scholarships, categories, levels, countries } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * التعامل مع طلبات الحصول على المنحة بواسطة معرف رقمي بشكل صريح
 * نستخدم الطريقة ?scholarshipId=123 بدلاً من [id] لتجنب التعارض مع [slug]
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { scholarshipId } = req.query;
    
    // التأكد من أن المعرف صالح
    if (!scholarshipId || Array.isArray(scholarshipId)) {
      return res.status(400).json({ error: 'Invalid scholarship ID' });
    }
    
    const id = parseInt(scholarshipId);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid scholarship ID format' });
    }
    
    if (req.method === 'GET') {
      // الحصول على المنحة بواسطة المعرف
      const scholarship = await db.query.scholarships.findFirst({
        where: eq(scholarships.id, id)
      });
      
      if (!scholarship) {
        return res.status(404).json({ error: 'Scholarship not found' });
      }
      
      // الحصول على بيانات العلاقات (الفئة، المستوى، الدولة)
      const category = scholarship.categoryId 
        ? await db.query.categories.findFirst({
            where: eq(categories.id, scholarship.categoryId)
          })
        : null;
        
      const level = scholarship.levelId
        ? await db.query.levels.findFirst({
            where: eq(levels.id, scholarship.levelId)
          })
        : null;
        
      const country = scholarship.countryId
        ? await db.query.countries.findFirst({
            where: eq(countries.id, scholarship.countryId)
          })
        : null;
      
      // إرجاع المنحة مع بيانات العلاقات
      return res.status(200).json({
        success: true,
        scholarship: {
          ...scholarship,
          category,
          level,
          country
        }
      });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error fetching scholarship:', error);
    return res.status(500).json({ 
      success: false,
      message: 'حدث خطأ أثناء جلب تفاصيل المنحة الدراسية',
      error: error instanceof Error ? error.message : 'خطأ غير معروف'
    });
  }
}