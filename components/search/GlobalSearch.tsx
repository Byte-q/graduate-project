import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, Loader2, ExternalLink, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: number;
  title: string;
  url: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  description?: string;
  type: 'scholarship' | 'post' | 'story' | 'page' | 'category' | 'country' | 'level';
  typeLabel: string;
}

interface GlobalSearchProps {
  placeholder?: string;
  variant?: 'default' | 'minimal' | 'topbar';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onSearch?: (query: string, results: SearchResult[]) => void;
  maxResults?: number;
}

/**
 * مكون البحث العام الذي يبحث في جميع محتويات الموقع
 * يتيح البحث في المنح الدراسية، المقالات، قصص النجاح، الصفحات، التصنيفات، الدول، والمستويات الدراسية
 */
export function GlobalSearch({ 
  placeholder = 'ابحث في الموقع...', 
  variant = 'default',
  className = '',
  size = 'md',
  onSearch,
  maxResults = 10
}: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  // استرجاع تاريخ البحث من التخزين المحلي
  useEffect(() => {
    const storedHistory = localStorage.getItem('searchHistory');
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        if (Array.isArray(parsedHistory)) {
          setSearchHistory(parsedHistory.slice(0, 5));
        }
      } catch (e) {
        console.error('Error parsing search history:', e);
      }
    }
  }, []);

  // حفظ تاريخ البحث في التخزين المحلي
  const saveToHistory = (query: string) => {
    if (!query.trim()) return;
    
    const updatedHistory = [
      query,
      ...searchHistory.filter(item => item !== query)
    ].slice(0, 5);
    
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  // إغلاق نتائج البحث عند النقر خارج المكون
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target as Node) &&
        searchResultsRef.current && 
        !searchResultsRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // البحث عند تغيير الاستعلام
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch();
      } else {
        setResults([]);
        setError(null);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // وظيفة البحث
  const performSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setIsOpen(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=${maxResults}`);
      
      if (!response.ok) {
        throw new Error(`خطأ في البحث: ${response.status}`);
      }
      
      const data = await response.json();
      setResults(data.results || []);
      
      if (onSearch) {
        onSearch(query, data.results || []);
      }
    } catch (err) {
      console.error('خطأ في البحث:', err);
      setError('حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // معالجة عملية تقديم النموذج
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    saveToHistory(query);
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setIsOpen(false);
  };

  // معالجة مسح الاستعلام
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setError(null);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // التنقل في نتائج البحث باستخدام لوحة المفاتيح
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // تحديد فئات حجم المكون
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg'
  };

  // تحديد شكل المكون حسب الفئة
  const renderSearchBox = () => {
    if (variant === 'minimal') {
      return (
        <div className={cn("relative", className)}>
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={placeholder}
                className={cn(
                  "w-full pr-9 pl-9 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-primary focus:border-primary",
                  sizeClasses[size]
                )}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label="مسح البحث"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </form>
        </div>
      );
    }

    if (variant === 'topbar') {
      return (
        <div className={cn("relative", className)}>
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              setTimeout(() => {
                if (searchInputRef.current) {
                  searchInputRef.current.focus();
                }
              }, 100);
            }}
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Search size={16} />
            <span className="hidden sm:inline">{placeholder}</span>
          </button>
          
          {isOpen && (
            <div className="absolute top-full left-0 mt-2 w-screen max-w-md z-50">
              <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={placeholder}
                    className="w-full h-10 pr-9 pl-9 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-primary focus:border-primary"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      aria-label="مسح البحث"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      );
    }

    // التصميم الافتراضي
    return (
      <div className={cn("w-full relative", className)}>
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={placeholder}
              className={cn(
                "w-full pr-10 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-primary focus:border-primary",
                sizeClasses[size]
              )}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
            />
            {(query || isSearching) && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                {isSearching ? (
                  <Loader2 size={18} className="animate-spin text-primary" />
                ) : (
                  query && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      aria-label="مسح البحث"
                    >
                      <X size={18} />
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    );
  };

  // تصيير نتائج البحث
  const renderResults = () => {
    if (!isOpen) return null;

    return (
      <div
        ref={searchResultsRef}
        className="absolute left-0 right-0 z-30 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-[80vh] overflow-y-auto"
      >
        <div className="p-2">
          {/* حالة التحميل */}
          {isSearching && query && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="mr-2 text-gray-600 dark:text-gray-300">جاري البحث...</span>
            </div>
          )}

          {/* رسالة الخطأ */}
          {error && (
            <div className="flex items-center p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
              <AlertCircle className="h-5 w-5 ml-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* لا توجد نتائج */}
          {!isSearching && query && results.length === 0 && !error && (
            <div className="flex items-center justify-center flex-col py-8 px-4 text-center">
              <Info className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-gray-600 dark:text-gray-300 text-lg">لا توجد نتائج مطابقة لـ "{query}"</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">حاول استخدام كلمات مفتاحية مختلفة أو تصفح التصنيفات</p>
            </div>
          )}

          {/* عرض النتائج */}
          {results.length > 0 && (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={result.url}
                  onClick={() => {
                    saveToHistory(query);
                    setIsOpen(false);
                  }}
                  className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-md transition-colors"
                >
                  {/* صورة مصغرة (إذا كانت متوفرة) */}
                  {(result.thumbnailUrl || result.imageUrl) && (
                    <div className="flex-shrink-0 h-12 w-12 ml-3 relative overflow-hidden rounded-md">
                      <Image
                        src={result.thumbnailUrl || result.imageUrl || '/images/placeholder.svg'}
                        alt={result.title}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {/* نوع النتيجة */}
                    <div className="flex items-center mb-1">
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                        {result.typeLabel}
                      </span>
                    </div>

                    {/* عنوان النتيجة */}
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{result.title}</h4>

                    {/* وصف النتيجة (إذا كان متوفراً) */}
                    {result.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{result.description}</p>
                    )}
                  </div>

                  <ExternalLink size={16} className="flex-shrink-0 text-gray-400 mr-2 mt-1" />
                </Link>
              ))}
            </div>
          )}

          {/* تاريخ البحث عند عدم وجود استعلام */}
          {!query && searchHistory.length > 0 && (
            <div className="py-2">
              <div className="flex items-center justify-between px-3 mb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">آخر عمليات البحث</h4>
                <button
                  type="button"
                  onClick={() => {
                    setSearchHistory([]);
                    localStorage.removeItem('searchHistory');
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  مسح التاريخ
                </button>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {searchHistory.map((historyItem, index) => (
                  <button
                    key={`history-${index}`}
                    type="button"
                    onClick={() => {
                      setQuery(historyItem);
                      if (searchInputRef.current) {
                        searchInputRef.current.focus();
                      }
                    }}
                    className="flex items-center w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-750 text-right"
                  >
                    <Search size={14} className="ml-2 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {historyItem}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* زر البحث المتقدم */}
          <div className="p-2 mt-1 border-t border-gray-100 dark:border-gray-700">
            <Link
              href={`/search${query ? `?q=${encodeURIComponent(query)}` : ''}`}
              onClick={() => {
                if (query) saveToHistory(query);
                setIsOpen(false);
              }}
              className="flex items-center justify-center w-full py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-650 rounded-md text-gray-700 dark:text-gray-200 text-sm"
            >
              بحث متقدم
              <Search size={14} className="mr-1" />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  // تصيير المكون الكامل
  return (
    <div className="relative w-full">
      {renderSearchBox()}
      {renderResults()}
    </div>
  );
}

/**
 * مكون البحث العام المصغر للاستخدام في الشريط العلوي أو المناطق التي تتطلب حجماً أصغر
 */
export function MiniGlobalSearch(props: Omit<GlobalSearchProps, 'variant' | 'size'>) {
  return <GlobalSearch {...props} variant="minimal" size="sm" />;
}

/**
 * مكون البحث العام للشريط العلوي مع واجهة زر
 */
export function TopbarSearch(props: Omit<GlobalSearchProps, 'variant'>) {
  return <GlobalSearch {...props} variant="topbar" />;
}