import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  user?: any;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    // في بيئة حقيقية، ستقوم بالتحقق من الجلسة (session) للمستخدم
    // وجلب بياناته من قاعدة البيانات
    
    // للتمثيل، نتحقق من وجود cookie للمستخدم
    const userCookie = req.cookies.user;
    
    if (!userCookie) {
      return res.status(401).json({ message: 'غير مصرح به' });
    }
    
    // تحويل بيانات المستخدم من JSON string إلى كائن
    try {
      const user = JSON.parse(userCookie);
      return res.status(200).json({ user });
    } catch (err) {
      // في حالة فشل تحليل الـ cookie
      return res.status(401).json({ message: 'خطأ في بيانات المستخدم' });
    }
  } catch (error: any) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ message: 'حدث خطأ في النظام' });
  }
}