import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { users } from '@/shared/schema';
import { eq, like, desc, asc } from 'drizzle-orm';

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
    let query = db.select().from(users);
    
    // إضافة مرشحات البحث إذا وجدت
    if (search) {
      const searchTerm = `%${search}%`;
      query = query.where(
        like(users.fullName, searchTerm) || 
        like(users.username, searchTerm) || 
        like(users.email, searchTerm)
      );
    }
    
    // تصفية حسب الدور
    if (role && role !== 'all') {
      query = query.where(eq(users.role, role as string));
    }
    
    // في البيئة الحقيقية، ستقوم بتصفية حسب الحالة (نشط/غير نشط)
    // هنا نفترض وجود حقل isActive في جدول المستخدمين
    // if (status && status !== 'all') {
    //   query = query.where(eq(users.isActive, status === 'active'));
    // }
    
    // الحصول على العدد الإجمالي للمستخدمين مع المرشحات
    const totalCount = await query.execute();
    const totalPages = Math.ceil(totalCount.length / PAGE_SIZE);
    
    // ترتيب النتائج
    if (sortDirection === 'asc') {
      // @ts-ignore - سنتجاهل خطأ TypeScript هنا لأن الحقل قد يكون ديناميكيًا
      query = query.orderBy(asc(users[sortBy as keyof typeof users]));
    } else {
      // @ts-ignore - سنتجاهل خطأ TypeScript هنا لأن الحقل قد يكون ديناميكيًا
      query = query.orderBy(desc(users[sortBy as keyof typeof users]));
    }
    
    // الحصول على الصفحة المطلوبة
    query = query.limit(PAGE_SIZE).offset((currentPage - 1) * PAGE_SIZE);
    
    // تنفيذ الاستعلام
    const usersData = await query.execute();
    
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