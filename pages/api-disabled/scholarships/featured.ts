import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { scholarships, categories, countries, levels } from '@/shared/schema';
import { sql, desc } from 'drizzle-orm';
import { safeObjectEntries, safeReduce } from '@/lib/utils';

type ResponseData = {
  success: boolean;
  scholarships?: any[];
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    console.log('API: استلام طلب للمنح الدراسية المميزة');
    
    // بناء استعلام أساسي للمنح المميزة
    let query = db.select({
      id: scholarships.id,
      title: scholarships.title,
      slug: scholarships.slug,
      description: scholarships.description,
      content: scholarships.content,
      amount: scholarships.amount,
      currency: scholarships.currency,
      university: scholarships.university,
      department: scholarships.department,
      isFeatured: scholarships.isFeatured,
      isFullyFunded: scholarships.isFullyFunded,
      imageUrl: scholarships.imageUrl,
      deadline: scholarships.deadline,
      categoryId: scholarships.categoryId,
      countryId: scholarships.countryId,
      levelId: scholarships.levelId,
      createdAt: scholarships.createdAt,
      updatedAt: scholarships.updatedAt,
      isPublished: scholarships.isPublished
    })
    .from(scholarships)
    .where(sql`${scholarships.isFeatured} = true AND ${scholarships.isPublished} = true`)
    .orderBy(desc(scholarships.createdAt))
    .limit(6);
    
    // تنفيذ الاستعلام
    let result = [];
    try {
      result = await query;
      console.log(`API Featured: تم العثور على ${result.length} منحة دراسية مميزة`);
    } catch (err) {
      console.error('Error fetching featured scholarships:', err);
    }
    
    // معالجة بيانات المنح الدراسية وإضافة المعلومات المرتبطة
    let scholarshipsWithDetails = [];
    
    try {
      scholarshipsWithDetails = await Promise.all(
        result.map(async (scholarship) => {
          try {
            // تعريف المتغيرات
            let categoryInfo = null;
            let countryInfo = null;
            let levelInfo = null;
            
            // جلب معلومات الفئة إذا كانت موجودة
            if (scholarship.categoryId) {
              try {
                const categoryData = await db.select({
                  id: categories.id,
                  name: categories.name,
                  slug: categories.slug
                })
                .from(categories)
                .where(sql`${categories.id} = ${scholarship.categoryId}`)
                .limit(1);
                
                if (categoryData.length > 0) {
                  categoryInfo = categoryData[0];
                }
              } catch (error) {
                console.error('Error fetching category info:', error);
              }
            }
            
            // جلب معلومات البلد إذا كانت موجودة
            if (scholarship.countryId) {
              try {
                const countryData = await db.select({
                  id: countries.id,
                  name: countries.name,
                  slug: countries.slug
                })
                .from(countries)
                .where(sql`${countries.id} = ${scholarship.countryId}`)
                .limit(1);
                
                if (countryData.length > 0) {
                  countryInfo = {
                    ...countryData[0],
                    flagUrl: null
                  };
                }
              } catch (error) {
                console.error('Error fetching country info:', error);
              }
            }
            
            // جلب معلومات المستوى إذا كان موجوداً
            if (scholarship.levelId) {
              try {
                const levelData = await db.select({
                  id: levels.id,
                  name: levels.name,
                  slug: levels.slug
                })
                .from(levels)
                .where(sql`${levels.id} = ${scholarship.levelId}`)
                .limit(1);
                
                if (levelData && levelData.length > 0) {
                  levelInfo = levelData[0];
                }
              } catch (error) {
                console.error('Error fetching level info:', error);
              }
            }
            
            // تحضير الصورة المصغرة
            let thumbnailUrl = '/images/default-scholarship.svg'; // قيمة افتراضية
            if (scholarship.imageUrl) {
              thumbnailUrl = scholarship.imageUrl;
            }
            
            // إنشاء كائن المنحة النهائي مع المعلومات الإضافية
            return {
              id: scholarship.id,
              title: scholarship.title || '',
              slug: scholarship.slug || '',
              description: scholarship.description || '',
              content: scholarship.content || '',
              deadline: scholarship.deadline || null,
              amount: scholarship.amount || null,
              currency: scholarship.currency || null,
              university: scholarship.university || null,
              department: scholarship.department || null,
              isFeatured: scholarship.isFeatured || false,
              isFullyFunded: scholarship.isFullyFunded || false,
              thumbnailUrl: thumbnailUrl,
              imageUrl: scholarship.imageUrl,
              createdAt: scholarship.createdAt || new Date(),
              updatedAt: scholarship.updatedAt || new Date(),
              category: categoryInfo,
              country: countryInfo,
              level: levelInfo
            };
          } catch (mapError) {
            console.error('Error processing scholarship:', mapError);
            // إرجاع كائن بسيط في حالة حدوث خطأ
            return {
              id: scholarship.id,
              title: scholarship.title || '',
              slug: scholarship.slug || '',
              thumbnailUrl: '/images/default-scholarship.svg'
            };
          }
        })
      );
    } catch (transformError) {
      console.error('Error transforming scholarships data:', transformError);
    }
    
    // إنشاء وإرسال الاستجابة
    res.status(200).json({
      success: true,
      scholarships: scholarshipsWithDetails
    });
    
  } catch (error) {
    console.error('API Featured Error:', error);
    
    // إرسال استجابة خطأ
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب قائمة المنح الدراسية المميزة',
      scholarships: []
    });
  }
}