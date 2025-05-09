/**
 * وظائف مساعدة خاصة بالمنح الدراسية
 */
import { safeObjectEntries } from './utils';
import type { Level } from '@/shared/schema';

/**
 * استخراج معلومات المستوى الأكاديمي من عنوان المنحة إذا لم يكن محدد بشكل صريح
 * @param title عنوان المنحة
 * @param allLevels قائمة جميع المستويات المتاحة
 */
/**
 * استخراج معلومات المستوى الأكاديمي من عنوان المنحة باستخدام الكلمات المفتاحية
 * تم تحسين هذه الدالة بحيث تستخدم استراتيجية بحث أكثر أمانًا
 */
export function detectLevelFromTitle(title: string, allLevels: Level[]): Level | null {
  if (!title || !allLevels || !Array.isArray(allLevels) || allLevels.length === 0) {
    console.log('لا يمكن اكتشاف المستوى: البيانات غير كافية');
    return null;
  }

  // تشخيص القيم المدخلة
  console.log(`تشخيص اكتشاف المستوى:`, {
    titleLength: title.length,
    levelsCount: allLevels.length,
    allLevelSlugs: allLevels.map(l => l.slug).join(', ')
  });

  // تحويل العنوان إلى حروف صغيرة للبحث
  const lowerTitle = title.toLowerCase();
  
  // كلمات مفتاحية وما يقابلها من slug المستوى - تم تنظيمها بشكل مصفوفة لتجنب مشاكل Object.entries
  const keywordPairs = [
    { keyword: 'bachelor', slug: 'bachelors' },
    { keyword: 'بكالوريوس', slug: 'bachelors' },
    { keyword: 'master', slug: 'masters' },
    { keyword: 'ماجستير', slug: 'masters' },
    { keyword: 'phd', slug: 'phd' },
    { keyword: 'دكتوراه', slug: 'phd' },
    { keyword: 'دكتوراة', slug: 'phd' },
    { keyword: 'fellowship', slug: 'research-fellowship' },
    { keyword: 'زمالة', slug: 'research-fellowship' },
    { keyword: 'بحثية', slug: 'research-fellowship' },
    { keyword: 'diploma', slug: 'diploma' },
    { keyword: 'دبلوم', slug: 'diploma' },
    { keyword: 'course', slug: 'short-courses' },
    { keyword: 'دورة', slug: 'short-courses' },
    { keyword: 'تدريب', slug: 'short-courses' }
  ];
  
  console.log(`عدد الكلمات المفتاحية: ${keywordPairs.length}`);
  
  // محاولة المطابقة المباشرة أولاً مع المستويات المتاحة
  // هذا يمكن أن يكون أكثر موثوقية من البحث عن الكلمات المفتاحية
  for (const level of allLevels) {
    try {
      if (level && level.name && lowerTitle.includes(level.name.toLowerCase())) {
        console.log(`تم العثور على المستوى "${level.name}" بمطابقة مباشرة من الاسم`);
        return level;
      }
    } catch (error) {
      console.error(`خطأ أثناء البحث المباشر عن المستوى:`, error);
    }
  }
  
  // البحث عن كلمات مفتاحية في العنوان باستخدام المصفوفة بدلاً من Object.entries
  for (const pair of keywordPairs) {
    try {
      const { keyword, slug } = pair;
      if (lowerTitle.includes(keyword)) {
        console.log(`وجدت الكلمة المفتاحية "${keyword}" في العنوان، أبحث عن مستوى مطابق بـ slug: ${slug}`);
        
        // تأكد من سلامة البحث عن المستوى المطابق
        const matchedLevel = allLevels.find(level => {
          return level && level.slug && level.slug === slug;
        });
        
        if (matchedLevel) {
          console.log(`تم العثور على المستوى "${matchedLevel.name}" باستخدام الكلمة المفتاحية "${keyword}"`);
          return matchedLevel;
        } else {
          console.log(`لم يتم العثور على مستوى مطابق لـ slug: ${slug}`);
        }
      }
    } catch (error) {
      console.error(`خطأ أثناء البحث عن الكلمة المفتاحية:`, error);
    }
  }
  
  // إذا لم يتم العثور على أي تطابق، نعيد null
  console.log('لم يتم العثور على أي مستوى مطابق للعنوان');
  return null;
}

/**
 * الحصول على واجهة البيانات الآمنة للعلاقات في المنح الدراسية
 * @param relation كائن العلاقة من قاعدة البيانات
 */
export function getSafeRelation<T extends { id: number; name: string; slug: string }>(
  relation: T | null | undefined
): { id: number; name: string; slug: string } | null {
  if (!relation) return null;
  
  try {
    return {
      id: relation.id || 0,
      name: relation.name || '',
      slug: relation.slug || ''
    };
  } catch (error) {
    console.error('خطأ في استخراج بيانات العلاقة:', error);
    return null;
  }
}