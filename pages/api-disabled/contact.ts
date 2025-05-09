import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { contactMessages, insertContactMessageSchema } from '@/shared/schema';
import { z } from 'zod';

// تحديد الـ schema للتحقق من بيانات الطلب
const contactFormSchema = z.object({
  name: z.string().min(3, { message: 'الاسم يجب أن يحتوي على 3 أحرف على الأقل' }),
  email: z.string().email({ message: 'يرجى إدخال بريد إلكتروني صحيح' }),
  subject: z.string().min(5, { message: 'الموضوع يجب أن يحتوي على 5 أحرف على الأقل' }),
  message: z.string().min(10, { message: 'الرسالة يجب أن تحتوي على 10 أحرف على الأقل' })
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // نسمح فقط بطلبات POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    // التحقق من بيانات الطلب
    const validatedData = contactFormSchema.parse(req.body);

    // إدخال رسالة جديدة في قاعدة البيانات
    const [newMessage] = await db
      .insert(contactMessages)
      .values(validatedData)
      .returning();

    // إرسال استجابة ناجحة
    return res.status(201).json({
      success: true,
      message: 'تم إرسال رسالتك بنجاح. سنتواصل معك قريبًا.',
      data: {
        id: newMessage.id,
        createdAt: newMessage.createdAt
      }
    });
  } catch (error) {
    console.error('Error in contact form submission:', error);
    
    // التحقق من نوع الخطأ
    if (error instanceof z.ZodError) {
      // أخطاء التحقق من البيانات
      return res.status(400).json({
        success: false,
        error: 'بيانات غير صالحة',
        details: error.errors
      });
    }
    
    // أخطاء أخرى
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.'
    });
  }
}