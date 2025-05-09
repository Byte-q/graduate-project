import { useRouter } from 'next/router';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { buttonVariants } from './button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  className?: string;
  isLoading?: boolean;
  variant?: 'default' | 'shadcn';
  size?: 'default' | 'sm' | 'lg';
  showText?: boolean;
}

/**
 * مكون التنقل بين الصفحات المحسن
 * يتيح للمستخدمين التنقل بين صفحات النتائج مع دعم مختلف الأشكال والأحجام
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  isLoading = false,
  variant = 'default',
  size = 'default',
  showText = true
}: PaginationProps) {
  const router = useRouter();
  
  // التأكد من أن الصفحة الحالية وإجمالي الصفحات أرقام صالحة
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  const validTotalPages = Math.max(1, totalPages);
  
  // حساب الصفحات التي سيتم عرضها
  const getVisiblePages = () => {
    // إذا كان العدد الإجمالي للصفحات 7 أو أقل، اعرض جميع الصفحات
    if (validTotalPages <= 7) {
      return Array.from({ length: validTotalPages }, (_, i) => i + 1);
    }
    
    // إظهار الصفحات المجاورة للصفحة الحالية
    const pages = [1]; // دائمًا إظهار الصفحة الأولى
    
    if (validCurrentPage > 3) {
      pages.push(-1); // إضافة علامة "..."
    }
    
    // إضافة الصفحات المجاورة للصفحة الحالية
    for (let i = Math.max(2, validCurrentPage - 1); i <= Math.min(validTotalPages - 1, validCurrentPage + 1); i++) {
      pages.push(i);
    }
    
    if (validCurrentPage < validTotalPages - 2) {
      pages.push(-2); // إضافة علامة "..."
    }
    
    if (validTotalPages > 1) {
      pages.push(validTotalPages); // دائمًا إظهار الصفحة الأخيرة
    }
    
    return pages;
  };
  
  // الانتقال إلى صفحة معينة
  const goToPage = (page: number) => {
    if (page < 1 || page > validTotalPages || page === validCurrentPage || isLoading) {
      return;
    }
    
    if (onPageChange) {
      onPageChange(page);
    } else {
      // تحديث استعلام URL مع الحفاظ على باقي المعلمات
      router.push({
        pathname: router.pathname,
        query: { ...router.query, page: page.toString() }
      }, undefined, { scroll: true });
    }
  };
  
  // الانتقال إلى الصفحة السابقة
  const goToPreviousPage = () => {
    goToPage(validCurrentPage - 1);
  };
  
  // الانتقال إلى الصفحة التالية
  const goToNextPage = () => {
    goToPage(validCurrentPage + 1);
  };
  
  // إذا كان هناك صفحة واحدة فقط، لا داعي لعرض التنقل
  if (validTotalPages <= 1) {
    return null;
  }
  
  const visiblePages = getVisiblePages();
  
  // تعيين الأحجام بناءً على خيار الحجم المحدد
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'h-8 min-w-[32px]';
      case 'lg':
        return 'h-12 min-w-[48px]';
      default:
        return 'h-10 min-w-[40px]';
    }
  };
  
  // تحديد استخدام تصميم shadcn أو التصميم الافتراضي
  if (variant === 'shadcn') {
    const sizeClass = size === 'sm' ? 'gap-1' : 'gap-2';
    const btnSize = size === 'sm' ? 'sm' : (size === 'lg' ? 'lg' : 'default');
    
    return (
      <nav className={cn('mx-auto flex w-full justify-center mt-8', className)} aria-label="تنقل الصفحات">
        <div className={cn('flex flex-row items-center rtl:flex-row-reverse', sizeClass)}>
          {/* زر الصفحة السابقة */}
          <button
            type="button"
            onClick={goToPreviousPage}
            disabled={validCurrentPage === 1 || isLoading}
            className={cn(buttonVariants({ variant: 'outline', size: btnSize }), 'gap-1', {
              'pointer-events-none opacity-50': validCurrentPage === 1 || isLoading
            })}
            aria-label="الصفحة السابقة"
          >
            <ChevronRight className="h-4 w-4" />
            {showText && <span>السابق</span>}
          </button>
          
          {/* أزرار الصفحات */}
          <div className={cn('flex items-center', sizeClass)}>
            {visiblePages.map((page, index) => {
              // إذا كانت القيمة سالبة، فهي تمثل "..."
              if (page < 0) {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className={cn('flex h-10 w-10 items-center justify-center', {
                      'h-8 w-8': size === 'sm',
                      'h-12 w-12': size === 'lg'
                    })}
                    aria-hidden="true"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">صفحات أخرى</span>
                  </span>
                );
              }
              
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  disabled={page === validCurrentPage || isLoading}
                  className={cn(
                    buttonVariants({
                      variant: page === validCurrentPage ? 'default' : 'outline',
                      size: btnSize
                    }),
                    {
                      'pointer-events-none': page === validCurrentPage || isLoading
                    }
                  )}
                  aria-label={`الصفحة ${page}`}
                  aria-current={page === validCurrentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              );
            })}
          </div>
          
          {/* زر الصفحة التالية */}
          <button
            type="button"
            onClick={goToNextPage}
            disabled={validCurrentPage === validTotalPages || isLoading}
            className={cn(buttonVariants({ variant: 'outline', size: btnSize }), 'gap-1', {
              'pointer-events-none opacity-50': validCurrentPage === validTotalPages || isLoading
            })}
            aria-label="الصفحة التالية"
          >
            {showText && <span>التالي</span>}
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </nav>
    );
  }
  
  // التصميم الافتراضي
  const sizeClass = getSizeClass();
  
  return (
    <nav className={cn('flex justify-center items-center mt-8', className)} aria-label="تنقل الصفحات">
      {/* زر الصفحة السابقة */}
      <button
        type="button"
        onClick={goToPreviousPage}
        disabled={validCurrentPage === 1 || isLoading}
        className={cn(
          'p-2 mx-1 rounded-md border border-gray-300 dark:border-gray-700 flex items-center justify-center',
          {
            'text-gray-400 dark:text-gray-600 cursor-not-allowed': validCurrentPage === 1 || isLoading,
            'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800': !(validCurrentPage === 1 || isLoading)
          }
        )}
        aria-label="الصفحة السابقة"
      >
        <ChevronRight className="h-5 w-5" />
        {showText && <span className="mr-1">السابق</span>}
      </button>
      
      {/* أزرار الصفحات */}
      <div className="flex items-center">
        {visiblePages.map((page, index) => {
          // إذا كانت القيمة سالبة، فهي تمثل "..."
          if (page < 0) {
            return (
              <span
                key={`ellipsis-${index}`}
                className="p-2 mx-1 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
              >
                <MoreHorizontal className="h-5 w-5" />
              </span>
            );
          }
          
          return (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              disabled={page === validCurrentPage || isLoading}
              className={cn(
                'mx-1 rounded-md flex items-center justify-center',
                sizeClass,
                {
                  'bg-primary text-white font-medium': page === validCurrentPage,
                  'text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800': page !== validCurrentPage
                }
              )}
              aria-label={`الصفحة ${page}`}
              aria-current={page === validCurrentPage ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}
      </div>
      
      {/* زر الصفحة التالية */}
      <button
        type="button"
        onClick={goToNextPage}
        disabled={validCurrentPage === validTotalPages || isLoading}
        className={cn(
          'p-2 mx-1 rounded-md border border-gray-300 dark:border-gray-700 flex items-center justify-center',
          {
            'text-gray-400 dark:text-gray-600 cursor-not-allowed': validCurrentPage === validTotalPages || isLoading,
            'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800': !(validCurrentPage === validTotalPages || isLoading)
          }
        )}
        aria-label="الصفحة التالية"
      >
        {showText && <span className="ml-1">التالي</span>}
        <ChevronLeft className="h-5 w-5" />
      </button>
    </nav>
  );
}

// نوع المكون الذي يمكن تصديره للاستخدام في الصفحات واستخدامه كمكون منفصل
export default Pagination;