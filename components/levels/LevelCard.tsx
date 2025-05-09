import React from 'react';
import Link from 'next/link';
import { GraduationCap, BookOpen } from 'lucide-react';

interface LevelCardProps {
  id: number;
  name: string;
  slug: string;
  description?: string;
  scholarshipCount?: number;
}

/**
 * مكون بطاقة المستوى الدراسي
 * تستخدم لعرض المستويات الدراسية بشكل موحد في جميع أنحاء التطبيق
 */
export function LevelCard({ id, name, slug, description, scholarshipCount }: LevelCardProps) {
  return (
    <Link 
      href={`/levels/${slug}`}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900 rounded-full p-3">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold truncate">{name}</h2>
        </div>
        
        {description && (
          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {description}
          </p>
        )}
        
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
          <BookOpen className="w-4 h-4 ml-1" />
          <span>
            {scholarshipCount
              ? `${scholarshipCount} منحة دراسية`
              : 'لا توجد منح دراسية'}
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * مكون هيكل بطاقة المستوى الدراسي
 * يستخدم لعرض حالة التحميل قبل ظهور البيانات الفعلية
 */
export function LevelCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-full p-3 animate-pulse">
            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
        </div>
        
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4 animate-pulse" />
        
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full ml-1 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
        </div>
      </div>
    </div>
  );
}