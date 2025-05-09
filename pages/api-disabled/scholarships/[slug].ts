import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { scholarships, categories, countries, levels } from '@/shared/schema';
import { eq, sql } from 'drizzle-orm';

// إضافة وظيفة تسجيل الأخطاء للتشخيص
function logError(error: any, context: string) {
  console.error(`Error in ${context}:`, error);
  if (error instanceof Error) {
    console.error(`  Message: ${error.message}`);
    console.error(`  Stack: ${error.stack}`);
  } else {
    console.error(`  Unknown error type:`, error);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const slug = req.query.slug as string;
    
    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'يجب توفير معرف المنحة الدراسية'
      });
    }
    
    // تحسين الأداء: إضافة رأس التخزين المؤقت Cache-Control
    res.setHeader(
      'Cache-Control',
      'public, max-age=3600, s-maxage=3600, stale-while-revalidate=59'
    );
    
    // الحصول على المنحة الدراسية بناءً على الاسم المستعار (slug)
    console.log(`جلب بيانات المنحة مع slug: ${slug}`);
    const scholarshipData = await db.select().from(scholarships)
      .where(eq(scholarships.slug, slug))
      .limit(1);
    
    if (!scholarshipData || scholarshipData.length === 0) {
      console.log(`لم يتم العثور على المنحة: ${slug}`);
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على المنحة الدراسية'
      });
    }
    
    console.log(`تم العثور على المنحة الدراسية بالعنوان: ${scholarshipData[0].title}`);
    const scholarship = scholarshipData[0];
    
    // تعديل اسم حقل الصورة إذا كان موجودًا
    if (scholarship.imageUrl && !scholarship.thumbnailUrl) {
      scholarship.thumbnailUrl = scholarship.imageUrl;
    }
    
    // ملاحظة: لا يوجد عمود views في جدول المنح الدراسية
    // لذلك تم تعطيل هذا الجزء مؤقتًا
    // إذا كان هناك حاجة لتتبع المشاهدات، يمكن إضافة العمود لاحقًا
    
    // الحصول على معلومات إضافية
    let categoryInfo = null;
    if (scholarship.categoryId) {
      const categoryData = await db.select().from(categories)
        .where(eq(categories.id, scholarship.categoryId))
        .limit(1);
      
      if (categoryData.length > 0) {
        categoryInfo = categoryData[0];
      }
    }
    
    let countryInfo = null;
    if (scholarship.countryId) {
      const countryData = await db.select().from(countries)
        .where(eq(countries.id, scholarship.countryId))
        .limit(1);
      
      if (countryData.length > 0) {
        countryInfo = countryData[0];
      }
    }
    
    let levelInfo = null;
    if (scholarship.levelId) {
      const levelData = await db.select().from(levels)
        .where(eq(levels.id, scholarship.levelId))
        .limit(1);
      
      if (levelData.length > 0) {
        levelInfo = levelData[0];
      }
    }
    
    // الحصول على منح ذات صلة
    let relatedScholarships: any[] = [];
    
    if (scholarship.categoryId) {
      relatedScholarships = await db.select({
        id: scholarships.id,
        title: scholarships.title,
        slug: scholarships.slug,
        deadline: scholarships.deadline,
        thumbnailUrl: scholarships.thumbnailUrl,
        isFeatured: scholarships.isFeatured
      })
      .from(scholarships)
      .where(eq(scholarships.categoryId, scholarship.categoryId))
      .where(sql`${scholarships.id} != ${scholarship.id}`)
      .orderBy(sql`RANDOM()`)
      .limit(3);
    }
    
    // إذا لم يتم العثور على منح ذات صلة بناءً على الفئة
    if (relatedScholarships.length === 0) {
      relatedScholarships = await db.select({
        id: scholarships.id,
        title: scholarships.title,
        slug: scholarships.slug,
        deadline: scholarships.deadline,
        thumbnailUrl: scholarships.thumbnailUrl,
        isFeatured: scholarships.isFeatured
      })
      .from(scholarships)
      .where(sql`${scholarships.id} != ${scholarship.id}`)
      .orderBy(sql`RANDOM()`)
      .limit(3);
    }
    
    // إرجاع البيانات
    return res.status(200).json({
      success: true,
      scholarship: {
        ...scholarship,
        category: categoryInfo,
        country: countryInfo,
        level: levelInfo
      },
      relatedScholarships
    });
  } catch (error) {
    logError(error, 'scholarship details api');
    
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب تفاصيل المنحة الدراسية',
      error: error instanceof Error ? error.message : 'خطأ غير معروف'
    });
  }
}