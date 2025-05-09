import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Globe, Award, GraduationCap, DollarSign } from 'lucide-react';
import { Scholarship } from '@/shared/schema';

// الواجهة المعدلة لبيانات المنحة الدراسية
interface ScholarshipCardData {
  id: number;
  title: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  isFeatured?: boolean;
  isFullyFunded?: boolean;
  deadline?: string | null;
  currency?: string;
  amount?: string;
  university?: string;
  department?: string;
  categoryId?: number;
  countryId?: number;
  levelId?: number;
  category?: { id: number; name: string; slug: string } | null;
  country?: { id: number; name: string; slug: string; flagUrl?: string | null } | null;
  level?: { id: number; name: string; slug: string } | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  // دعم الحقول القديمة للتوافقية
  image_url?: string;
  is_featured?: boolean;
  is_fully_funded?: boolean;
  category_id?: number;
  country_id?: number;
  level_id?: number;
  created_at?: string | Date;
  updated_at?: string | Date;
}

interface ScholarshipCardProps {
  scholarship: ScholarshipCardData;
  isCompact?: boolean;
}

/**
 * مكون يعرض بطاقة منحة دراسية
 * @param scholarship بيانات المنحة الدراسية
 * @param isCompact ما إذا كان العرض مختصر أم كامل
 */
export function ScholarshipCard({ scholarship, isCompact = false }: ScholarshipCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  // استخراج البيانات بشكل آمن مع دعم التوافقية مع الأنماط القديمة
  const titleDisplay = scholarship?.title || 'منحة دراسية';
  const descriptionDisplay = scholarship?.description || '';
  const slugDisplay = scholarship?.slug || '';
  
  // يدعم كلاً من النمطين (snake_case و camelCase) للصور
  const imageUrlDisplay = scholarship?.thumbnailUrl || 
                          scholarship?.imageUrl || 
                          scholarship?.image_url || 
                          '/images/default-scholarship.svg';
  
  // يدعم كلاً من النمطين للحقول البولينية
  const isFeatured = scholarship?.isFeatured ?? scholarship?.is_featured ?? false;
  const isFullyFunded = scholarship?.isFullyFunded ?? scholarship?.is_fully_funded ?? false;
  
  // يدعم كلاً من النمطين للمفاتيح الخارجية
  const categoryId = scholarship?.categoryId ?? scholarship?.category_id;
  const countryId = scholarship?.countryId ?? scholarship?.country_id;
  const levelId = scholarship?.levelId ?? scholarship?.level_id;
  
  // تعامل آمن مع البيانات المرتبطة
  const categoryName = scholarship?.category?.name || 'منحة دراسية';
  const countryName = scholarship?.country?.name || scholarship?.university || 'دولي';
  const levelName = scholarship?.level?.name || 'جميع المستويات';
  
  // التعامل مع التواريخ
  const createdAtDisplay = scholarship?.createdAt || scholarship?.created_at;
  const deadlineDisplay = scholarship?.deadline;
  
  return (
    <Link
      href={`/scholarships/${slugDisplay}`}
      className={`group block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
        isHovered ? 'ring-2 ring-primary transform translate-y-[-3px]' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        {!imgError && imageUrlDisplay ? (
          <Image
            src={imageUrlDisplay}
            alt={titleDisplay}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-gray-800/70">
            <GraduationCap className="h-16 w-16 text-blue-400 dark:text-blue-500 opacity-80" />
          </div>
        )}
        
        {/* طبقة التدرج محسنة */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10"></div>
        
        {/* شارة المنح المميزة محسنة */}
        {isFeatured && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-md">
            <span className="flex items-center">
              <Award className="w-3 h-3 mr-1" />
              منحة مميزة
            </span>
          </div>
        )}
        
        {/* معلومات سريعة على الصورة محسنة */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
          <div className="flex items-center text-sm font-medium bg-black/40 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
            <Globe className="w-4 h-4 ml-1.5 opacity-90" />
            {countryName}
          </div>
          
          {deadlineDisplay && (
            <div className="flex items-center text-xs font-medium bg-black/40 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
              <Calendar className="w-3.5 h-3.5 ml-1.5 opacity-90" />
              {typeof deadlineDisplay === 'string' && deadlineDisplay.trim() !== '' 
                ? new Date(deadlineDisplay).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })
                : 'غير محدد'}
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 md:p-5">
        <h3 className="font-bold text-lg mb-2.5 line-clamp-2 group-hover:text-primary transition-colors">
          {titleDisplay}
        </h3>
        
        {!isCompact && descriptionDisplay && (
          <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-3.5 text-sm leading-relaxed">
            {descriptionDisplay.substring(0, 120)}...
          </p>
        )}
        
        <div className="flex flex-wrap gap-2 mb-4">
          {/* عرض معلومات التصنيف محسن */}
          {(categoryId || scholarship?.category) && (
            <span className="text-xs bg-blue-100/80 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2.5 py-1.5 rounded-full font-medium border border-blue-200/50 dark:border-blue-800/50">
              {categoryName}
            </span>
          )}
          
          {/* عرض معلومات المستوى محسن */}
          {(levelId || scholarship?.level) && (
            <span className="text-xs bg-purple-100/80 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2.5 py-1.5 rounded-full font-medium border border-purple-200/50 dark:border-purple-800/50">
              <GraduationCap className="inline-block w-3 h-3 mr-1 opacity-80" />
              {levelName}
            </span>
          )}
          
          {/* شارة التمويل الكامل محسنة */}
          {isFullyFunded && (
            <span className="text-xs bg-green-100/80 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2.5 py-1.5 rounded-full font-medium border border-green-200/50 dark:border-green-800/50">
              <Award className="inline-block w-3 h-3 mr-1 opacity-80" />
              ممولة بالكامل
            </span>
          )}

          {/* عرض مبلغ المنحة محسن */}
          {(scholarship?.amount && scholarship?.currency) && (
            <span className="text-xs bg-orange-100/80 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-2.5 py-1.5 rounded-full font-medium border border-orange-200/50 dark:border-orange-800/50">
              <DollarSign className="inline-block w-3 h-3 mr-1 opacity-80" />
              {scholarship.amount} {scholarship.currency}
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center text-sm pt-3.5 border-t border-gray-100 dark:border-gray-700">
          {/* عرض تاريخ النشر محسن */}
          <span className="text-gray-500 dark:text-gray-400">
            {createdAtDisplay && 
              (typeof createdAtDisplay === 'string'
                ? new Date(createdAtDisplay).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })
                : 'تاريخ النشر')}
          </span>
          
          {/* عرض زر "التفاصيل" */}
          <span className="text-primary dark:text-primary-light font-medium group-hover:underline">
            عرض التفاصيل
          </span>
        </div>
      </div>
    </Link>
  );
}