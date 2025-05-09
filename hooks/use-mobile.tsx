import { useState, useEffect } from 'react';

/**
 * Hook للكشف عما إذا كان الجهاز المستخدم هو جهاز محمول
 * يستخدم استعلام الوسائط لاكتشاف حجم الشاشة وتصنيفها كجهاز محمول
 * 
 * @returns {boolean} ما إذا كان الجهاز المستخدم هو جهاز محمول
 */
export function useMobile(): boolean {
  // افتراضيا، نحدد سطح المكتب كقيمة ابتدائية
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // تأكد من أننا في بيئة المتصفح
    if (typeof window === 'undefined') return;
    
    // إنشاء استعلام الوسائط للأجهزة المحمولة (أقل من 768 بكسل)
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    
    // تحديث الحالة بناءً على نتيجة الاستعلام
    const updateIsMobile = () => {
      setIsMobile(mediaQuery.matches);
    };
    
    // استدعاء وظيفة التحديث مرة واحدة عند بدء التشغيل
    updateIsMobile();
    
    // إضافة مستمع للتغييرات في حجم النافذة
    mediaQuery.addEventListener('change', updateIsMobile);
    
    // تنظيف عند تفكيك المكون
    return () => {
      mediaQuery.removeEventListener('change', updateIsMobile);
    };
  }, []);
  
  return isMobile;
}