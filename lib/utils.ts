import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * وظيفة آمنة للاستخدام مع Object.entries
 */
export function safeObjectEntries(obj: any) {
  if (!obj || typeof obj !== 'object') {
    console.warn('WARNING: Attempting to use Object.entries on non-object:', obj);
    return [];
  }
  return Object.entries(obj);
}

/**
 * وظيفة آمنة للاستخدام مع Array.reduce
 */
export function safeReduce<T, U>(arr: any, callback: (acc: U, val: T, index: number, array: T[]) => U, initialValue: U): U {
  if (!Array.isArray(arr)) {
    console.warn('WARNING: Attempting to use Array.reduce on non-array:', arr);
    return initialValue;
  }
  return arr.reduce(callback, initialValue);
}

/**
 * وظيفة لتنسيق التواريخ بشكل آمن
 */
export function formatDate(date: Date | string | null | undefined): string | null {
  // إذا كانت القيمة غير موجودة
  if (date === null || date === undefined) return null;
  
  try {
    // إذا كان تاريخًا
    if (date instanceof Date) {
      if (isNaN(date.getTime())) {
        console.warn('Invalid Date object received in formatDate');
        return null;
      }
      return date.toISOString();
    }
    
    // إذا كان نصًا
    if (typeof date === 'string') {
      // تحقق من وجود قيمة فعلية في النص
      if (date.trim() === '') return null;
      
      // محاولة تحويله إلى تاريخ إذا كان صالحًا
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }
      // إذا لم يكن تاريخًا صالحًا، إعادة النص كما هو
      return date;
    }
    
    // في حالة أي نوع آخر، تحويله إلى نص
    console.warn('Unexpected type received in formatDate:', typeof date);
    return String(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
}

/**
 * وظيفة للتتبع والتشخيص
 * @param context - سياق التشخيص
 * @param data - البيانات المراد تتبعها
 */
export function debug(context: string, data: any) {
  console.log(`[DEBUG ${context}]:`, 
    typeof data === 'object' && data !== null 
      ? JSON.stringify(data, (key, value) => 
          value instanceof Date ? value.toISOString() : value, 2)
      : data
  );
}