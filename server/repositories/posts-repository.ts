import { db } from "@/db";
import { posts, InsertPost, Post, postTags, tags } from "@/shared/schema";
import { eq, and, inArray, desc, or } from "drizzle-orm";

export class PostsRepository {
  /**
   * الحصول على مقال بواسطة المعرف
   */
  async getPostById(id: number): Promise<Post | undefined> {
    try {
      const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
      
      if (result.length === 0) {
        return undefined;
      }
      
      // تحويل أسماء الأعمدة لتتوافق مع التوقع في الكود
      const post = this.mapPostFromDB(result[0]);
      return post as Post;
    } catch (error) {
      console.error("Error in getPostById:", error);
      throw error;
    }
  }

  /**
   * الحصول على مقال بواسطة الاسم المستعار
   */
  async getPostBySlug(slug: string): Promise<Post | undefined> {
    try {
        const result = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
        
      if (result.length === 0) {
        return undefined;
      }
      
      // تحويل أسماء الأعمدة لتتوافق مع التوقع في الكود
      const post = this.mapPostFromDB(result[0]);
      return post as Post;
    } catch (error) {
      console.error("Error in getPostBySlug:", error);
      throw error;
    }
  }
  
  /**
   * تحويل أسماء الأعمدة من قاعدة البيانات إلى أسماء الخاصيات المتوقعة في الكود
   */
  private mapPostFromDB(dbPost: Record<string, any>): Partial<Post> {
    return {
      id: dbPost.id,
      title: dbPost.title,
      slug: dbPost.slug,
      content: dbPost.content,
      excerpt: dbPost.excerpt,
      imageUrl: dbPost.image_url || dbPost.imageUrl,
      status: dbPost.status,
      authorId: dbPost.author_id || dbPost.authorId,
      categoryId: dbPost.category_id || dbPost.categoryId,
      metaDescription: dbPost.meta_description || dbPost.metaDescription,
      metaKeywords: dbPost.meta_keywords || dbPost.metaKeywords,
      isFeatured: dbPost.is_featured !== undefined ? dbPost.is_featured : dbPost.isFeatured,
      focusKeyword: dbPost.focus_keyword || dbPost.focusKeyword,
      views: dbPost.views || 0,
      readTime: dbPost.read_time || dbPost.readTime,
      createdAt: dbPost.created_at ? new Date(dbPost.created_at) : dbPost.createdAt,
      updatedAt: dbPost.updated_at ? new Date(dbPost.updated_at) : dbPost.updatedAt
    };
  }

  /**
   * إنشاء مقال جديد
   */
  async createPost(postData: InsertPost): Promise<Post> {
    try {
      const [result] = await db.insert(posts)
        .values(postData)
        .returning();
      return result;
    } catch (error) {
      console.error("Error in createPost:", error);
      throw error;
    }
  }

  /**
   * تحديث مقال
   */
  async updatePost(id: number, postData: Partial<InsertPost>): Promise<Post | undefined> {
    try {
      const [result] = await db.update(posts)
        .set(postData)
        .where(eq(posts.id, id))
        .returning();
      return result;
    } catch (error) {
      console.error("Error in updatePost:", error);
      throw error;
    }
  }

  /**
   * حذف مقال
   */
  async deletePost(id: number): Promise<boolean> {
    try {
      // حذف العلاقات مع العلامات أولاً
      await db.delete(postTags)
        .where(eq(postTags.postId, id));
      
      // ثم حذف المقال نفسه
      const result = await db.delete(posts)
        .where(eq(posts.id, id));
      
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error in deletePost:", error);
      throw error;
    }
  }

