import { useState, useEffect } from 'react';

interface CacheOptions {
  expiryTime?: number; // بالثواني
}

const DEFAULT_CACHE_EXPIRY = 60; // 60 ثانية كقيمة افتراضية

/**
 * خطاف للحصول على البيانات من مصدر خارجي مع دعم التخزين المؤقت
 * يساعد في تحسين الأداء من خلال تخزين البيانات في الذاكرة وإعادة استخدامها
 */
export function useCachedData<T>(
  url: string | null, 
  initialData: T,
  options: CacheOptions = {}
): {
  data: T;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  
  const { expiryTime = DEFAULT_CACHE_EXPIRY } = options;
  
  const fetchData = async () => {
    if (!url) {
      setIsLoading(false);
      return;
    }
    
    // التحقق من وجود البيانات في التخزين المؤقت
    const now = Date.now();
    if (lastFetched && (now - lastFetched) / 1000 < expiryTime) {
      setIsLoading(false);
      return; // البيانات المخزنة مؤقتاً لا تزال صالحة
    }
    
    try {
      setIsLoading(true);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      setData(result);
      setLastFetched(now);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setIsLoading(false);
    }
  };
  
  const refetch = async () => {
    setLastFetched(null); // إعادة تعيين وقت آخر جلب للبيانات لضمان إعادة جلبها
    await fetchData();
  };
  
  useEffect(() => {
    fetchData();
  }, [url]);
  
  return { data, isLoading, error, refetch };
}

/**
 * خزان تخزين مؤقت عالمي للبيانات
 * يتيح مشاركة التخزين المؤقت بين مختلف الصفحات والمكونات
 */
const globalCache: Record<string, { data: any; timestamp: number }> = {};

/**
 * دالة مساعدة للحصول على البيانات من واجهة برمجة التطبيقات مع دعم التخزين المؤقت
 * يمكن استخدامها في getServerSideProps
 */
export async function fetchWithCache<T>(
  url: string,
  defaultValue: T,
  expiryTime: number = DEFAULT_CACHE_EXPIRY
): Promise<T> {
  try {
    const now = Date.now();
    
    // التحقق من وجود البيانات في التخزين المؤقت
    if (
      globalCache[url] && 
      (now - globalCache[url].timestamp) / 1000 < expiryTime
    ) {
      return globalCache[url].data;
    }
    
    // جلب البيانات من المصدر
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // تخزين البيانات في التخزين المؤقت
    globalCache[url] = {
      data,
      timestamp: now
    };
    
    return data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    return defaultValue;
  }
}