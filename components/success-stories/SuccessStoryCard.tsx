import { useState } from 'react';
import Link from 'next/link';
import { Calendar, GraduationCap } from 'lucide-react';
import { SuccessStory } from '@/shared/schema';
import { formatDate, cn } from '@/lib/utils';
import { OptimizedImage } from '@/components/OptimizedImage';

interface SuccessStoryCardProps {
  story: SuccessStory;
  isCompact?: boolean;
}

/**
 * مكون يعرض بطاقة قصة نجاح
 * @param story بيانات قصة النجاح
 * @param isCompact ما إذا كان العرض مختصر أم كامل
 */
export function SuccessStoryCard({ story, isCompact = false }: SuccessStoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // استخراج مقتطف من المحتوى
  const excerpt = story.content ? story.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '';
  
  return (
    <Link
      href={`/success-stories/${story.slug}`}
      className={cn(
        "block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow",
        isHovered && "ring-2 ring-primary"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        <OptimizedImage
          src={story.imageUrl || (story as any).thumbnailUrl}
          alt={story.title}
          fill
          className="object-cover"
          lazyLoading={true}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>
      
      <div className="p-4 md:p-6">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{story.title}</h3>
        <p className="text-sm text-primary-600 dark:text-primary-400 mb-3">{(story as any).studentName || story.name || 'صاحب القصة'}</p>
        
        {!isCompact && (
          <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {excerpt}
          </p>
        )}
        
        <div className="flex flex-wrap justify-between items-center text-sm text-gray-500 dark:text-gray-400 mt-3">
          {story.scholarshipName && (
            <div className="flex items-center">
              <GraduationCap className="w-4 h-4 ml-1" />
              <span>{story.scholarshipName}</span>
            </div>
          )}
          
          <div className="flex items-center">
            <Calendar className="w-4 h-4 ml-1" />
            <span>{formatDate(story.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * مكون هيكل قصة النجاح
 * يستخدم لعرض حالة التحميل قبل ظهور البيانات الفعلية
 */
export function SuccessStoryCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>
      
      <div className="p-4 md:p-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3 mb-3 animate-pulse"></div>
        
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-2/3 mb-3 animate-pulse"></div>
        
        <div className="flex flex-wrap justify-between items-center mt-3">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full ml-1 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-20 animate-pulse"></div>
          </div>
          
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full ml-1 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-16 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}