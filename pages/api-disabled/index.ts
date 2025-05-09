// تم تعطيل API Routes في Next.js وتوجيهها إلى خادم Express
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // إعادة توجيه الطلب إلى خادم Express
  res.status(307).redirect('/api'); // توجيه إلى نفس المسار ولكن على خادم Express
}