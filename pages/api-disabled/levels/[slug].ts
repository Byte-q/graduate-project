import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { levels, scholarships } from '@/shared/schema';
import { eq, count } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { slug } = req.query;
    
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: "يجب تحديد مستوى دراسي" });
    }
    
    console.log(`API Request: GET /levels/${slug}`);
    
    // جلب المستوى الدراسي بواسطة slug
    const [level] = await db
      .select()
      .from(levels)
      .where(eq(levels.slug, slug));
    
    if (!level) {
      console.log(`Level not found: ${slug}`);
      return res.status(404).json({ error: "المستوى الدراسي غير موجود" });
    }
    
    console.log(`Level found: ${level.name}`);
    
    // جلب عدد المنح الدراسية المرتبطة بهذا المستوى
    const [scholarshipCount] = await db
      .select({ count: count() })
      .from(scholarships)
      .where(eq(scholarships.levelId, level.id));
    
    // إضافة عدد المنح الدراسية إلى البيانات
    const levelWithCount = {
      ...level,
      scholarshipCount: scholarshipCount?.count || 0
    };
    
    // إرجاع البيانات
    return res.status(200).json({ level: levelWithCount });
  } catch (error) {
    console.error(`Error fetching level:`, error);
    return res.status(500).json({ error: "حدث خطأ أثناء جلب بيانات المستوى الدراسي" });
  }
}