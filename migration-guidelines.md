# دليل ترحيل مشروع FULLSCO إلى Next.js

هذا الدليل يشرح خطوات ترحيل تطبيق FULLSCO من React.js إلى Next.js، مع الحفاظ على وظائف التطبيق الأصلي وتحسين الأداء وقابلية الصيانة.

## المبادئ الأساسية للترحيل

1. **الترحيل التدريجي**: ترحيل المشروع على مراحل مع الحفاظ على قابلية التشغيل في كل مرحلة.
2. **تحسين الهيكل**: إعادة تنظيم الملفات وفقًا لأفضل ممارسات Next.js.
3. **تحسين الأداء**: الاستفادة من ميزات Next.js مثل التوليد الثابت (SSG) والتوليد من جانب الخادم (SSR).
4. **تحسين SEO**: استخدام ميزات Next.js لتحسين SEO وتجربة المستخدم.
5. **تحسين التصميم**: تحديث واجهة المستخدم باستخدام Tailwind CSS و shadcn/ui.

## خطوات الترحيل

### المرحلة 1: إعداد مشروع Next.js والبنية الأساسية

- [x] إنشاء مشروع Next.js جديد
- [x] تكوين TypeScript
- [x] إعداد Tailwind CSS
- [x] إعداد shadcn/ui
- [x] ترحيل مخطط قاعدة البيانات باستخدام Drizzle ORM
- [x] إنشاء هيكل الملفات والمجلدات
- [x] إعداد دعم RTL للغة العربية
- [x] إنشاء سياق إعدادات الموقع (SiteSettings)

### المرحلة 2: ترحيل المكونات الأساسية

- [x] ترحيل قالب الصفحة الرئيسي (MainLayout)
- [x] ترحيل مكون رأس الصفحة (Header)
- [x] ترحيل مكون تذييل الصفحة (Footer)
- [x] ترحيل مكون البحث
- [x] ترحيل مكون بطاقة المنحة (ScholarshipCard)
- [x] ترحيل مكون التنقل بين الصفحات (Pagination)
- [x] ترحيل مكونات التصفية والفرز

### المرحلة 3: ترحيل الصفحات العامة

- [x] ترحيل الصفحة الرئيسية
- [x] ترحيل صفحة 404
- [x] ترحيل صفحة المنح الدراسية
- [x] ترحيل صفحة تفاصيل المنحة
- [ ] ترحيل صفحة التصنيفات
- [ ] ترحيل صفحة تفاصيل التصنيف
- [ ] ترحيل صفحة الدول
- [ ] ترحيل صفحة تفاصيل الدولة
- [ ] ترحيل صفحة المستويات الدراسية
- [ ] ترحيل صفحة الاتصال

### المرحلة 4: ترحيل صفحات المقالات وقصص النجاح

- [ ] ترحيل صفحة المقالات
- [ ] ترحيل صفحة تفاصيل المقال
- [ ] ترحيل صفحة قصص النجاح
- [ ] ترحيل صفحة تفاصيل قصة النجاح
- [ ] ترحيل صفحة الصفحات الثابتة

### المرحلة 5: ترحيل نظام المصادقة وإدارة المستخدمين

- [ ] ترحيل صفحة تسجيل الدخول
- [ ] ترحيل صفحة إنشاء حساب
- [ ] ترحيل صفحة استعادة كلمة المرور
- [ ] ترحيل صفحة الملف الشخصي للمستخدم
- [ ] ترحيل وظائف إدارة المنح المحفوظة

### المرحلة 6: ترحيل لوحة التحكم

- [ ] ترحيل صفحة لوحة القيادة
- [ ] ترحيل إدارة المنح الدراسية
- [ ] ترحيل إدارة التصنيفات والدول والمستويات
- [ ] ترحيل إدارة المقالات وقصص النجاح
- [ ] ترحيل إدارة القوائم والصفحات الثابتة
- [ ] ترحيل إدارة المستخدمين
- [ ] ترحيل إعدادات الموقع

### المرحلة 7: الاختبار والتحسين

- [ ] اختبار شامل لجميع وظائف التطبيق
- [ ] تحسين الأداء
- [ ] تحسين SEO
- [ ] تحسين تجربة المستخدم
- [ ] تحسين الأمان

## تقنيات وأدوات الترحيل

| التقنية/الأداة | الغرض | مكون الاستخدام |
|---------------|-------|----------------|
| Next.js | إطار عمل React للتطبيقات الويب | أساس المشروع |
| TypeScript | لغة برمجة تستند إلى JavaScript مع إضافة الأنواع | جميع الملفات |
| Tailwind CSS | إطار عمل CSS للتنسيق | جميع المكونات |
| shadcn/ui | مكتبة مكونات واجهة المستخدم | الأزرار، الحقول، الجداول، إلخ. |
| Drizzle ORM | ORM لقاعدة البيانات | التعامل مع قاعدة البيانات |
| Zod | التحقق من البيانات | نماذج البيانات وطلبات API |
| Tajawal Font | خط عربي | المحتوى العربي |
| lucide-react | أيقونات بسيطة | جميع المكونات |
| react-query | إدارة حالة البيانات | طلبات API |

