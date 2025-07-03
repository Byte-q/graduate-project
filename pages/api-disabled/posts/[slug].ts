import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { posts, categories, users } from '@/shared/schema';
import { eq, sql } from 'drizzle-orm';

interface ApiResponseSuccess {
  success: true;
  post: FormattedPost;
}

interface ApiResponseError {
  success: false;
  message: string;
}

interface CategoryData {
  id: number;
  name: string;
  slug: string;
}

interface AuthorData {
  id: number;
  fullName: string;
  username: string;
}

interface FormattedPost {
  [key: string]: any;
  category: CategoryData | null;
  author: AuthorData | null;
  authorName: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseSuccess | ApiResponseError>
) {
  // استخراج slug من المعلمات
  const { slug } = req.query;
  
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'يجب توفير معرف المقال (slug)'
    });
  }
  
  // إضافة رؤوس التخزين المؤقت في حالة GET فقط
  if (req.method === 'GET') {
    res.setHeader(
      'Cache-Control',
      'public, max-age=3600, s-maxage=7200, stale-while-revalidate=59'
    );
  }
  
  try {
    console.log(`API Request: GET /posts/${slug}`);
    
    // البحث عن المقال بواسطة slug
    const postResult = await db
      .select({
        id: posts.id,
        slug: posts.slug,
        createdAt: posts.createdAt,
        status: posts.status,
        title: posts.title,
        content: posts.content,
        isFeatured: posts.isFeatured,
        focusKeyword: posts.focusKeyword,
        imageUrl: posts.imageUrl,
        updatedAt: posts.updatedAt,
        views: posts.views,
        metaDescription: posts.metaDescription,
        metaKeywords: posts.metaKeywords,
        authorId: posts.authorId
      })
      .from(posts)
      .where(eq(posts.slug, slug))
      .limit(1);
    
    if (!postResult || postResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'المقال غير موجود'
      });
    }
    
    const post = postResult[0];
    
    // زيادة عدد المشاهدات
    if (req.method === 'GET') {
      try {
        await db
          .update(posts)
          .set({ views: sql`${posts.views} + 1` })
          .where(eq(posts.id, post.id));
      } catch (updateError) {
        console.error('خطأ في تحديث عدد المشاهدات:', updateError);
        // نستمر في تنفيذ الطلب حتى لو فشل تحديث عدد المشاهدات
      }
    }
    
    // جلب بيانات الكاتب إذا كان موجودًا
    let author: AuthorData | null = null;
    if (post.authorId) {
      const authorResult = await db
        .select({
          id: users.id,
          fullName: users.fullName,
          username: users.username
        })
        .from(users)
        .where(eq(users.id, post.authorId))
        .limit(1);
      
      if (authorResult && authorResult.length > 0) {
        author = authorResult[0];
      }
    }
    
    // تنسيق البيانات للاستجابة
    const formattedPost: FormattedPost = {
      ...post,
      category: null,
      author: author,
      authorName: author?.fullName || 'كاتب المقال'
    };
    
    return res.status(200).json({
      success: true,
      post: formattedPost
    });
  } catch (error) {
    console.error('خطأ في جلب المقال:', error);
    
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات المقال'
    });
  }
}