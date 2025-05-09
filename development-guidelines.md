# مبادئ تطوير مشروع FULLSCO

هذا الدليل يوفر إرشادات وقواعد يجب اتباعها أثناء تطوير مشروع FULLSCO باستخدام Next.js.

## الهيكل العام للمشروع

```
/ (الدليل الرئيسي)
├── components/        # مكونات واجهة المستخدم مقسمة حسب الوظيفة
│   ├── layout/        # مكونات تخطيط الصفحة (الهيدر، الفوتر، القالب الرئيسي)
│   ├── ui/            # مكونات واجهة المستخدم العامة
│   ├── scholarships/  # مكونات خاصة بصفحات المنح
│   ├── dashboard/     # مكونات خاصة بلوحة التحكم
│   └── ...
├── contexts/          # سياقات React (مثل: إعدادات الموقع، السمة، المصادقة)
├── hooks/             # React Hooks مخصصة
├── lib/               # وظائف مساعدة وثوابت
├── pages/             # الصفحات والمسارات الرئيسية للتطبيق
│   ├── api/           # نقاط نهاية API
│   ├── auth/          # صفحات المصادقة
│   ├── dashboard/     # صفحات لوحة التحكم
│   └── ...
├── public/            # الملفات الثابتة (الصور، الأيقونات)
├── styles/            # أنماط CSS العامة
└── db/                # كل ما يتعلق بقاعدة البيانات
```

## قواعد تسمية الملفات

1. استخدم `kebab-case` لتسمية:
   - ملفات المكونات
   - ملفات الصفحات
   - ملفات الأنماط

2. استخدم `PascalCase` لتسمية:
   - مكونات React
   - أنواع TypeScript

3. استخدم `camelCase` لتسمية:
   - المتغيرات
   - الوظائف
   - ملفات الدوال المساعدة

## معايير كتابة الكود

### TypeScript

- استخدم دائمًا أنواع TypeScript بدلاً من `any`.
- عرّف الواجهات (Interfaces) لجميع البيانات التي يتم تمريرها بين المكونات.
- قم بتصدير الأنواع المشتركة من ملفات منفصلة عند الحاجة.
- استخدم تعليقات JSDoc لتوثيق الدوال والمكونات المعقدة.

```typescript
/**
 * مكون يعرض بطاقة منحة دراسية
 * @param props خصائص البطاقة
 * @returns مكون React
 */
export function ScholarshipCard({ scholarship, isCompact = false }: ScholarshipCardProps) {
  // ...
}
```

### React

- استخدم المكونات الوظيفية (Functional Components) بدلاً من Class Components.
- استخدم React Hooks للحالة والتأثيرات.
- استفد من custom hooks لاستخراج المنطق المشترك.
- قم بتقسيم المكونات الكبيرة إلى مكونات أصغر ذات مسؤولية واحدة.

```tsx
// مثال على تقسيم المكونات
function ScholarshipPage() {
  return (
    <MainLayout>
      <ScholarshipHeader />
      <ScholarshipDetails />
      <ScholarshipRequirements />
      <RelatedScholarships />
    </MainLayout>
  );
}
```

### CSS / Styling

- استخدم Tailwind CSS كإطار عمل أساسي للتنسيق.
- اتبع نهج "Mobile First" في التصميم المتجاوب.
- استخدم متغيرات CSS للألوان والخطوط والقيم المتكررة.
- استخدم CSS Modules عند الحاجة إلى أنماط مخصصة معقدة.

```tsx
// مثال على استخدام Tailwind
<div className="flex flex-col md:flex-row gap-4 p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
  {/* المحتوى */}
</div>
```

## استخدام قاعدة البيانات

- استخدم Drizzle ORM لجميع عمليات قاعدة البيانات.
- عرّف جميع مخططات الجداول في `shared/schema.ts`.
- استخدم وظائف المساعدة المعرفة في `db/index.ts` للاتصال بقاعدة البيانات.
- اكتب استعلامات Drizzle ORM بشكل آمن لمنع هجمات SQL Injection.

```typescript
// مثال على استعلام قاعدة البيانات
import { db } from '@/db';
import { scholarships } from '@/shared/schema';
import { eq } from 'drizzle-orm';

// الحصول على منحة دراسية حسب المعرف
const scholarship = await db.query.scholarships.findFirst({
  where: eq(scholarships.id, scholarshipId),
  with: {
    category: true,
    country: true,
    level: true
  }
});
```

