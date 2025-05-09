import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed. Use POST instead.' });
  }

  try {
    // حذف الكوكي الخاص بالمستخدم
    res.setHeader('Set-Cookie', 'user=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict');

    return res.status(200).json({ message: 'تم تسجيل الخروج بنجاح' });
  } catch (error: any) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'حدث خطأ في تسجيل الخروج. يرجى المحاولة مرة أخرى.' });
  }
}