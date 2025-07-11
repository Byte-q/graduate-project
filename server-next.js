// server-next.js
// النسخة المحسنة للخادم المتكامل بين Next.js و Express

const express = require('express');
const next = require('next');
const { createServer } = require('http');
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');


// Load environment variables
dotenv.config();

// Determine if we're in development or production
const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || 'localhost'; // Use localhost for Replit compatibility
const port = process.env.PORT || 5000;

// Initialize Next.js app
const nextApp = next({ dev, hostname, port });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  // إنشاء تطبيق Express
  const app = express();
  
  // إنشاء اتصال بقاعدة البيانات
  const db = new Pool({ connectionString: process.env.DATABASE_URL });
  console.log("🔌 تم إنشاء اتصال بقاعدة البيانات");
  
  // إعداد الوسطاء الأساسية
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  // تخديم مجلد التحميلات كمجلد ساكن إذا كان موجوداً
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  // وسيط تسجيل طلبات API
  app.use('/api', (req, res, next) => {
    const start = Date.now();
    console.log(`API Request: ${req.method} ${req.url}`);
    
    // تسجيل وقت الاستجابة
    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.url} ${res.statusCode} in ${duration}ms`);
    });
    
    next();
  });
  
  // وسيط تتبع لمسارات /server/api
  app.use('/server/api', (req, res, next) => {
    const start = Date.now();
    console.log(`Server API Request: ${req.method} ${req.url}`);
    
    // تسجيل وقت الاستجابة
    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(`${req.method} /server/api${req.url} ${res.statusCode} in ${duration}ms`);
    });
    
    next();
  });

  // تسجيل نقطة نهاية صحة لاختبار عمل الخادم
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API server is running' });
  });
  
  app.get('/server/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server API is running' });
  });
  
  // تسجيل المسارات يدويًا بدلاً من محاولة استيراد ملف TypeScript

  // لا حاجة لاستيراد وحدات إضافية - سنستخدم المسارات المعرفة مباشرة

  // منع التكرار في المسارات: إصلاح شامل لمنع أي تكرار لـ /server/api في بداية المسار
  app.use((req, res, next) => {
    // إذا كان المسار يحتوي على تكرار /server/api في البداية، صححه
    const duplicatePattern = /^\/server\/api(\/server\/api)+/;
    if (duplicatePattern.test(req.url)) {
      const fixedUrl = req.url.replace(/(\/server\/api)+/, '/server/api');
      console.warn('تم اكتشاف تكرار في المسار:', req.url, '→ تصحيح إلى:', fixedUrl);
      return res.redirect(fixedUrl);
    }
    next();
  });

  // إضافة طرق المصادقة
  app.get('/server/api/auth/user', (req, res) => {
    console.log('طلب بيانات المستخدم');
    res.json({ authenticated: false, user: null });
  });
  
  // نسخة متوافقة مع المسار السابق
  app.get('/api/auth/user', (req, res) => {
    console.log('طلب بيانات المستخدم (مسار قديم)');
    res.json({ authenticated: false, user: null });
  });

  // إضافة مسارات المنح الدراسية
  // مسار البحث العام عن المنح الدراسية
  app.get('/server/api/scholarships', async (req, res) => {
    console.log('طلب البحث عن المنح الدراسية من قاعدة البيانات...');
    
    try {
      // استخراج معايير البحث من الاستعلام
      const {
        categoryId,
        countryId,
        levelId,
        keyword,
        page = 1,
        limit = 12
      } = req.query;
      
      // بناء استعلام SQL ديناميكي
      let sqlQuery = `
        SELECT s.*, 
               c.name as category_name, c.slug as category_slug,
               co.name as country_name, co.slug as country_slug,
               l.name as level_name, l.slug as level_slug
        FROM scholarships s
        LEFT JOIN categories c ON s.category_id = c.id
        LEFT JOIN countries co ON s.country_id = co.id
        LEFT JOIN levels l ON s.level_id = l.id
        WHERE 1=1
      `;
      
      // إضافة الشروط بناءً على معايير البحث
      const params = [];
      let paramIndex = 1;
      
      if (categoryId) {
        sqlQuery += ` AND s.category_id = $${paramIndex++}`;
        params.push(categoryId);
      }
      
      if (countryId) {
        sqlQuery += ` AND s.country_id = $${paramIndex++}`;
        params.push(countryId);
      }
      
      if (levelId) {
        sqlQuery += ` AND s.level_id = $${paramIndex++}`;
        params.push(levelId);
      }
      
      if (keyword) {
        sqlQuery += ` AND (
          s.title ILIKE $${paramIndex++} OR 
          s.description ILIKE $${paramIndex++} OR 
          s.content ILIKE $${paramIndex++}
        )`;
        const likePattern = `%${keyword}%`;
        params.push(likePattern, likePattern, likePattern);
      }
      
      // إضافة الترتيب والحد
      const offset = (page - 1) * limit;
      sqlQuery += ` ORDER BY s.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      params.push(limit, offset);
      
      // استعلام لحساب إجمالي المنح
      let countQuery = `
        SELECT COUNT(*) as total
        FROM scholarships s
        WHERE 1=1
      `;
      
      // نسخ شروط الاستعلام الأصلي (بدون LIMIT و OFFSET)
      let countParams = [];
      paramIndex = 1;
      
      if (categoryId) {
        countQuery += ` AND s.category_id = $${paramIndex++}`;
        countParams.push(categoryId);
      }
      
      if (countryId) {
        countQuery += ` AND s.country_id = $${paramIndex++}`;
        countParams.push(countryId);
      }
      
      if (levelId) {
        countQuery += ` AND s.level_id = $${paramIndex++}`;
        countParams.push(levelId);
      }
      
      if (keyword) {
        countQuery += ` AND (
          s.title ILIKE $${paramIndex++} OR 
          s.description ILIKE $${paramIndex++} OR 
          s.content ILIKE $${paramIndex++}
        )`;
        const likePattern = `%${keyword}%`;
        countParams.push(likePattern, likePattern, likePattern);
      }
      
      // تنفيذ استعلامات البحث
      const [result, countResult] = await Promise.all([
        db.query(sqlQuery, params),
        db.query(countQuery, countParams)
      ]);
      
      const scholarships = result.rows || [];
      const total = countResult.rows[0] ? parseInt(countResult.rows[0].total) : 0;
      console.log(`تم العثور على ${scholarships.length} منحة (من أصل ${total})`);
      
      // تحويل نتائج الاستعلام إلى التنسيق المطلوب
      const formattedScholarships = scholarships.map(row => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description,
        imageUrl: row.image_url,
        thumbnailUrl: row.image_url,
        deadline: row.deadline,
        amount: row.amount,
        currency: row.currency,
        university: row.university,
        isFeatured: row.is_featured,
        isFullyFunded: row.is_fully_funded,
        countryId: row.country_id,
        levelId: row.level_id,
        categoryId: row.category_id,
        createdAt: row.created_at,
        // لتوافق البيانات مع الواجهة
        image_url: row.image_url,
        is_featured: row.is_featured,
        is_fully_funded: row.is_fully_funded,
        category_id: row.category_id,
        country_id: row.country_id,
        level_id: row.level_id,
        // تضمين العلاقات
        category: row.category_name ? { 
          id: row.category_id, 
          name: row.category_name, 
          slug: row.category_slug 
        } : null,
        country: row.country_name ? { 
          id: row.country_id, 
          name: row.country_name, 
          slug: row.country_slug 
        } : null,
        level: row.level_name ? { 
          id: row.level_id, 
          name: row.level_name, 
          slug: row.level_slug 
        } : null
      }));
      
      // إرجاع النتائج مع معلومات الترقيم
      res.json({
        data: formattedScholarships,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('خطأ في البحث عن المنح الدراسية:', error);
      res.status(500).json({ 
        error: 'حدث خطأ أثناء البحث عن المنح الدراسية',
        details: error.message 
      });
    }
  });

  app.get('/server/api/scholarships/featured', async (req, res) => {
    console.log('طلب المنح المميزة من قاعدة البيانات...');
    
    try {
      // استخراج العدد المطلوب من المنح
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      
      // استعلام SQL مباشر لجلب المنح المميزة
      const sqlQuery = `
        SELECT s.*, 
               c.name as category_name, c.slug as category_slug,
               co.name as country_name, co.slug as country_slug,
               l.name as level_name, l.slug as level_slug
        FROM scholarships s
        LEFT JOIN categories c ON s.category_id = c.id
        LEFT JOIN countries co ON s.country_id = co.id
        LEFT JOIN levels l ON s.level_id = l.id
        WHERE s.is_featured = true
        ORDER BY s.created_at DESC
        LIMIT $1
      `;
      
      const result = await db.query(sqlQuery, [limit]);
      const scholarships = result.rows || [];
      console.log(`تم العثور على ${scholarships.length} منحة مميزة`);
      
      // تحويل نتائج الاستعلام إلى التنسيق المطلوب
      const formattedScholarships = scholarships.map(row => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description,
        imageUrl: row.image_url,
        deadline: row.deadline,
        amount: row.amount,
        currency: row.currency,
        university: row.university,
        isFeatured: row.is_featured,
        isFullyFunded: row.is_fully_funded,
        countryId: row.country_id,
        levelId: row.level_id,
        categoryId: row.category_id,
        createdAt: row.created_at,
        // تضمين العلاقات
        category: row.category_name ? { 
          id: row.category_id, 
          name: row.category_name, 
          slug: row.category_slug 
        } : null,
        country: row.country_name ? { 
          id: row.country_id, 
          name: row.country_name, 
          slug: row.country_slug 
        } : null,
        level: row.level_name ? { 
          id: row.level_id, 
          name: row.level_name, 
          slug: row.level_slug 
        } : null,
        // للتوافق مع الواجهة القديمة
        is_featured: row.is_featured,
        is_fully_funded: row.is_fully_funded,
        image_url: row.image_url,
        country_id: row.country_id,
        level_id: row.level_id,
        category_id: row.category_id,
        thumbnailUrl: row.image_url
      }));
      
      res.json(formattedScholarships);
    } catch (error) {
      console.error('خطأ في جلب المنح المميزة:', error);
      res.status(500).json({ 
        error: 'حدث خطأ أثناء جلب المنح المميزة',
        details: error.message 
      });
    }
  });

  app.get('/server/api/scholarships/by-slug/:slug', async (req, res) => {
    const { slug } = req.params;
    console.log(`جلب بيانات المنحة مع slug: ${slug}`);
    
    try {
      // استعلام SQL مباشر لجلب منحة معينة بواسطة slug
      const sqlQuery = `
        SELECT s.*, 
               c.name as category_name, c.slug as category_slug,
               co.name as country_name, co.slug as country_slug,
               l.name as level_name, l.slug as level_slug
        FROM scholarships s
        LEFT JOIN categories c ON s.category_id = c.id
        LEFT JOIN countries co ON s.country_id = co.id
        LEFT JOIN levels l ON s.level_id = l.id
        WHERE s.slug = $1
      `;
      
      const result = await db.query(sqlQuery, [slug]);
      const scholarships = result.rows || [];
      
      if (scholarships.length === 0) {
        return res.status(404).json({ error: 'المنحة غير موجودة' });
      }
      
      const row = scholarships[0];
      
      // تحويل النتيجة إلى التنسيق المطلوب
      const scholarship = {
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description,
        content: row.content,
        imageUrl: row.image_url,
        deadline: row.deadline,
        amount: row.amount,
        currency: row.currency,
        university: row.university,
        isFeatured: row.is_featured,
        isFullyFunded: row.is_fully_funded,
        countryId: row.country_id,
        levelId: row.level_id,
        categoryId: row.category_id,
        createdAt: row.created_at,
        // تضمين العلاقات
        category: row.category_name ? { 
          id: row.category_id, 
          name: row.category_name, 
          slug: row.category_slug 
        } : null,
        country: row.country_name ? { 
          id: row.country_id, 
          name: row.country_name, 
          slug: row.country_slug 
        } : null,
        level: row.level_name ? { 
          id: row.level_id, 
          name: row.level_name, 
          slug: row.level_slug 
        } : null,
        // للتوافق مع الواجهة القديمة
        is_featured: row.is_featured,
        is_fully_funded: row.is_fully_funded,
        image_url: row.image_url,
        country_id: row.country_id,
        level_id: row.level_id,
        category_id: row.category_id,
        thumbnailUrl: row.image_url
      };
      
      res.json(scholarship);
    } catch (error) {
      console.error(`خطأ في جلب المنحة مع slug ${slug}:`, error);
      res.status(500).json({ 
        error: 'حدث خطأ أثناء جلب المنحة',
        details: error.message 
      });
    }
  });

  // إضافة مسارات المقالات
  app.get('/server/api/posts', async (req, res) => {
    console.log('طلب المقالات من قاعدة البيانات...');
    
    try {
      // استخراج العدد المطلوب من المقالات
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      
      // محاولة استرداد مع استعلام أبسط
      const simpleQuery = `
        SELECT *
        FROM posts
        WHERE status = 'published'
        ORDER BY created_at DESC
        LIMIT $1
      `;
      
      const checkResult = await db.query(simpleQuery, [limit]);
      const posts = checkResult.rows || [];
      console.log(`✅ تم العثور على ${posts.length} مقالة`);
      
      // تحويل نتائج الاستعلام إلى التنسيق المطلوب
      const formattedPosts = posts.map(row => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        content: row.content,
        excerpt: row.excerpt || (row.content ? row.content.substring(0, 150) : ''),
        imageUrl: row.image_url,
        thumbnailUrl: row.image_url,
        authorId: row.author_id,
        authorName: 'مؤلف المقال', // تم تعيين قيمة افتراضية
        categoryId: row.category_id,
        status: row.status,
        isFeatured: row.is_featured,
        viewCount: row.view_count || 0,
        tags: row.tags ? row.tags : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      
      res.json(formattedPosts);
    } catch (error) {
      console.error('خطأ في جلب المقالات:', error);
      res.status(500).json({ 
        error: 'حدث خطأ أثناء جلب المقالات',
        details: error.message 
      });
    }
  });

  // إضافة مسارات قصص النجاح
  app.get('/server/api/success-stories', async (req, res) => {
    console.log('طلب قصص النجاح من قاعدة البيانات...');
    
    try {
      // استخراج العدد المطلوب من قصص النجاح
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      
      // استعلام SQL مباشر لجلب قصص النجاح
      const sqlQuery = `
        SELECT *
        FROM success_stories
        WHERE is_published = true
        ORDER BY created_at DESC
        LIMIT $1
      `;
      
      const result = await db.query(sqlQuery, [limit]);
      const stories = result.rows || [];
      console.log(`تم العثور على ${stories.length} قصة نجاح`);
      
      // تحويل نتائج الاستعلام إلى التنسيق المطلوب
      const formattedStories = stories.map(row => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        content: row.content,
        excerpt: row.excerpt || (row.content ? row.content.substring(0, 150) : ''),
        studentName: row.student_name || row.name || 'طالب',
        country: row.country || 'غير محدد',
        university: row.university || 'غير محدد',
        imageUrl: row.image_url,
        thumbnailUrl: row.image_url,
        graduationYear: row.graduation_year || 'غير محدد',
        scholarshipName: row.scholarship_name || 'غير محدد',
        degree: row.degree || 'غير محدد',
        createdAt: row.created_at,
        updatedAt: row.updated_at || row.created_at
      }));
      
      res.json(formattedStories);
    } catch (error) {
      console.error('خطأ في جلب قصص النجاح:', error);
      res.status(500).json({ 
        error: 'حدث خطأ أثناء جلب قصص النجاح',
        details: error.message 
      });
    }
  });

  // إضافة مسارات الفئات
  app.get('/server/api/categories', async (req, res) => {
    console.log('طلب الفئات من قاعدة البيانات...');
    
    try {
      // استعلام SQL مباشر لجلب الفئات
      const categoriesQuery = `
        SELECT *
        FROM categories
        ORDER BY name
      `;
      
      const categoriesResult = await db.query(categoriesQuery);
      const categories = categoriesResult.rows || [];
      console.log(`تم العثور على ${categories.length} فئة`);
      
      // استعلام لحساب عدد المنح في كل فئة
      const countQuery = `
        SELECT category_id, COUNT(*) as count
        FROM scholarships
        GROUP BY category_id
      `;
      
      const countResult = await db.query(countQuery);
      const countResults = countResult.rows || [];
      
      // إنشاء خريطة لعدد المنح في كل فئة
      const countMap = new Map();
      countResults.forEach(row => {
        countMap.set(row.category_id, parseInt(row.count));
      });
      
      // تحويل نتائج الاستعلام إلى التنسيق المطلوب
      const formattedCategories = categories.map(row => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        scholarshipCount: countMap.get(row.id) || 0
      }));
      
      res.json(formattedCategories);
    } catch (error) {
      console.error('خطأ في جلب الفئات:', error);
      res.status(500).json({ 
        error: 'حدث خطأ أثناء جلب الفئات',
        details: error.message 
      });
    }
  });

  // إضافة مسارات الدول
  app.get('/server/api/countries', async (req, res) => {
    console.log('طلب الدول من قاعدة البيانات...');
    
    try {
      // استعلام SQL مباشر لجلب الدول
      const countriesQuery = `
        SELECT *
        FROM countries
        ORDER BY name
      `;
      
      const countriesResult = await db.query(countriesQuery);
      const countries = countriesResult.rows || [];
      console.log(`تم العثور على ${countries.length} دولة`);
      
      // استعلام لحساب عدد المنح في كل دولة
      const countQuery = `
        SELECT country_id, COUNT(*) as count
        FROM scholarships
        GROUP BY country_id
      `;
      
      const countResult = await db.query(countQuery);
      const countResults = countResult.rows || [];
      
      // إنشاء خريطة لعدد المنح في كل دولة
      const countMap = new Map();
      countResults.forEach(row => {
        countMap.set(row.country_id, parseInt(row.count));
      });
      
      // تحويل نتائج الاستعلام إلى التنسيق المطلوب
      const formattedCountries = countries.map(row => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        flagUrl: row.flag_url,
        scholarshipCount: countMap.get(row.id) || 0
      }));
      
      res.json(formattedCountries);
    } catch (error) {
      console.error('خطأ في جلب الدول:', error);
      res.status(500).json({ 
        error: 'حدث خطأ أثناء جلب الدول',
        details: error.message 
      });
    }
  });

  // إضافة مسارات المستويات
  app.get('/server/api/levels', async (req, res) => {
    console.log('طلب المستويات من قاعدة البيانات...');
    
    try {
      // استعلام SQL مباشر لجلب المستويات
      const levelsQuery = `
        SELECT *
        FROM levels
        ORDER BY name
      `;
      
      const levelsResult = await db.query(levelsQuery);
      const levels = levelsResult.rows || [];
      console.log(`تم العثور على ${levels.length} مستوى`);
      
      // استعلام لحساب عدد المنح في كل مستوى
      const countQuery = `
        SELECT level_id, COUNT(*) as count
        FROM scholarships
        GROUP BY level_id
      `;
      
      const countResult = await db.query(countQuery);
      const countResults = countResult.rows || [];
      
      // إنشاء خريطة لعدد المنح في كل مستوى
      const countMap = new Map();
      countResults.forEach(row => {
        countMap.set(row.level_id, parseInt(row.count));
      });
      
      // تحويل نتائج الاستعلام إلى التنسيق المطلوب
      const formattedLevels = levels.map(row => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        scholarshipCount: countMap.get(row.id) || 0
      }));
      
      res.json(formattedLevels);
    } catch (error) {
      console.error('خطأ في جلب المستويات:', error);
      res.status(500).json({ 
        error: 'حدث خطأ أثناء جلب المستويات',
        details: error.message 
      });
    }
  });
  
  // إضافة مسار للحصول على إعدادات الموقع
  app.get('/server/api/site-settings', async (req, res) => {
    console.log('طلب إعدادات الموقع من قاعدة البيانات...');
    
    try {
      // استعلام SQL مباشر لجلب إعدادات الموقع
      const sqlQuery = `
        SELECT *
        FROM site_settings
        LIMIT 1
      `;
      
      const result = await db.query(sqlQuery);
      const results = result.rows || [];
      console.log(`تم العثور على ${results.length} إعداد`);
      
      if (results.length === 0) {
        // إعدادات افتراضية إذا لم يتم العثور على إعدادات
        return res.json({
          siteName: "منصة المنح الدراسية",
          siteDescription: "منصة لعرض المنح الدراسية حول العالم"
        });
      }
      
      const row = results[0];
      
      // تحويل النتيجة إلى التنسيق المطلوب
      const settings = {
        siteName: row.site_name,
        siteDescription: row.site_description,
        siteTagline: row.site_tagline,
        email: row.email,
        phone: row.phone,
        address: row.address,
        logo: row.logo,
        logoDark: row.logo_dark,
        favicon: row.favicon,
        facebook: row.facebook,
        twitter: row.twitter,
        instagram: row.instagram,
        youtube: row.youtube,
        linkedin: row.linkedin,
        whatsapp: row.whatsapp,
        
        primaryColor: row.primary_color,
        secondaryColor: row.secondary_color,
        accentColor: row.accent_color,
        enableDarkMode: row.enable_dark_mode,
        rtlDirection: row.rtl_direction,
        defaultLanguage: row.default_language,
        
        showHeroSection: row.show_hero_section,
        showFeaturedScholarships: row.show_featured_scholarships,
        showSearchSection: row.show_search_section,
        showCategoriesSection: row.show_categories_section,
        showCountriesSection: row.show_countries_section,
        showLatestArticles: row.show_latest_articles,
        showSuccessStories: row.show_success_stories,
        showNewsletterSection: row.show_newsletter_section,
        showStatisticsSection: row.show_statistics_section,
        showPartnersSection: row.show_partners_section,
        
        heroTitle: row.hero_title,
        heroSubtitle: row.hero_subtitle,
        heroDescription: row.hero_description,
        
        footerText: row.footer_text,
        
        // للتوافق مع الهيكل المطلوب
        theme: {
          primaryColor: row.primary_color,
          secondaryColor: row.secondary_color,
          accentColor: row.accent_color,
          enableDarkMode: row.enable_dark_mode,
          rtlDirection: row.rtl_direction
        },
        
        socialMedia: {
          facebook: row.facebook,
          twitter: row.twitter,
          instagram: row.instagram,
          youtube: row.youtube,
          linkedin: row.linkedin,
          whatsapp: row.whatsapp
        },
        
        layout: {
          homePageLayout: row.home_page_layout,
          scholarshipPageLayout: row.scholarship_page_layout,
          articlePageLayout: row.article_page_layout
        },
        
        sections: {
          showHeroSection: row.show_hero_section,
          showFeaturedScholarships: row.show_featured_scholarships,
          showSearchSection: row.show_search_section,
          showCategoriesSection: row.show_categories_section,
          showCountriesSection: row.show_countries_section,
          showLatestArticles: row.show_latest_articles,
          showSuccessStories: row.show_success_stories,
          showNewsletterSection: row.show_newsletter_section,
          showStatisticsSection: row.show_statistics_section,
          showPartnersSection: row.show_partners_section
        }
      };
      
      res.json(settings);
    } catch (error) {
      console.error('خطأ في جلب إعدادات الموقع:', error);
      res.status(500).json({ 
        error: 'حدث خطأ أثناء جلب إعدادات الموقع',
        details: error.message 
      });
    }
  });
  
  // إضافة مسار للحصول على القوائم
  app.get('/server/api/menus', async (req, res) => {
    console.log('طلب القوائم من قاعدة البيانات...');
    
    try {
      // استدعاء دالة بناء القائمة التي تحول قائمة مسطحة إلى شجرة
      const buildMenuTree = (items, parentId = null) => {
        return items
          .filter(item => item.parent_id === parentId)
          .map(item => ({
            id: item.id,
            title: item.title,
            type: item.type,
            url: item.url,
            slug: item.slug,
            targetBlank: item.target_blank,
            pageId: item.page_id,
            categoryId: item.category_id,
            levelId: item.level_id,
            countryId: item.country_id,
            scholarshipId: item.scholarship_id,
            postId: item.post_id,
            order: item.order,
            children: buildMenuTree(items, item.id)
          }));
      };
      
      // استعلام SQL مباشر لجلب القوائم
      const menusQuery = `
        SELECT *
        FROM menus
        WHERE is_active = true
      `;
      
      const menusResult = await db.query(menusQuery);
      const menus = menusResult.rows || [];
      console.log(`تم العثور على ${menus.length} قائمة`);
      
      if (menus.length === 0) {
        return res.json({
          header: [],
          footer: [],
          sidebar: [],
          mobile: []
        });
      }
      
      const menuIds = menus.map(menu => menu.id);
      
      // استعلام SQL مباشر لجلب عناصر القائمة
      const menuItemsQuery = `
        SELECT *
        FROM menu_items
        WHERE menu_id = ANY($1)
        ORDER BY menu_id, parent_id NULLS FIRST, "order"
      `;
      
      const menuItemsResult = await db.query(menuItemsQuery, [menuIds]);
      const menuItems = menuItemsResult.rows || [];
      console.log(`تم العثور على ${menuItems.length} عنصر قائمة`);
      
      // تنظيم القوائم حسب الموقع
      const headerMenu = menus.find(menu => menu.location === 'header');
      const footerMenu = menus.find(menu => menu.location === 'footer');
      const sidebarMenu = menus.find(menu => menu.location === 'sidebar');
      const mobileMenu = menus.find(menu => menu.location === 'mobile');
      
      // بناء هيكل شجرة القائمة لكل قائمة
      const headerItems = headerMenu ? buildMenuTree(menuItems.filter(item => item.menu_id === headerMenu.id)) : [];
      const footerItems = footerMenu ? buildMenuTree(menuItems.filter(item => item.menu_id === footerMenu.id)) : [];
      const sidebarItems = sidebarMenu ? buildMenuTree(menuItems.filter(item => item.menu_id === sidebarMenu.id)) : [];
      const mobileItems = mobileMenu ? buildMenuTree(menuItems.filter(item => item.menu_id === mobileMenu.id)) : [];
      
      // تجميع النتائج
      const result = {
        header: headerItems,
        footer: footerItems,
        sidebar: sidebarItems,
        mobile: mobileItems
      };
      
      res.json(result);
    } catch (error) {
      console.error('خطأ في جلب القوائم:', error);
      res.status(500).json({ 
        error: 'حدث خطأ أثناء جلب القوائم',
        details: error.message 
      });
    }
  });

  console.log('تم تسجيل مسارات API مبسطة للتطوير');
  
  // معالجة أخطاء API
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
  });
  
  // Next.js يتعامل مع جميع المسارات الأخرى
  app.all('*', (req, res) => {
    return handle(req, res);
  });
  
  // بدء تشغيل الخادم
  app.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${process.env.port}`);
  });
});