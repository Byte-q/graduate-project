// أداة تشخيص لتتبع مكان استخدام Object.entries و Array.reduce
// قم بتشغيل هذا الملف لتعديل عمليات وتوفير معلومات التشخيص

// حفظ النسخة الأصلية من الدوال
const originalObjectEntries = Object.entries;
const originalArrayReduce = Array.prototype.reduce;

// تعديل Object.entries
Object.entries = function(obj) {
  if (obj === null || obj === undefined) {
    console.error('ERROR: Cannot convert undefined or null to object with Object.entries');
    console.error(new Error().stack);
    return [];
  }
  return originalObjectEntries.call(this, obj);
};

// تعديل Array.prototype.reduce
Array.prototype.reduce = function(callback, initialValue) {
  if (this === null || this === undefined) {
    console.error('ERROR: Cannot convert undefined or null to object with Array.reduce');
    console.error(new Error().stack);
    if (initialValue !== undefined) {
      return initialValue;
    }
    throw new TypeError('Cannot convert undefined or null to object');
  }
  return originalArrayReduce.call(this, callback, initialValue);
};

console.log('تم تحميل أدوات التشخيص، الآن يمكن تتبع أخطاء Object.entries و Array.reduce');