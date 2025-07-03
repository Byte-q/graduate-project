import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { users } from '@/shared/schema';
import { eq, like, desc, asc, and, or } from 'drizzle-orm';

// تعريف نوع البيانات للرد
type ApiResponse = {
  users?: any[];
  totalPages?: number;
  error?: string;
};

// الطلبات لكل صفحة
const PAGE_SIZE = 10;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // التحقق من صلاحيات المسؤول
  // هذا مجرد تمثيل، وفي الواقع ستقوم بالتحقق من الجلسة والصلاحيات
  try {
    // استخراج معلمات الاستعلام
    const { 
      page = '1', 
      role = '', 
      status = '',
      search = '',
      sortBy = 'createdAt',
      sortDirection = 'desc'
    } = req.query;

    // الصفحة الحالية
    const currentPage = parseInt(page as string, 10) || 1;
    
    // بناء استعلام مع المرشحات
    let whereConditions = [];

    // إضافة مرشحات البحث إذا وجدت
    if (search) {
      const searchTerm = `%${search}%`;
      whereConditions.push(
        or(
          like(users.fullName, searchTerm),
          like(users.username, searchTerm),
          like(users.email, searchTerm)
        )
      );
    }

    // تصفية حسب الدور
    if (role && role !== 'all') {
      whereConditions.push(eq(users.role, role as string));
    }

    // بناء الاستعلام الأساسي مع المرشحات
    const filteredQuery = whereConditions.length > 0
      ? db.select().from(users).where(and(...whereConditions))
      : db.select().from(users);

    // في البيئة الحقيقية، ستقوم بتصفية حسب الحالة (نشط/غير نشط)
    // هنا نفترض وجود حقل isActive في جدول المستخدمين
    // if (status && status !== 'all') {
    //   filteredQuery = filteredQuery.where(eq(users.isActive, status === 'active'));
    // }

    // استعلام منفصل لحساب العدد الإجمالي
    const countQuery = whereConditions.length > 0
      ? db.select().from(users).where(and(...whereConditions))
      : db.select().from(users);
    const totalCountArr = await countQuery.execute();
    const totalPages = Math.ceil(totalCountArr.length / PAGE_SIZE);
    // ترتيب النتائج
    let pagedQuery;
    if (sortDirection === 'asc') {
      // @ts-ignore - سنتجاهل خطأ TypeScript هنا لأن الحقل قد يكون ديناميكيًا
      pagedQuery = filteredQuery.orderBy(asc(users[sortBy as keyof typeof users]));
    } else {
      // @ts-ignore - سنتجاهل خطأ TypeScript هنا لأن الحقل قد يكون ديناميكيًا
      pagedQuery = filteredQuery.orderBy(desc(users[sortBy as keyof typeof users]));
    }

    // الحصول على الصفحة المطلوبة
    pagedQuery = pagedQuery.limit(PAGE_SIZE).offset((currentPage - 1) * PAGE_SIZE);

    // تنفيذ الاستعلام
    const usersData = await pagedQuery.execute();
    
    // ضبط بنية البيانات النهائية
    const formattedUsers = usersData.map(user => {
      // تحويل التواريخ إلى سلاسل نصية ISO لتجنب أخطاء التسلسل
      const createdAt = user.createdAt instanceof Date 
        ? user.createdAt.toISOString() 
        : user.createdAt;
      
      // يمكن إضافة معالجة إضافية هنا مثل إخفاء كلمة المرور
      const { password, ...userWithoutPassword } = user;
      
      return {
        ...userWithoutPassword,
        createdAt,
        // إضافة isActive افتراضيًا للتوافق مع واجهة العرض
        // في البيئة الحقيقية، سيتم جلب هذا من قاعدة البيانات
        isActive: true
      };
    });
    
    // إعادة البيانات
    res.status(200).json({
      users: formattedUsers,
      totalPages
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء جلب بيانات المستخدمين' 
    });
  }
}