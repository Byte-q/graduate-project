import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  ChevronFirst, 
  ChevronLast, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  /**
   * الصفحة الحالية
   */
  page: number;
  
  /**
   * إجمالي عدد الصفحات
   */
  totalPages: number;
  
  /**
   * وظيفة تتم استدعاؤها عند تغيير الصفحة
   */
  onChange?: (page: number) => void;
  
  /**
   * المعلم الذي يتم استخدامه في استعلام URL (افتراضي: "page")
   */
  pageParam?: string;
  
  /**
   * عدد الصفحات المعروضة على كل جانب من الصفحة الحالية
   */
  siblings?: number;
  
  /**
   * عرض أزرار الانتقال إلى الصفحة الأولى والأخيرة
   */
  showEdges?: boolean;
  
  /**
   * عرض النص بجانب أزرار الانتقال
   */
  showText?: boolean;
  
  /**
   * استخدام المسار المطلق بدلاً من استخدام الاستعلام
   */
  usePath?: boolean;
  
  /**
   * شكل المكون (افتراضي، بسيط، بدون خلفية)
   */
  variant?: 'default' | 'simple' | 'outline' | 'ghost';
  
  /**
   * حجم المكون
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * فصل المكون
   */
  className?: string;
  
  /**
   * تعطيل أو تمكين المكون بالكامل
   */
  disabled?: boolean;
  
  /**
   * نص عنصر الصفحة السابقة
   */
  previousLabel?: string;
  
  /**
   * نص عنصر الصفحة التالية
   */
  nextLabel?: string;
  
  /**
   * نص عنصر الصفحة الأولى
   */
  firstLabel?: string;
  
  /**
   * نص عنصر الصفحة الأخيرة
   */
  lastLabel?: string;
}

/**
 * مكون التنقل بين الصفحات
 * يدعم التخصيص الكامل ويعمل مع wouter أو next/router
 * يدعم تصميم RTL
 */
