import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { users } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { comparePasswords } from '@/lib/auth';

type ResponseData = {
  message?: string;
  user?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed. Use POST instead.' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'اسم المستخدم وكلمة المرور مطلوبان' });
    }

    // البحث عن المستخدم في قاعدة البيانات
    const user = await db.select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user || user.length === 0) {
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    const userRecord = user[0];

    // التحقق من صحة كلمة المرور
    const passwordMatch = await comparePasswords(password, userRecord.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    // إنشاء الجلسة
    // في التطبيق الحقيقي، يجب استخدام آلية جلسة مثل NextAuth.js أو JWT
    // لكن نحن نعيد بيانات المستخدم (باستثناء كلمة المرور) للواجهة الأمامية
    const { password: _, ...userWithoutPassword } = userRecord;

    // إضافة الجلسة إلى الكوكيز
    res.setHeader('Set-Cookie', `user=${JSON.stringify(userWithoutPassword)}; Path=/; HttpOnly; Max-Age=86400; SameSite=Strict`);

    return res.status(200).json({ user: userWithoutPassword });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'حدث خطأ في تسجيل الدخول. يرجى المحاولة مرة أخرى.' });
  }
}