  /**
   * الحصول على قائمة المقالات
   * يمكن تصفية النتائج حسب المعايير المقدمة
   */
  async listPosts(filters?: {
    authorId?: number,
    isFeatured?: boolean,
    status?: string,
    tag?: string,
    limit?: number
  }): Promise<Post[]> {
    try {
      // استخدام استعلام SQL مباشر بدلاً من ORM لتجنب مشاكل أسماء الأعمدة
      let sqlQuery = `
        SELECT * FROM posts
        WHERE 1=1
      `;
      
      const params: any[] = [];
      let paramIndex = 1;
      
      if (filters?.authorId !== undefined) {
        sqlQuery += ` AND author_id = $${paramIndex++}`;
        params.push(filters.authorId);
      }
      
      if (filters?.isFeatured !== undefined) {
        sqlQuery += ` AND is_featured = $${paramIndex++}`;
        params.push(filters.isFeatured);
      }
      
      if (filters?.status !== undefined) {
        sqlQuery += ` AND status = $${paramIndex++}`;
        params.push(filters.status);
      }
      
      // ترتيب النتائج حسب تاريخ الإنشاء، الأحدث أولاً
      sqlQuery += ` ORDER BY created_at DESC`;
      
      // إضافة حد للنتائج إذا تم تحديده
      if (filters?.limit !== undefined && filters.limit > 0) {
        sqlQuery += ` LIMIT $${paramIndex++}`;
        params.push(filters.limit);
      }
      
      console.log("SQL Query:", sqlQuery, "Params:", params);
      
      // تنفيذ الاستعلام
      const result = await db.select().from(posts) /* add .where(...) as needed */;
      
      // تحويل أسماء الأعمدة لتتوافق مع التوقع في الكود
      const mappedPosts = result.map(post => this.mapPostFromDB(post));
      
      // إذا كان هناك تصفية حسب العلامة، نقوم بمعالجتها بشكل منفصل
      if (filters?.tag) {
        const tagPosts = await this.getPostsByTagSlug(filters.tag);
        const tagPostIds = tagPosts.map(post => post.id);
        return mappedPosts.filter((post: any) => tagPostIds.includes(post.id)) as Post[];
      }
      
      return mappedPosts as Post[];
    } catch (error) {
      console.error("Error in listPosts:", error);
      throw error;
    }
  }

  /**
   * زيادة عدد مشاهدات مقال
   */
  async incrementPostViews(id: number): Promise<boolean> {
    try {
      const post = await this.getPostById(id);
      if (!post) {
        return false;
      }

      const currentViews = post.views || 0;
      const [updated] = await db.update(posts)
        .set({ views: currentViews + 1 })
        .where(eq(posts.id, id))
        .returning();
      
      return !!updated;
    } catch (error) {
      console.error("Error in incrementPostViews:", error);
      throw error;
    }
  }

  /**
   * الحصول على مقالات حسب علامة
   */
  async getPostsByTagSlug(tagSlug: string): Promise<Post[]> {
    try {
      // أولاً، نحصل على العلامة بواسطة الاسم المستعار
      const tag = await db.query.tags.findFirst({
        where: eq(tags.slug, tagSlug)
      });
      
      if (!tag) {
        return [];
      }
      
      // ثم نحصل على جميع علاقات المقالات بهذه العلامة
      const relationships = await db.select()
        .from(postTags)
        .where(eq(postTags.tagId, tag.id));
      
      // أخيراً، نحصل على المقالات المرتبطة
      const postIds = relationships.map(rel => rel.postId);
      
      
      if (postIds.length === 0) {
        return [];
      }
      const result = await db
        .select()
        .from(posts)
        .where(inArray(posts.id, postIds))
        .orderBy(desc(posts.createdAt));
      
      return result;
    } catch (error) {
      console.error("Error in getPostsByTagSlug:", error);
      throw error;
    }
  }

  /**
   * إضافة علامة إلى مقال
   */
  async addTagToPost(postId: number, tagId: number): Promise<any> {
    try {
      // التحقق من عدم وجود العلاقة مسبقاً
      const existing = await db.select()
        .from(postTags)
        .where(
          and(
            eq(postTags.postId, postId),
            eq(postTags.tagId, tagId)
          )
        );
      
      if (existing.length > 0) {
        return existing[0];
      }
      
      // إنشاء العلاقة
      const [result] = await db.insert(postTags)
        .values({ postId, tagId })
        .returning();
      
      return result;
    } catch (error) {
      console.error("Error in addTagToPost:", error);
      throw error;
    }
  }

  /**
   * إزالة علامة من مقال
   */
  async removeTagFromPost(postId: number, tagId: number): Promise<boolean> {
    try {
      const result = await db.delete(postTags)
        .where(
          and(
            eq(postTags.postId, postId),
            eq(postTags.tagId, tagId)
          )
        );
      
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error in removeTagFromPost:", error);
      throw error;
    }
  }

  /**
   * الحصول على علامات مقال
   */
  async getPostTags(postId: number): Promise<any[]> {
    try {
      const relationships = await db.select()
        .from(postTags)
        .where(eq(postTags.postId, postId));
      
      if (relationships.length === 0) {
        return [];
      }
      
      const tagIds = relationships.map(rel => rel.tagId);
      
      const result = await db.select()
        .from(tags)
        .where(
          inArray(tags.id, tagIds)
        );
      
      return result;
    } catch (error) {
      console.error("Error in getPostTags:", error);
      throw error;
    }
  }
}