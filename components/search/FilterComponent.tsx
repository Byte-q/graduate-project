import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, X, Filter, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Category, Country, Level } from '@/shared/schema';

interface FilterComponentProps {
  title?: string;
  categories?: Category[];
  countries?: Country[];
  levels?: Level[];
  fundingTypes?: string[];
  defaultValues?: Record<string, string>;
  onFilterChange: (filters: Record<string, string>) => void;
  isLoading?: boolean;
  showApplyButton?: boolean;
  showActiveCount?: boolean;
  includeKeywordSearch?: boolean;
  variant?: 'default' | 'shadcn' | 'minimal';
  className?: string;
}

export function FilterComponent({
  title = 'تصفية النتائج',
  categories = [],
  countries = [],
  levels = [],
  fundingTypes = [],
  defaultValues = {},
  onFilterChange,
  isLoading = false,
  showApplyButton = true,
  showActiveCount = false,
  includeKeywordSearch = true,
  variant = 'default',
  className
}: FilterComponentProps) {
  const [filters, setFilters] = useState<Record<string, string>>({
    category: '',
    country: '',
    level: '',
    fundingType: '',
    dateRange: '',
    sortBy: 'relevance',
    ...defaultValues
  });
  
  const [keyword, setKeyword] = useState('');
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [isOpen, setIsOpen] = useState<Record<string, boolean>>({
    categories: true,
    countries: true,
    levels: true,
    fundingTypes: true,
    dateRange: true,
    sortBy: true,
  });

  // حساب عدد الفلاتر النشطة
  useEffect(() => {
    const count = Object.values(filters).filter(value => value && value !== 'relevance').length;
    setActiveFiltersCount(count);
  }, [filters]);

  // تطبيق الفلاتر عند تغييرها
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    
    setFilters(newFilters);
    
    if (!showApplyButton) {
      onFilterChange(newFilters);
    }
  };

  // تطبيق الفلاتر عند النقر على زر التطبيق
  const applyFilters = () => {
    const filtersWithKeyword = includeKeywordSearch && keyword 
      ? { ...filters, keyword } 
      : filters;
    
    onFilterChange(filtersWithKeyword);
  };

  // إعادة تعيين الفلاتر
  const resetFilters = () => {
    const defaultFilters = {
      category: '',
      country: '',
      level: '',
      fundingType: '',
      dateRange: '',
      sortBy: 'relevance'
    };
    
    setFilters(defaultFilters);
    setKeyword('');
    
    onFilterChange(defaultFilters);
  };

  // التبديل بين فتح وإغلاق قسم معين
  const toggleSection = (section: string) => {
    setIsOpen(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // تصيير قسم الفلتر مع عنوان قابل للطي
  const renderFilterSection = (
    title: string, 
    section: string, 
    children: React.ReactNode
  ) => {
    if (variant === 'minimal') {
      return (
        <div className="mb-4">
          <div className="mb-2 font-medium text-gray-700 dark:text-gray-300">{title}</div>
          {children}
        </div>
      );
    }
    
    return (
      <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection(section)}
          className="flex items-center justify-between w-full p-3 text-right bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
        >
          <span className="font-medium text-gray-700 dark:text-gray-300">{title}</span>
          <ChevronDown 
            className={cn(
              "h-4 w-4 transition-transform", 
              isOpen[section] ? "transform rotate-180" : ""
            )}
          />
        </button>
        
        {isOpen[section] && (
          <div className="p-3 bg-white dark:bg-gray-800">
            {children}
          </div>
        )}
      </div>
    );
  };

  // تصيير خيارات الفلتر (مثل التصنيفات، الدول، إلخ)
  const renderFilterOptions = (
    options: { id: number; name: string; slug: string }[],
    type: string,
    selectedValue: string
  ) => {
    return (
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {options.map((option) => (
          <label
            key={`${type}-${option.id}`}
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer",
              filters[type] === option.slug
                ? "bg-primary/10 text-primary"
                : "hover:bg-gray-100 dark:hover:bg-gray-750"
            )}
          >
            <input
              type="radio"
              name={type}
              value={option.slug}
              checked={filters[type] === option.slug}
              onChange={() => handleFilterChange(type, option.slug)}
              className="sr-only"
            />
            <span className={cn(
              "h-4 w-4 rounded-full border flex items-center justify-center",
              filters[type] === option.slug 
                ? "border-primary" 
                : "border-gray-300 dark:border-gray-600"
            )}>
              {filters[type] === option.slug && (
                <span className="h-2 w-2 rounded-full bg-primary" />
              )}
            </span>
            <span className="block truncate">{option.name}</span>
          </label>
        ))}
        
        {options.length > 0 && (
          <label
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer",
              !selectedValue
                ? "bg-primary/10 text-primary"
                : "hover:bg-gray-100 dark:hover:bg-gray-750"
            )}
          >
            <input
              type="radio"
              name={type}
              value=""
              checked={!selectedValue}
              onChange={() => handleFilterChange(type, '')}
              className="sr-only"
            />
            <span className={cn(
              "h-4 w-4 rounded-full border flex items-center justify-center",
              !selectedValue
                ? "border-primary" 
                : "border-gray-300 dark:border-gray-600"
            )}>
              {!selectedValue && (
                <span className="h-2 w-2 rounded-full bg-primary" />
              )}
            </span>
            <span className="block truncate">الكل</span>
          </label>
        )}
        
        {options.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400 py-1">
            لا توجد خيارات متاحة
          </div>
        )}
      </div>
    );
  };

  // تصيير الفلاتر النشطة
  const renderActiveFilters = () => {
    if (activeFiltersCount === 0) return null;
    
    const getFilterLabel = (key: string, value: string) => {
      switch (key) {
        case 'category':
          return categories.find(c => c.slug === value)?.name || value;
        case 'country':
          return countries.find(c => c.slug === value)?.name || value;
        case 'level':
          return levels.find(l => l.slug === value)?.name || value;
        case 'fundingType':
          return fundingTypes.find(f => f === value) || value;
        case 'sortBy':
          return value === 'relevance' ? 'الأكثر صلة' : 
                 value === 'date' ? 'الأحدث' : 
                 value === 'deadline' ? 'الموعد النهائي' : value;
        default:
          return value;
      }
    };
    
    return (
      <div className="mt-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            الفلاتر النشطة ({activeFiltersCount})
          </span>
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs text-red-600 dark:text-red-400 hover:underline"
          >
            إعادة تعيين الكل
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value || (key === 'sortBy' && value === 'relevance')) return null;
            
            return (
              <span
                key={`active-${key}-${value}`}
                className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-750 rounded-md text-sm"
              >
                {getFilterLabel(key, value)}
                <button
                  type="button"
                  onClick={() => handleFilterChange(key, '')}
                  className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={14} />
                </button>
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  // تصيير المكون في النمط المبسط
  if (variant === 'minimal') {
    return (
      <div className={cn("bg-white dark:bg-gray-800 border-0", className)}>
        {title && <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">{title}</h3>}
        
        {includeKeywordSearch && (
          <div className="mb-4">
            <div className="mb-2 font-medium text-gray-700 dark:text-gray-300">بحث</div>
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="بحث..."
                className="w-full p-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        )}
        
        {categories.length > 0 && (
          <div className="mb-4">
            <div className="mb-2 font-medium text-gray-700 dark:text-gray-300">التصنيف</div>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">جميع التصنيفات</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {countries.length > 0 && (
          <div className="mb-4">
            <div className="mb-2 font-medium text-gray-700 dark:text-gray-300">الدولة</div>
            <select
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">جميع الدول</option>
              {countries.map((country) => (
                <option key={country.id} value={country.slug}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {levels.length > 0 && (
          <div className="mb-4">
            <div className="mb-2 font-medium text-gray-700 dark:text-gray-300">المستوى الدراسي</div>
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">جميع المستويات</option>
              {levels.map((level) => (
                <option key={level.id} value={level.slug}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {showApplyButton && (
          <button
            type="button"
            onClick={applyFilters}
            className="w-full py-2 bg-primary text-white rounded-md hover:bg-primary-focus transition-colors"
          >
            تطبيق الفلاتر
          </button>
        )}
      </div>
    );
  }

  // تصيير المكون في النمط الافتراضي أو نمط shadcn
  return (
    <div className={cn(
      variant === 'shadcn'
        ? "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
        : "bg-white dark:bg-gray-800",
      className
    )}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {title}
          {showActiveCount && activeFiltersCount > 0 && (
            <span className="ml-2 text-xs font-normal bg-primary/20 text-primary rounded-full px-1.5 py-0.5">
              {activeFiltersCount}
            </span>
          )}
        </h3>
        
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            إعادة تعيين
          </button>
        )}
      </div>
      
      {/* الفلاتر النشطة */}
      {showActiveCount && renderActiveFilters()}
      
      {/* حقل البحث بالكلمات المفتاحية */}
      {includeKeywordSearch && (
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="بحث..."
              className="w-full p-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      )}
      
      {/* أقسام الفلاتر */}
      {categories.length > 0 && (
        renderFilterSection('التصنيف', 'categories', renderFilterOptions(categories, 'category', filters.category))
      )}
      
      {countries.length > 0 && (
        renderFilterSection('الدولة', 'countries', renderFilterOptions(countries, 'country', filters.country))
      )}
      
      {levels.length > 0 && (
        renderFilterSection('المستوى الدراسي', 'levels', renderFilterOptions(levels, 'level', filters.level))
      )}
      
      {fundingTypes.length > 0 && (
        renderFilterSection('نوع التمويل', 'fundingTypes', (
          <div className="space-y-2">
            {fundingTypes.map((type) => (
              <label
                key={`funding-${type}`}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer",
                  filters.fundingType === type
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-gray-100 dark:hover:bg-gray-750"
                )}
              >
                <input
                  type="radio"
                  name="fundingType"
                  value={type}
                  checked={filters.fundingType === type}
                  onChange={() => handleFilterChange('fundingType', type)}
                  className="sr-only"
                />
                <span className={cn(
                  "h-4 w-4 rounded-full border flex items-center justify-center",
                  filters.fundingType === type 
                    ? "border-primary" 
                    : "border-gray-300 dark:border-gray-600"
                )}>
                  {filters.fundingType === type && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </span>
                <span>{type}</span>
              </label>
            ))}
            
            <label
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer",
                !filters.fundingType
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-750"
              )}
            >
              <input
                type="radio"
                name="fundingType"
                value=""
                checked={!filters.fundingType}
                onChange={() => handleFilterChange('fundingType', '')}
                className="sr-only"
              />
              <span className={cn(
                "h-4 w-4 rounded-full border flex items-center justify-center",
                !filters.fundingType
                  ? "border-primary" 
                  : "border-gray-300 dark:border-gray-600"
              )}>
                {!filters.fundingType && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
              </span>
              <span>الكل</span>
            </label>
          </div>
        ))
      )}
      
      {/* الترتيب حسب */}
      {renderFilterSection('الترتيب حسب', 'sortBy', (
        <div className="space-y-2">
          {[
            { value: 'relevance', label: 'الأكثر صلة' },
            { value: 'date', label: 'الأحدث' },
            { value: 'deadline', label: 'الموعد النهائي' }
          ].map((option) => (
            <label
              key={`sort-${option.value}`}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer",
                filters.sortBy === option.value
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-750"
              )}
            >
              <input
                type="radio"
                name="sortBy"
                value={option.value}
                checked={filters.sortBy === option.value}
                onChange={() => handleFilterChange('sortBy', option.value)}
                className="sr-only"
              />
              <span className={cn(
                "h-4 w-4 rounded-full border flex items-center justify-center",
                filters.sortBy === option.value 
                  ? "border-primary" 
                  : "border-gray-300 dark:border-gray-600"
              )}>
                {filters.sortBy === option.value && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
              </span>
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      ))}
      
      {/* زر تطبيق الفلاتر */}
      {showApplyButton && (
        <button
          type="button"
          onClick={applyFilters}
          disabled={isLoading}
          className={cn(
            "w-full mt-4 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-md hover:bg-primary-focus transition-colors",
            isLoading && "opacity-75 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>جاري التطبيق...</span>
            </>
          ) : (
            <>
              <Filter size={16} />
              <span>تطبيق الفلاتر</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}