## استخدام API Routes

- ضع جميع API routes في الدليل `pages/api`.
- استخدم Next.js API Routes للوصول إلى قاعدة البيانات وأداء العمليات على الخادم.
- صمم API وفقًا لمبادئ REST.
- تحقق دائمًا من المدخلات والمخرجات باستخدام Zod.
- قم بالتعامل مع الأخطاء بشكل صحيح وإرجاع رموز HTTP مناسبة.

```typescript
// مثال على مسار API
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { scholarships } from '@/shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;
  
  try {
    const scholarship = await db.query.scholarships.findFirst({
      where: eq(scholarships.slug, slug as string)
    });
    
    if (!scholarship) {
      return res.status(404).json({ error: 'المنحة غير موجودة' });
    }
    
    return res.status(200).json({ scholarship });
  } catch (error) {
    console.error('خطأ في الحصول على المنحة:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء معالجة الطلب' });
  }
}
```

## دعم RTL واللغة العربية

- استخدم الاتجاه `dir="rtl"` للمحتوى العربي.
- استخدم خط Tajawal للمحتوى العربي.
- استخدم فئات Tailwind مثل `rtl:space-x-reverse` لدعم RTL.
- تأكد من أن جميع النصوص قابلة للترجمة ومخزنة بشكل منفصل.

```tsx
// مثال على دعم RTL
<div dir={isRtl ? 'rtl' : 'ltr'} className={isRtl ? 'font-tajawal' : 'font-inter'}>
  {children}
</div>
```

## الوضع الداكن (Dark Mode)

- استخدم فئات Tailwind للوضع الداكن مثل `dark:bg-gray-800`.
- احفظ تفضيل المستخدم في localStorage.
- قم بتنفيذ دعم النظام المفضل باستخدام `prefers-color-scheme`.

```tsx
// مثال على تنفيذ الوضع الداكن
useEffect(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    setTheme('dark');
    document.documentElement.classList.add('dark');
  } else {
    setTheme('light');
    document.documentElement.classList.remove('dark');
  }
}, []);
```

## التعامل مع الأخطاء والتحميل

- استخدم الحالات المناسبة لعرض حالات التحميل والأخطاء.
- قم بتنفيذ آليات استعادة الاتصال عند فشل الطلبات.
- سجل الأخطاء بشكل مناسب.

```tsx
// مثال على التعامل مع الأخطاء والتحميل
function ScholarshipsList() {
  const { data, isLoading, error } = useFetchScholarships();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorMessage message="تعذر تحميل المنح الدراسية" />;
  }
  
  if (!data || data.length === 0) {
    return <EmptyState message="لا توجد منح دراسية متاحة" />;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map(scholarship => (
        <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
      ))}
    </div>
  );
}
```

## SEO وPerformance

- استخدم Next.js Head لإضافة عناوين ووصفيات مخصصة لكل صفحة.
- استخدم صور متجاوبة مع `Image` component من Next.js.
- تحسين الأداء باستخدام Static Generation و Incremental Static Regeneration حيثما أمكن.
- استخدم تقسيمة الكود التلقائي في Next.js.

```tsx
// مثال على تحسين SEO
function ScholarshipPage({ scholarship }) {
  return (
    <>
      <Head>
        <title>{scholarship.title} | FULLSCO</title>
        <meta name="description" content={scholarship.description.substring(0, 160)} />
        <meta property="og:title" content={`${scholarship.title} | FULLSCO`} />
        <meta property="og:description" content={scholarship.description.substring(0, 160)} />
        {scholarship.thumbnail && <meta property="og:image" content={scholarship.thumbnail} />}
      </Head>
      
      {/* محتوى الصفحة */}
    </>
  );
}
```

---

## قائمة مراجعة قبل تقديم Pull Request

- [ ] التأكد من تطبيق جميع مبادئ التسمية والهيكلة
- [ ] التأكد من عدم وجود أخطاء TypeScript
- [ ] التأكد من دعم الوضع الداكن (Dark Mode)
- [ ] التأكد من دعم RTL للمحتوى العربي
- [ ] التأكد من استجابة واجهة المستخدم لجميع أحجام الشاشات
- [ ] التأكد من معالجة حالات التحميل والأخطاء
- [ ] التأكد من تحسين الأداء وسرعة التحميل
- [ ] التأكد من تحسين SEO
- [ ] التأكد من توثيق الكود بشكل جيد