import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string | null | undefined;
  fallbackSrc?: string;
  fallbackComponent?: React.ReactNode;
  className?: string;
  lazyLoading?: boolean;
  showPlaceholder?: boolean;
}

// المسار الافتراضي للصور الاحتياطية
const DEFAULT_PLACEHOLDER = '/images/placeholder.svg';

/**
 * مكون صورة محسّن مع دعم الصور الاحتياطية والكسل لتحميل الصور
 * تحسين محسّن للأداء مع معالجة الأخطاء والتحميل التدريجي
 */
export function OptimizedImage({
  src,
  fallbackSrc = DEFAULT_PLACEHOLDER,
  fallbackComponent,
  alt,
  className,
  lazyLoading = true,
  showPlaceholder = true,
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // تعديل مسار الصورة لتجنب مشاكل 404 في مجلد /uploads/
  const optimizeSrc = (inputSrc: string | null | undefined): string => {
    if (!inputSrc || inputSrc.includes('null') || inputSrc.includes('undefined')) {
      return fallbackSrc;
    }
    
    // استبدال مسارات uploads بمسار الصور الاحتياطية
    if (inputSrc.includes('/uploads/')) {
      return fallbackSrc;
    }
    
    // تعامل مع الروابط المحلية المحتملة
    if (!inputSrc.startsWith('http') && !inputSrc.startsWith('/') && !inputSrc.startsWith('data:')) {
      return `/${inputSrc}`;
    }
    
    return inputSrc;
  };
  
  const fullSrc = optimizeSrc(src);
  
  // تحميل سريع للصور
  useEffect(() => {
    const img = new window.Image();
    img.src = fullSrc;
    img.onload = () => setLoading(false);
    img.onerror = () => {
      setError(true);
      setLoading(false);
    };
    
    // تنظيف المهلة عند إزالة المكون
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [fullSrc]);
  
  // استخدام صورة احتياطية إذا كان هناك خطأ
  if (error || fullSrc === fallbackSrc) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }
    
    return (
      <div className={cn("flex items-center justify-center bg-gray-50 dark:bg-gray-800 overflow-hidden", className)}>
        {fallbackSrc ? (
          <Image
            src={fallbackSrc}
            alt={alt || "صورة احتياطية"}
            className={cn("object-contain", className)}
            priority={!lazyLoading}
            loading={lazyLoading ? 'lazy' : 'eager'}
            {...props}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-sm">لا توجد صورة</span>
          </div>
        )}
      </div>
    );
  }
  
  // عرض الصورة مع مؤشر تحميل
  return (
    <div className={cn("relative overflow-hidden", className)} style={props.style ? props.style : {}}>
      {/* الصورة الفعلية */}
      <Image
        src={fullSrc}
        alt={alt || "صورة"}
        onError={() => setError(true)}
        className={cn(
          "object-cover transition-opacity duration-300",
          loading ? "opacity-0" : "opacity-100",
          className
        )}
        priority={!lazyLoading}
        loading={lazyLoading ? 'lazy' : 'eager'}
        {...props}
      />
      
      {/* مؤشر التحميل */}
      {loading && showPlaceholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}