import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search, X, Loader2, ArrowRight, AlertCircle, History } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SearchFormProps {
  defaultQuery?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  showLabel?: boolean;
  isCompact?: boolean;
  isSearchPage?: boolean;
  variant?: 'default' | 'shadcn';
  showSuggestions?: boolean;
  showHistory?: boolean;
  maxHistoryItems?: number;
  searchUrl?: string;
  isLoading?: boolean;
}

/**
 * مكون نموذج البحث المحسن
 * يتيح للمستخدمين البحث عن المنح الدراسية والمحتوى
 * مع دعم الاقتراحات وسجل البحث والمزيد من الميزات
 */
export function SearchForm({
  defaultQuery = '',
  placeholder = 'ابحث عن منح دراسية، جامعات، تخصصات...',
  onSearch,
  className = '',
  showLabel = false,
  isCompact = false,
  isSearchPage = false,
  variant = 'default',
  showSuggestions = false,
  showHistory = false,
  maxHistoryItems = 5,
  searchUrl = '/scholarships',
  isLoading = false
}: SearchFormProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(defaultQuery || '');
  const [isFocused, setIsFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // تحميل سجل البحث من التخزين المحلي عند التحميل
  useEffect(() => {
    if (typeof window !== 'undefined' && showHistory) {
      try {
        const storedHistory = localStorage.getItem('searchHistory');
        if (storedHistory) {
          const parsedHistory = JSON.parse(storedHistory);
          if (Array.isArray(parsedHistory)) {
            setSearchHistory(parsedHistory.slice(0, maxHistoryItems));
          }
        }
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
  }, [maxHistoryItems, showHistory]);
  
  // تحديث سجل البحث المعروض عند تغيير القيمة
  useEffect(() => {
    if (searchQuery.trim() && showHistory) {
      // تصفية سجل البحث ليعرض الكلمات المطابقة فقط
      const filteredHistory = searchHistory.filter(item => 
        item.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setRecentSearches(filteredHistory.slice(0, maxHistoryItems));
    } else if (showHistory) {
      // عرض آخر عمليات البحث عندما يكون حقل البحث فارغًا
      setRecentSearches(searchHistory.slice(0, maxHistoryItems));
    } else {
      setRecentSearches([]);
    }
  }, [searchQuery, searchHistory, maxHistoryItems, showHistory]);
  
  // معالجة تقديم النموذج
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    
    if (!trimmedQuery) return;
    
    // حفظ البحث في السجل
    if (showHistory) {
      const updatedHistory = [
        trimmedQuery,
        ...searchHistory.filter(item => item !== trimmedQuery)
      ].slice(0, maxHistoryItems);
      
      setSearchHistory(updatedHistory);
      
      try {
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      } catch (error) {
        console.error('Error saving search history:', error);
      }
    }
    
    // إجراء البحث
    if (onSearch) {
      onSearch(trimmedQuery);
    } else if (isSearchPage) {
      // إذا كنا في صفحة البحث، نقوم بتحديث الاستعلام فقط
      router.push({
        pathname: router.pathname,
        query: { ...router.query, search: trimmedQuery, page: '1' }
      }, undefined, { scroll: false });
    } else {
      // التوجيه إلى صفحة البحث
      router.push(`${searchUrl}?search=${encodeURIComponent(trimmedQuery)}`);
    }
    
    // إغلاق قائمة الاقتراحات
    setIsFocused(false);
  };
  
  // معالجة تغيير قيمة البحث
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // مسح البحث
  const clearSearch = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    } else if (isSearchPage) {
      const { search, ...restQuery } = router.query;
      router.push({
        pathname: router.pathname,
        query: { ...restQuery, page: '1' }
      }, undefined, { scroll: false });
    }
  };
  
  // استخدام بحث من سجل البحث
  const useHistoryItem = (query: string) => {
    setSearchQuery(query);
    
    if (onSearch) {
      onSearch(query);
    } else if (isSearchPage) {
      router.push({
        pathname: router.pathname,
        query: { ...router.query, search: query, page: '1' }
      }, undefined, { scroll: false });
    } else {
      router.push(`${searchUrl}?search=${encodeURIComponent(query)}`);
    }
    
    // إغلاق قائمة الاقتراحات
    setIsFocused(false);
  };
  
  // حذف عنصر من سجل البحث
  const removeHistoryItem = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    
    const updatedHistory = searchHistory.filter(item => item !== query);
    setSearchHistory(updatedHistory);
    setRecentSearches(updatedHistory.slice(0, maxHistoryItems));
    
    try {
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error updating search history:', error);
    }
  };
  
  // تحديد أنماط العناصر بناءً على حجم النموذج والنوع
  const getInputClasses = () => {
    if (variant === 'shadcn') {
      return cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-r-none',
        {
          'h-8 text-xs': isCompact,
          'h-12 text-base py-3': !isCompact
        }
      );
    }
    
    // التصميم الافتراضي
    return cn(
      'w-full rounded-lg sm:rounded-r-none text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary dark:focus:border-primary',
      {
        'py-2 px-4 pl-10 text-sm': isCompact,
        'py-3 md:py-4 px-4 pl-12': !isCompact
      }
    );
  };
  
  const getButtonClasses = () => {
    if (variant === 'shadcn') {
      return cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 sm:rounded-l-none',
        {
          'h-8 px-3 text-xs': isCompact,
          'h-12 px-6 text-base': !isCompact
        }
      );
    }
    
    // التصميم الافتراضي
    return cn(
      'bg-primary hover:bg-primary/90 text-white font-medium rounded-lg sm:rounded-l-none transition-colors',
      {
        'px-4 py-2 text-sm': isCompact,
        'px-6 py-3 md:py-4 text-base': !isCompact
      }
    );
  };
  
  return (
    <div className={className}>
      {showLabel && (
        <label htmlFor="search-input" className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
          البحث عن منح دراسية
        </label>
      )}
      
      <div className="relative">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row">
          <div className="relative flex-grow mb-2 sm:mb-0">
            <Search 
              className={cn(
                "absolute top-1/2 transform -translate-y-1/2 text-gray-400",
                variant === 'shadcn' ? "right-3" : "left-3"
              )} 
              size={isCompact ? 18 : 22}
            />
            
            <input
              id="search-input"
              type="text"
              className={getInputClasses()}
              placeholder={placeholder}
              value={searchQuery}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                // تأخير إغلاق قائمة الاقتراحات لتتمكن من النقر عليها
                setTimeout(() => setIsFocused(false), 200);
              }}
              aria-label="مربع البحث"
              autoComplete="off"
              dir="rtl"
            />
            
            {/* حالة التحميل أو مسح النص */}
            {isLoading ? (
              <div className="absolute left-3 right-auto top-1/2 transform -translate-y-1/2">
                <Loader2 className="animate-spin text-primary" size={isCompact ? 16 : 18} />
              </div>
            ) : searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className={cn(
                  "absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200",
                  variant === 'shadcn' ? "left-3" : "right-3"
                )}
                aria-label="مسح البحث"
              >
                <X size={isCompact ? 16 : 18} />
              </button>
            )}
          </div>
          
          <button
            type="submit"
            className={getButtonClasses()}
            disabled={!searchQuery.trim() || isLoading}
            aria-label="بحث"
          >
            {isLoading ? (
              <Loader2 className="animate-spin ml-2" size={isCompact ? 14 : 16} />
            ) : (
              <Search size={isCompact ? 14 : 16} className="ml-2" />
            )}
            بحث
          </button>
        </form>
        
        {/* قائمة الاقتراحات وسجل البحث */}
        {isFocused && (showSuggestions || showHistory) && recentSearches.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10 py-2 max-h-64 overflow-y-auto">
            {showHistory && recentSearches.length > 0 && (
              <div className="px-3 py-2">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <span className="flex items-center">
                    <History size={14} className="ml-1" />
                    عمليات البحث السابقة
                  </span>
                </div>
                
                <ul>
                  {recentSearches.map((query, index) => (
                    <li 
                      key={`history-${index}`} 
                      className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer flex items-center justify-between"
                      onClick={() => useHistoryItem(query)}
                    >
                      <div className="flex items-center">
                        <ArrowRight size={14} className="ml-2 text-gray-400" />
                        <span className="text-sm">{query}</span>
                      </div>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        onClick={(e) => removeHistoryItem(e, query)}
                        aria-label="حذف من سجل البحث"
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* يمكن إضافة اقتراحات البحث هنا في المستقبل */}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * مكون البحث المصغر
 * نسخة مبسطة من مكون البحث للاستخدام في الرأس والتنقل
 */
export function MiniSearchForm({
  onSearch,
  className = '',
  variant = 'default'
}: {
  onSearch?: (query: string) => void;
  className?: string;
  variant?: 'default' | 'shadcn';
}) {
  return (
    <SearchForm
      isCompact={true}
      showLabel={false}
      placeholder="ابحث هنا..."
      onSearch={onSearch}
      className={className}
      variant={variant}
    />
  );
}

/**
 * مكون البحث الشامل
 * نسخة موسعة من مكون البحث مع دعم كامل للتصفية والاقتراحات
 */
export function GlobalSearchForm({
  defaultQuery = '',
  className = '',
  variant = 'shadcn',
}: {
  defaultQuery?: string;
  className?: string;
  variant?: 'default' | 'shadcn';
}) {
  return (
    <SearchForm
      defaultQuery={defaultQuery}
      showLabel={true}
      placeholder="ابحث في جميع المحتوى..."
      isSearchPage={true}
      className={className}
      variant={variant}
      showSuggestions={true}
      showHistory={true}
      maxHistoryItems={5}
      searchUrl="/search"
    />
  );
}

export default SearchForm;