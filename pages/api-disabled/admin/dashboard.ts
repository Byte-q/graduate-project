import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { 
  users, 
  scholarships, 
  posts, 
  successStories,
  contactMessages
} from '@/shared/schema';
import { desc } from 'drizzle-orm';

type ResponseData = {
  totalScholarships: number;
  totalUsers: number;
  totalPosts: number;
  totalSuccessStories: number;
  recentScholarships: any[];
  recentMessages: any[];
  popularScholarships: any[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    // جلب العدد الإجمالي للمستخدمين والمنح والمقالات وقصص النجاح
    const [
      usersCount,
      scholarshipsCount,
      postsCount,
      successStoriesCount
    ] = await Promise.all([
      db.select().from(users).execute(),
      db.select().from(scholarships).execute(),
      db.select().from(posts).execute(),
      db.select().from(successStories).execute()
    ]);

    // جلب آخر المنح المضافة (5 منح)
    const recentScholarshipsQuery = await db.select({
      id: scholarships.id,
      title: scholarships.title,
      slug: scholarships.slug,
      createdAt: scholarships.createdAt
    })
    .from(scholarships)
    .orderBy(desc(scholarships.createdAt))
    .limit(5)
    .execute();

    // معالجة قيم التاريخ
    const recentScholarships = recentScholarshipsQuery.map(scholarship => ({
      ...scholarship,
      createdAt: scholarship.createdAt instanceof Date 
        ? scholarship.createdAt.toISOString() 
        : scholarship.createdAt
    }));

    // جلب آخر الرسائل المستلمة (5 رسائل)
    // في البيئة الحقيقية، ستقوم بجلب البيانات من جدول الرسائل
    // هنا نقوم بتمثيل البيانات للتوافق مع الواجهة
    const recentMessagesQuery = await db.select({
      id: contactMessages.id,
      name: contactMessages.name,
      email: contactMessages.email,
      subject: contactMessages.subject,
      createdAt: contactMessages.createdAt,
      status: contactMessages.status
    })
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
    .limit(5)
    .execute();

    // معالجة بيانات الرسائل
    const recentMessages = recentMessagesQuery.map(message => ({
      id: message.id,
      name: message.name,
      email: message.email,
      subject: message.subject,
      createdAt: message.createdAt instanceof Date 
        ? message.createdAt.toISOString() 
        : message.createdAt,
      isRead: message.status !== 'unread'
    }));

    // جلب المنح الأكثر مشاهدة (5 منح)
    // في البيئة الحقيقية، ستقوم بجلب البيانات مع عدد المشاهدات
    // هنا نفترض وجود حقل viewCount لتتبع المشاهدات
    const popularScholarshipsQuery = await db.select({
      id: scholarships.id,
      title: scholarships.title,
      slug: scholarships.slug,
      viewCount: scholarships.viewCount
    })
    .from(scholarships)
    .orderBy(desc(scholarships.viewCount))
    .limit(5)
    .execute();

    // معالجة بيانات المنح الأكثر مشاهدة
    const popularScholarships = popularScholarshipsQuery.map(scholarship => ({
      ...scholarship,
      // في حالة عدم وجود حقل viewCount نستخدم قيمة افتراضية
      viewCount: scholarship.viewCount || 0
    }));

    // إعادة البيانات
    res.status(200).json({
      totalUsers: usersCount.length,
      totalScholarships: scholarshipsCount.length,
      totalPosts: postsCount.length,
      totalSuccessStories: successStoriesCount.length,
      recentScholarships,
      recentMessages,
      popularScholarships
    });
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      error: 'حدث خطأ أثناء جلب بيانات لوحة القيادة',
      totalUsers: 0,
      totalScholarships: 0,
      totalPosts: 0,
      totalSuccessStories: 0,
      recentScholarships: [],
      recentMessages: [],
      popularScholarships: []
    });
  }
}