export function Pagination({
  page = 1,
  totalPages,
  onChange,
  pageParam = "page",
  siblings = 1,
  showEdges = false,
  showText = false,
  usePath = false,
  variant = "default",
  size = "md",
  className = "",
  disabled = false,
  previousLabel = "السابق",
  nextLabel = "التالي",
  firstLabel = "الأولى",
  lastLabel = "الأخيرة"
}: PaginationProps) {
  const router = useRouter();
  
  // التأكد من أن الصفحة الحالية وإجمالي الصفحات قيم صالحة
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const pageCount = Math.max(1, totalPages);
  
  // إنشاء مصفوفة الصفحات المراد عرضها
  const range = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };
  
  const generatePagination = () => {
    // إذا كان عدد الصفحات أقل من 8، نعرض جميع الصفحات
    if (pageCount <= 7) {
      return range(1, pageCount);
    }
    
    // حساب نطاق الصفحات حول الصفحة الحالية
    const leftSiblingIndex = Math.max(currentPage - siblings, 1);
    const rightSiblingIndex = Math.min(currentPage + siblings, pageCount);
    
    // تحديد ما إذا كان يجب عرض النقاط الثلاث
    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < pageCount - 1;
    
    // عرض الصفحة الأولى والأخيرة دائما
    if (showLeftDots && showRightDots) {
      // عرض الصفحة الأولى والأخيرة والنطاق حول الصفحة الحالية
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [1, '...', ...middleRange, '...', pageCount];
    } else if (showLeftDots) {
      // عرض الصفحة الأولى والنطاق الأخير
      const rightRange = range(leftSiblingIndex, pageCount);
      return [1, '...', ...rightRange];
    } else if (showRightDots) {
      // عرض النطاق الأول والصفحة الأخيرة
      const leftRange = range(1, rightSiblingIndex);
      return [...leftRange, '...', pageCount];
    }
    
    // عرض كل الصفحات (لن يتم الوصول إلى هنا عادة)
    return range(1, pageCount);
  };
  
  // إنشاء مصفوفة الصفحات
  const pages = generatePagination();
  
  // التنقل إلى صفحة محددة
  const goToPage = (targetPage: number) => {
    if (disabled || targetPage === currentPage || targetPage < 1 || targetPage > pageCount) {
      return;
    }
    
    if (onChange) {
      onChange(targetPage);
    } else if (router) {
      const query = { ...router.query, [pageParam]: targetPage.toString() };
      
      if (usePath) {
        // استخدام المسار المطلق
        const path = router.pathname.replace(`[${pageParam}]`, targetPage.toString());
        router.push(path);
      } else {
        // استخدام معلمات الاستعلام
        router.push({
          pathname: router.pathname,
          query
        }, undefined, { scroll: true });
      }
    }
  };
  
  // أنماط الحجم
  const sizeClasses = {
    sm: "h-8 min-w-8 text-xs gap-1",
    md: "h-10 min-w-10 text-sm gap-1.5",
    lg: "h-12 min-w-12 text-base gap-2"
  };
  
  // أنماط المتغيرات
  const variantClasses = {
    default: "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 focus:ring-2 focus:ring-primary focus:ring-opacity-50",
    simple: "hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-2 focus:ring-primary focus:ring-opacity-50",
    outline: "border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-2 focus:ring-primary focus:ring-opacity-50",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
  };
  
  // فئة الزر الرئيسية
  const baseButtonClass = cn(
    "flex items-center justify-center rounded-md transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
    sizeClasses[size],
    variantClasses[variant]
  );
  
  // فئة الزر المحدد
  const selectedButtonClass = cn(
    "flex items-center justify-center rounded-md transition-colors focus:outline-none",
    sizeClasses[size],
    "bg-primary text-white hover:bg-primary-focus focus:ring-2 focus:ring-primary focus:ring-opacity-50"
  );
  
  // فئة الزر غير المتفاعل
  const nonInteractiveClass = cn(
    "flex items-center justify-center",
    sizeClasses[size]
  );
  
  return (
    <nav
      role="navigation"
      aria-label="التنقل بين الصفحات"
      className={cn("flex flex-wrap items-center justify-center gap-1 rtl:flex-row-reverse", className)}
    >
      {/* زر الصفحة الأولى */}
      {showEdges && (
        <button
          onClick={() => goToPage(1)}
          disabled={disabled || currentPage === 1}
          className={baseButtonClass}
          aria-label="الانتقال إلى الصفحة الأولى"
        >
          <ChevronFirst size={16} />
          {showText && <span className="hidden sm:inline-block">{firstLabel}</span>}
        </button>
      )}
      
      {/* زر الصفحة السابقة */}
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={disabled || currentPage === 1}
        className={baseButtonClass}
        aria-label="الانتقال إلى الصفحة السابقة"
      >
        <ChevronRight size={16} />
        {showText && <span className="hidden sm:inline-block">{previousLabel}</span>}
      </button>
      
      {/* أزرار الصفحات */}
      <div className="flex items-center gap-1">
        {pages.map((pageItem, index) => {
          // النقاط الثلاث
          if (pageItem === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className={nonInteractiveClass}
                aria-hidden="true"
              >
                ...
              </span>
            );
          }
          
          // أزرار الصفحات الرقمية
          const pageNumber = pageItem as number;
          return (
            <button
              key={pageNumber}
              onClick={() => goToPage(pageNumber)}
              disabled={disabled || currentPage === pageNumber}
              className={currentPage === pageNumber ? selectedButtonClass : baseButtonClass}
              aria-label={`الانتقال إلى الصفحة ${pageNumber}`}
              aria-current={currentPage === pageNumber ? "page" : undefined}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>
      
      {/* زر الصفحة التالية */}
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={disabled || currentPage === pageCount}
        className={baseButtonClass}
        aria-label="الانتقال إلى الصفحة التالية"
      >
        {showText && <span className="hidden sm:inline-block">{nextLabel}</span>}
        <ChevronLeft size={16} />
      </button>
      
      {/* زر الصفحة الأخيرة */}
      {showEdges && (
        <button
          onClick={() => goToPage(pageCount)}
          disabled={disabled || currentPage === pageCount}
          className={baseButtonClass}
          aria-label="الانتقال إلى الصفحة الأخيرة"
        >
          {showText && <span className="hidden sm:inline-block">{lastLabel}</span>}
          <ChevronLast size={16} />
        </button>
      )}
    </nav>
  );
}