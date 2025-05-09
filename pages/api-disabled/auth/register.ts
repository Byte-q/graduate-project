import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { users, insertUserSchema } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, isValidEmail, isValidUsername, isValidPassword } from '@/lib/auth';
import { z } from 'zod';

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
    const { username, email, password, fullName } = req.body;

    // التحقق من إرسال جميع البيانات المطلوبة
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }

    // التحقق من صحة البيانات
    if (!isValidUsername(username)) {
      return res.status(400).json({ message: 'اسم المستخدم غير صالح. يجب أن يتكون من أحرف وأرقام فقط، ولا يقل عن 3 أحرف ولا يزيد عن 30 حرفًا.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'البريد الإلكتروني غير صالح' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ message: 'كلمة المرور غير صالحة. يجب أن تتكون من 8 أحرف على الأقل.' });
    }

    // التحقق من عدم وجود مستخدم بنفس اسم المستخدم أو البريد الإلكتروني
    const existingUserByUsername = await db.select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUserByUsername.length > 0) {
      return res.status(400).json({ message: 'اسم المستخدم مستخدم بالفعل' });
    }

    const existingUserByEmail = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUserByEmail.length > 0) {
      return res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل' });
    }

    // تشفير كلمة المرور
    const hashedPassword = await hashPassword(password);

    // إعداد بيانات المستخدم للإدخال
    const userData = {
      username,
      email,
      password: hashedPassword,
      fullName,
      role: 'user'
    };

    // التحقق من صحة البيانات باستخدام مخطط Zod
    try {
      insertUserSchema.parse(userData);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return res.status(400).json({ message: 'خطأ في التحقق من البيانات: ' + validationError.errors[0].message });
      }
    }

    // إدخال المستخدم الجديد في قاعدة البيانات
    const [newUser] = await db.insert(users)
      .values(userData)
      .returning();

    if (!newUser) {
      return res.status(500).json({ message: 'فشل إنشاء المستخدم' });
    }

    // إرجاع بيانات المستخدم بدون كلمة المرور
    const { password: _, ...userWithoutPassword } = newUser;

    // إعداد جلسة المستخدم
    res.setHeader('Set-Cookie', `user=${JSON.stringify(userWithoutPassword)}; Path=/; HttpOnly; Max-Age=86400; SameSite=Strict`);

    return res.status(201).json({ 
      message: 'تم إنشاء الحساب بنجاح',
      user: userWithoutPassword
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'حدث خطأ في إنشاء الحساب. يرجى المحاولة مرة أخرى.' });
  }
}