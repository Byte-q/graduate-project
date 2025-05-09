import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { countries, scholarships } from '@/shared/schema';
import { eq, sql, count } from 'drizzle-orm';

/**
 * واجهة برمجة التطبيقات لتفاصيل الدولة
 * تتيح جلب تفاصيل دولة محددة والمنح المرتبطة بها
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`API Request: GET /countries/${req.query.slug}`);
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'طريقة الطلب غير مدعومة' });
  }

  try {
    const { slug } = req.query;
    
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'معرّف الدولة غير صالح' });
    }

    // جلب تفاصيل الدولة
    const countryData = await db
      .select()
      .from(countries)
      .where(sql`${countries.slug} = ${slug}`)
      .limit(1);

    if (!countryData || countryData.length === 0) {
      return res.status(404).json({ error: 'الدولة غير موجودة' });
    }

    const country = countryData[0];

    // استخراج معلمات الترقيم للمنح
    const { page = '1', limit = '10' } = req.query;
    const pageNumber = parseInt(page.toString(), 10);
    const limitNumber = parseInt(limit.toString(), 10);
    const offset = (pageNumber - 1) * limitNumber;

    // جلب المنح المرتبطة بالدولة
    const [{ value: totalItems }] = await db
      .select({ value: count() })
      .from(scholarships)
      .where(sql`${scholarships.countryId} = ${country.id}`);

    const countryScholarships = await db
      .select()
      .from(scholarships)
      .where(sql`${scholarships.countryId} = ${country.id}`)
      .limit(limitNumber)
      .offset(offset)
      .orderBy(sql`${scholarships.createdAt} DESC`);

    const totalPages = Math.ceil(totalItems / limitNumber);

    console.log(`API: تم العثور على ${countryScholarships.length} منحة من أصل ${totalItems} للدولة ${country.name}`);

    return res.status(200).json({
      country,
      scholarships: countryScholarships,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalItems,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching country details:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء جلب تفاصيل الدولة' });
  }
}