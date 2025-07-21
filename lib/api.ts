/**
 * وحدة مساعدة للاتصال مع خادم Express API
 * تستخدم هذه الوحدة لتوحيد جميع طلبات API والتأكد من توجيهها إلى خادم Express
 */

import { debug } from './utils';

// الإعدادات الافتراضية
// - على الخادم: استخدم متغير البيئة API_BASE_URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://back-end-1-6vrh.onrender.com';

console.log(`API_BASE_URL is set to: ${API_BASE_URL}`);

// تعطيل التخزين المؤقت للطلبات في getServerSideProps
const DISABLE_SERVER_SIDE_CACHE = true;

// منع الطلبات المتكررة عن طريق تخزينها مؤقتاً
const CACHE_TIMEOUT = 30000; // 30 ثانية بالمللي ثانية
type CacheEntry<T> = { data: T, timestamp: number };
const apiCache: Record<string, CacheEntry<any>> = {};

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipCache?: boolean; // تجاوز التخزين المؤقت
  cacheTime?: number; // وقت التخزين المؤقت المخصص بالمللي ثانية
}

/**
 * وظيفة موحدة لجلب البيانات من Express API
 * 
 * @param endpoint - مسار النقطة النهائية للـ API (بدون '/api' في البداية)
 * @param options - خيارات اختيارية للطلب (مثل method, headers, body)
 * @returns وعد يرجع الاستجابة من API
 */
export async function apiFetch<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  // بناء عنوان URL مع معلمات الاستعلام إذا كانت موجودة
  let url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // تصحيح المسار
  // 1. إزالة أي تكرار لـ /server/api
  url = url.replace(/\/server\/api\/server\/api\//g, '/server/api/');
  
  // 2. استخدام بادئة /server/api لكل طلبات API
  if (!url.startsWith('/server/api')) {
    // إذا كان المسار يبدأ بـ /api، نستبدله بـ /server/api
    if (url.startsWith('/api/')) {
      url = url.replace('/api/', '/server/api/');
    } 
    // وإلا نضيف /server/api كبادئة
    else {
      url = `/server/api${url.startsWith('/') ? '' : '/'}${url}`;
    }
  }
  
  console.log('Using URL:', url);
  
  console.log(`API Request to: ${url}`);
  
  // صنع مفتاح للتخزين المؤقت يتضمن المسار والطريقة
  const cacheKey = `${options.method || 'GET'}:${url}`;
  
  // استخدام النتائج المخزنة مؤقتاً إذا كانت متوفرة وحديثة (إلا إذا كان يتم تخطي التخزين المؤقت)
  const cacheTime = options.cacheTime || CACHE_TIMEOUT;
  if (!options.skipCache && options.method === undefined || options.method === 'GET') {
    const cachedData = apiCache[cacheKey];
    const now = Date.now();
    
    if (cachedData && (now - cachedData.timestamp) < cacheTime) {
      console.log(`Using cached data for ${url}`);
      return cachedData.data as T;
    }
  }
  
  // إضافة معلمات الاستعلام إذا كانت موجودة
  if (options.params) {
    const queryParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
    
    const queryString = queryParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }
  
  // إضافة معلمة لمنع التخزين المؤقت على الخادم
  if (DISABLE_SERVER_SIDE_CACHE && typeof window === 'undefined') {
    url += (url.includes('?') ? '&' : '?') + `_nocache=${Date.now()}`;
  }

  // تكوين إعدادات الطلب
  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // إرسال ملفات تعريف الارتباط للمصادقة
    ...options,
  };
  
  // تحويل البيانات إلى JSON إذا كانت موجودة ولم يتم توفير body
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  try {
    debug('API Request', { url, options: fetchOptions });
    
    // إرسال الطلب - إضافة البادئة الكاملة للعنوان إذا كان على الخادم
    const fullUrl = typeof window === 'undefined' && !url.startsWith('http') 
      ? `${API_BASE_URL}${url}` 
      : url;
    
    console.log('Using full URL:', fullUrl);
    const response = await fetch(fullUrl, fetchOptions);
    
    // التحقق من نجاح الاستجابة
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `API error: ${response.status} ${response.statusText}`
      );
    }
    
    // التحقق من نوع المحتوى والحصول على البيانات
    const contentType = response.headers.get('content-type');
    let data: T;
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text() as unknown as T;
    }
    
    // تخزين البيانات في ذاكرة التخزين المؤقت إذا كانت طلب GET
    if ((options.method === undefined || options.method === 'GET') && !options.skipCache) {
      apiCache[cacheKey] = {
        data,
        timestamp: Date.now()
      };
    }
    
    return data;
    
  } catch (error) {
    debug('API Error', error);
    throw error;
  }
}

/**
 * وظيفة مختصرة لطلبات GET
 */
export function apiGet<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
  return apiFetch<T>(endpoint, { params });
}

/**
 * وظيفة مختصرة لطلبات POST
 */
export function apiPost<T = any>(endpoint: string, data?: any): Promise<T> {
  return apiFetch<T>(endpoint, { method: 'POST', body: data });
}

/**
 * وظيفة مختصرة لطلبات PUT
 */
export function apiPut<T = any>(endpoint: string, data?: any): Promise<T> {
  return apiFetch<T>(endpoint, { method: 'PUT', body: data });
}

/**
 * وظيفة مختصرة لطلبات PATCH
 */
export function apiPatch<T = any>(endpoint: string, data?: any): Promise<T> {
  return apiFetch<T>(endpoint, { method: 'PATCH', body: data });
}

/**
 * وظيفة مختصرة لطلبات DELETE
 */
export function apiDelete<T = any>(endpoint: string): Promise<T> {
  return apiFetch<T>(endpoint, { method: 'DELETE' });
}

/**
 * وظيفة لرفع الملفات إلى API
 */
export function apiUpload<T = any>(endpoint: string, formData: FormData): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    body: formData,
    headers: {}, // السماح لـ fetch بتعيين Content-Type تلقائيًا مع حدود متعددة الأجزاء
  });
}