## تعديلات قاعدة البيانات

عند ترحيل المشروع، يتم الحفاظ على مخطط قاعدة البيانات الحالي مع بعض التحسينات:

1. **إضافة معلومات Timestamps**: تاريخ الإنشاء والتحديث لجميع الجداول.
2. **تحسين العلاقات**: تعريف العلاقات بشكل صريح باستخدام Drizzle ORM.
3. **تحسين التحقق من البيانات**: استخدام Zod للتحقق من البيانات.
4. **تحسين الاستعلامات**: استخدام استعلامات Drizzle ORM الآمنة.

## إرشادات ترحيل مكون

لترحيل مكون من المشروع القديم، اتبع هذه الخطوات:

1. **تحليل المكون**: فهم وظائف المكون ومتطلباته.
2. **إنشاء الهيكل الجديد**: إنشاء ملف جديد باستخدام هيكل Next.js المناسب.
3. **تحويل الحالة والدورة الحياتية**: استبدال الأساليب القديمة بـ React Hooks.
4. **ترحيل التنسيق**: تحويل CSS القديم إلى Tailwind CSS.
5. **إضافة أنواع TypeScript**: تعريف الأنواع والواجهات.
6. **تحسين الأداء**: استخدام ميزات React و Next.js لتحسين الأداء.
7. **اختبار المكون**: اختبار المكون بشكل منفصل وفي سياق التطبيق.

## مثال على ترحيل مكون

### المكون القديم (React.js)

```jsx
class ScholarshipCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHovered: false
    };
  }
  
  handleMouseEnter = () => {
    this.setState({ isHovered: true });
  }
  
  handleMouseLeave = () => {
    this.setState({ isHovered: false });
  }
  
  render() {
    const { scholarship } = this.props;
    const { isHovered } = this.state;
    
    return (
      <div 
        className={`scholarship-card ${isHovered ? 'hovered' : ''}`}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <div className="scholarship-image">
          <img src={scholarship.image || '/default-scholarship.jpg'} alt={scholarship.title} />
        </div>
        <div className="scholarship-content">
          <h3>{scholarship.title}</h3>
          <p>{scholarship.description.substring(0, 100)}...</p>
          <div className="scholarship-meta">
            <span className="country">{scholarship.country}</span>
            <span className="deadline">Deadline: {new Date(scholarship.deadline).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    );
  }
}
```

### المكون الجديد (Next.js با TypeScript)

```tsx
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Globe } from 'lucide-react';
import { Scholarship } from '@/shared/schema';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  isCompact?: boolean;
}

export function ScholarshipCard({ scholarship, isCompact = false }: ScholarshipCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Link
      href={`/scholarships/${scholarship.slug}`}
      className={`block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
        isHovered ? 'ring-2 ring-primary' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        {scholarship.thumbnailUrl ? (
          <Image
            src={scholarship.thumbnailUrl}
            alt={scholarship.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {scholarship.isFeatured && (
          <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs px-2 py-1 rounded">
            منحة مميزة
          </div>
        )}
        
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-center text-sm font-medium">
            <Globe className="w-4 h-4 mr-1" />
            {scholarship.country?.name || scholarship.studyDestination}
          </div>
        </div>
      </div>
      
      <div className="p-4 md:p-6">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{scholarship.title}</h3>
        
        {!isCompact && (
          <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {scholarship.description.substring(0, 100)}...
          </p>
        )}
        
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded">
            {scholarship.category?.name || scholarship.fundingType}
          </span>
          <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 px-2 py-1 rounded">
            {scholarship.level?.name || 'All Levels'}
          </span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4 mr-1" />
          <span>
            آخر موعد: {new Date(scholarship.deadline).toLocaleDateString('ar-EG')}
          </span>
        </div>
      </div>
    </Link>
  );
}
```

## إرشادات ترحيل API

لترحيل API من المشروع القديم، اتبع هذه الخطوات:

1. **تحليل نقطة النهاية**: فهم وظائف ومتطلبات نقطة النهاية.
2. **إنشاء ملف API Route**: إنشاء ملف API Route في Next.js.
3. **تنفيذ المنطق**: تنفيذ منطق API باستخدام Drizzle ORM.
4. **التحقق من المدخلات**: استخدام Zod للتحقق من المدخلات.
5. **معالجة الأخطاء**: تنفيذ معالجة الأخطاء المناسبة.
6. **اختبار API**: اختبار API باستخدام أدوات مثل Postman أو Thunder Client.

## ملخص الخطوات القادمة

لاستكمال ترحيل المشروع، يجب اتباع الخطوات التالية:

1. متابعة ترحيل المكونات الأساسية المتبقية.
2. ترحيل الصفحات العامة (المنح، التصنيفات، الدول، المستويات).
3. ترحيل صفحات المقالات وقصص النجاح.
4. ترحيل نظام المصادقة وإدارة المستخدمين.
5. ترحيل لوحة التحكم.
6. إجراء اختبارات شاملة وتحسينات.