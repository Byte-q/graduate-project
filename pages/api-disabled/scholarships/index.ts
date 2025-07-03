import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { scholarships, categories, countries, levels } from '@/shared/schema';
import { sql, asc, desc, count, and } from 'drizzle-orm';
import { safeObjectEntries, safeReduce } from '@/lib/utils';

// تعريف نوع البيانات للاستجابة
type ResponseData = {
  success: boolean;
  scholarships?: any[];
  message?: string;
  meta?: {
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    filters: {
      categories: { id: number; name: string; slug: string }[];
      countries: { id: number; name: string; slug: string }[];
      levels: { id: number; name: string; slug: string }[];
    };
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    // استخراج معلمات الاستعلام
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const country = req.query.country as string | undefined;
    const level = req.query.level as string | undefined;
    const fundingType = req.query.fundingType as string | undefined;
    const sortBy = req.query.sortBy as string | undefined;
    
    // تحسين الأداء: إضافة رأس التخزين المؤقت Cache-Control
    // وقت أقصر للتخزين المؤقت في حالة وجود بحث (غير مستقر)
    if (search) {
      res.setHeader(
        'Cache-Control',
        'public, max-age=300, s-maxage=600, stale-while-revalidate=59'
      );
    } else {
      res.setHeader(
        'Cache-Control',
        'public, max-age=1800, s-maxage=3600, stale-while-revalidate=59'
      );
    }
    
    console.log(`API: استلام طلب لقائمة المنح الدراسية`);
    console.log(`API: معلمات البحث: page=${page}, limit=${limit}, search=${search}, category=${category}, country=${country}, level=${level}, fundingType=${fundingType}, sortBy=${sortBy}`);
    
    // حساب الصفحة الحالية والحد
    const offset = (page - 1) * limit;
    
    // بناء استعلام أساسي
    let baseQuery = db.select({
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
    }).from(scholarships);

    // بناء شروط where بشكل ديناميكي
    const whereClauses: any[] = [];

    // تطبيق فلتر البحث إذا كان موجودًا
    if (search) {
      whereClauses.push(
        sql`${scholarships.title} ILIKE ${'%' + search + '%'} OR 
        ${scholarships.description} ILIKE ${'%' + search + '%'}`
      );
    }

    // تطبيق فلتر الفئة إذا كان موجودًا
    if (category) {
      try {
        const categoryData = await db.select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug
        }).from(categories)
          .where(sql`${categories.slug} = ${category}`)
          .limit(1);

        if (categoryData.length > 0) {
          const categoryId = categoryData[0].id;
          whereClauses.push(sql`${scholarships.categoryId} = ${categoryId}`);
          console.log(`تصفية حسب الفئة: ${category} (ID: ${categoryId})`);
        } else {
          console.log(`لم يتم العثور على فئة بالاسم: ${category}`);
        }
      } catch (err) {
        console.error('Error applying category filter:', err);
      }
    }

    // تطبيق فلتر البلد إذا كان موجودًا
    if (country) {
      try {
        const countryData = await db.select({
          id: countries.id,
          name: countries.name,
          slug: countries.slug
        }).from(countries)
          .where(sql`${countries.slug} = ${country}`)
          .limit(1);

        if (countryData.length > 0) {
          const countryId = countryData[0].id;
          whereClauses.push(sql`${scholarships.countryId} = ${countryId}`);
          console.log(`تصفية حسب الدولة: ${country} (ID: ${countryId})`);
        } else {
          console.log(`لم يتم العثور على دولة بالاسم: ${country}`);
        }
      } catch (err) {
        console.error('Error applying country filter:', err);
      }
    }

    // تطبيق فلتر المستوى إذا كان موجودًا
    if (level) {
      try {
        const levelData = await db.select({
          id: levels.id,
          name: levels.name,
          slug: levels.slug
        }).from(levels)
          .where(sql`${levels.slug} = ${level}`)
          .limit(1);

        if (levelData.length > 0) {
          const levelId = levelData[0].id;
          whereClauses.push(sql`${scholarships.levelId} = ${levelId}`);
          console.log(`تصفية حسب المستوى: ${level} (ID: ${levelId})`);
        } else {
          console.log(`لم يتم العثور على مستوى بالاسم: ${level}`);
        }
      } catch (err) {
        console.error('Error applying level filter:', err);
      }
    }

    // تطبيق فلتر نوع التمويل إذا كان موجودًا
    if (fundingType === 'fully-funded') {
      whereClauses.push(sql`${scholarships.isFullyFunded} = true`);
    } else if (fundingType === 'partial') {
      whereClauses.push(sql`${scholarships.isFullyFunded} = false`);
    }

    // تطبيق جميع شروط where دفعة واحدة
    const query = whereClauses.length > 0
  ? baseQuery.where(and(...whereClauses))
  : baseQuery;
    
    // تطبيق الترتيب
    let finalQuery = query
    .orderBy(
      sortBy === 'newest' ? desc(scholarships.createdAt) :
      sortBy === 'oldest' ? asc(scholarships.createdAt) :
      sortBy === 'deadline' ? asc(scholarships.deadline) :
      sortBy === 'title' ? asc(scholarships.title) :
      desc(scholarships.createdAt)
    )
    .limit(limit)
    .offset(offset);
    
    // الحصول على إجمالي عدد النتائج
    let total = 0;
    try {
      const countResult = await db.select({ count: count() }).from(scholarships);
      total = Number(countResult[0].count);
    } catch (err) {
      console.error('Error counting total scholarships:', err);
    }
    
    // الحصول على قائمة المنح
    let result: any[] = [];
    try {
      result = await query.limit(limit).offset(offset);
      console.log(`API: تم العثور على ${result.length} منحة دراسية`);
    } catch (err) {
      console.error('Error fetching scholarships:', err);
    }
    
    // الحصول على خيارات الفلترة
    let categoriesData: any[] = [];
    try {
      categoriesData = await db.select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug
      }).from(categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
    
    let countriesData: any[] = [];
    try {
      countriesData = await db.select({
        id: countries.id,
        name: countries.name,
        slug: countries.slug
      }).from(countries);
    } catch (err) {
      console.error('Error fetching countries:', err);
    }
    
    // إضافة حقل flagUrl افتراضي لتجنب أخطاء بيانات الدول
    const countriesWithFlag = countriesData.map(country => ({
      ...country,
      flagUrl: null
    }));
    
    let levelsData: any[] = [];
    try {
      levelsData = await db.select({
        id: levels.id,
        name: levels.name,
        slug: levels.slug
      }).from(levels);
    } catch (err) {
      console.error('Error fetching levels:', err);
    }
    
    // معالجة بيانات المنح الدراسية وإضافة المعلومات المرتبطة
    let scholarshipsWithDetails: Array<{
      id: number;
      title: string;
      slug: string;
      description?: string;
      content?: string;
      deadline?: Date | null;
      amount?: number | null;
      currency?: string | null;
      university?: string | null;
      department?: string | null;
      isFeatured?: boolean;
      isFullyFunded?: boolean;
      thumbnailUrl?: string;
      createdAt?: Date;
      updatedAt?: Date;
      category?: any;
      country?: any;
      level?: any;
    }> = [];
    
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
                
                // استخدام فحص إضافي للتأكد من أن levelData ليس قيمة null أو undefined
                if (levelData && levelData.length > 0) {
                  levelInfo = levelData[0];
                }
              } catch (error) {
                console.error('Error fetching level info:', error);
              }
            }
            
            // تحضير الصورة المصغرة
            let thumbnailUrl = '/images/default-scholarship.svg'; // قيمة افتراضية - تم التحويل إلى SVG
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
              thumbnailUrl: '/images/default-scholarship.png'
            };
          }
        })
      );
    } catch (transformError) {
      console.error('Error transforming scholarships data:', transformError);
    }
    
    // تسجيل معلومات تشخيصية مع حماية من undefined/null
    console.log('DEBUG - scholarshipsWithDetails.length:', Array.isArray(scholarshipsWithDetails) ? scholarshipsWithDetails.length : 0);
    console.log('DEBUG - categoriesData.length:', Array.isArray(categoriesData) ? categoriesData.length : 0);
    console.log('DEBUG - countriesWithFlag.length:', Array.isArray(countriesWithFlag) ? countriesWithFlag.length : 0);
    console.log('DEBUG - levelsData.length:', Array.isArray(levelsData) ? levelsData.length : 0);

    // التأكد من أن جميع القوائم عبارة عن مصفوفات
    const safeScholarships = Array.isArray(scholarshipsWithDetails) ? scholarshipsWithDetails : [];
    const safeCategories = Array.isArray(categoriesData) ? categoriesData : [];
    const safeCountries = Array.isArray(countriesWithFlag) ? countriesWithFlag : [];
    const safeLevels = Array.isArray(levelsData) ? levelsData : [];

    // إنشاء وإرسال الاستجابة
    try {
      const responseData = {
        success: true,
        scholarships: safeScholarships,
        meta: {
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          },
          filters: {
            categories: safeCategories,
            countries: safeCountries,
            levels: safeLevels
          }
        }
      };
      res.status(200).json(responseData);
      console.log('DEBUG - تم إرسال الاستجابة بنجاح');
    } catch (serializeError) {
      console.error('DEBUG - خطأ في تسلسل الاستجابة JSON:', serializeError);
      // إرسال استجابة بديلة في حالة الفشل
      res.status(200).json({
        success: true,
        scholarships: [],
        meta: {
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          },
          filters: {
            categories: [],
            countries: [],
            levels: []
          }
        }
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    
    // إرسال استجابة خطأ
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب قائمة المنح الدراسية',
      scholarships: [],
      meta: {
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        },
        filters: {
          categories: [],
          countries: [],
          levels: []
        }
      }
    });
  }
}