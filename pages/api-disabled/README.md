# تعطيل API Routes في Next.js

**ملاحظة مهمة**: تم تعطيل API Routes في Next.js في هذا المشروع.

## السبب
نحن نعتمد بشكل كامل على خادم Express.js الموجود في مجلد `/server` للواجهة الخلفية (Backend) بسبب:

1. خادم Express جاهز مسبقاً ومنظم جيداً
2. يوفر Express مرونة أكبر في التعامل مع:
   - المصادقة والجلسات
   - رفع الملفات
   - WebSockets
   - Middlewares المخصصة

## بنية المشروع
- **Next.js** (`/pages`): يستخدم فقط للواجهة الأمامية (Frontend) وتقديم صفحات SSR/SSG
- **Express** (`/server`): يتعامل مع جميع طلبات API والعمليات في الخلفية

## API Endpoints
جميع نقاط النهاية متاحة من خلال الخادم Express على المسار `/api/*`

## خطة التحول:
1. تم إنشاء وحدة `lib/api.ts` موحدة لاستدعاءات API للاتصال بخادم Express
2. تم تحديث السياقات مثل `contexts/site-settings-context.tsx` و `contexts/menus-context.tsx` لاستخدام وحدة API الجديدة
3. نحن في عملية تحديث جميع الصفحات للاتصال مباشرة بخادم Express بدلاً من Next.js API Routes

## للمطورين:
- استخدم وحدة `lib/api.ts` الجديدة لجميع طلبات API بدلاً من استدعاء `fetch` مباشرة.
- تجنب إنشاء نقاط نهاية جديدة في `/pages/api` وبدلاً من ذلك أضفها إلى `/server/routes`.