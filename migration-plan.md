# خطة ترحيل API من Next.js إلى Express

## الملاحظات
- يستضيف المشروع خادمين: Next.js وExpress
- نستخدم حاليًا مزيجًا من مسارات Next.js API ومسارات Express API
- نريد توحيد جميع طلبات API باستخدام Express فقط

## الخطوات المكتملة
1. ✅ إنشاء وحدة `lib/api.ts` موحدة لاستدعاءات API
2. ✅ تحديث مستندات المشروع في `pages/api/README.md`
3. ✅ تحديث السياقات الرئيسية:
   - ✅ `contexts/site-settings-context.tsx`
   - ✅ `contexts/menus-context.tsx`
4. ✅ تحديث استدعاءات API في الصفحة الرئيسية
5. ✅ تحديث استدعاءات API في صفحة المقالات:
   - ✅ `pages/posts/index.tsx`
   - ✅ `pages/posts/[slug].tsx`
6. ✅ تحديث استدعاءات API في صفحة المنح الدراسية:
   - ✅ `pages/scholarships/index.tsx`
   - ✅ `pages/scholarships/[slug].tsx`
   - ✅ `pages/scholarships/search.tsx`

## الملفات المستهدفة للتحديث

### الصفحات
1. **الصفحة الرئيسية** - `pages/index.tsx` ✅
2. **صفحات المنح الدراسية**:
   - `pages/scholarships/index.tsx`
   - `pages/scholarships/[slug].tsx`
   - `pages/scholarships/search.tsx`
3. **صفحات المقالات**:
   - `pages/posts/index.tsx`
   - `pages/posts/[slug].tsx`
4. **صفحات قصص النجاح**:
   - `pages/success-stories/index.tsx`
   - `pages/success-stories/[slug].tsx`
5. **صفحات التصنيفات**:
   - `pages/categories/index.tsx`
   - `pages/categories/[slug].tsx`
6. **صفحات الدول**:
   - `pages/countries/index.tsx`
   - `pages/countries/[slug].tsx`
7. **صفحات المستويات الدراسية**:
   - `pages/levels/index.tsx`
   - `pages/levels/[slug].tsx`
8. **صفحات أخرى**:
   - `pages/contact.tsx`
   - `pages/auth/login.tsx`
   - `pages/auth/register.tsx`
   - `pages/profile.tsx`

### المكونات
1. **مكونات القائمة**:
   - `components/layout/Header.tsx`
   - `components/layout/Footer.tsx`
2. **نماذج الاتصال**:
   - `components/forms/ContactForm.tsx`
   - `components/forms/NewsletterForm.tsx`

### السياقات
1. ✅ `contexts/site-settings-context.tsx`
2. ✅ `contexts/menus-context.tsx`
3. `contexts/auth-context.tsx`

### الوحدات المساعدة
1. ✅ `lib/api.ts`

## خطة مستقبلية
- إزالة مسارات Next.js API تدريجيًا بعد تنفيذ جميع التغييرات المذكورة أعلاه
- نقل مجلد `pages/api` إلى `pages/api/disabled` للحفاظ على السجل التاريخي