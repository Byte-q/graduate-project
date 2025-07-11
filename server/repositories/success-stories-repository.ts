import { db } from "@/db";
import { successStories, InsertSuccessStory, SuccessStory } from "@/shared/schema";
import { eq, desc } from "drizzle-orm";

export class SuccessStoriesRepository {
  /**
   * الحصول على قصة نجاح بواسطة المعرف
   */
  async getSuccessStoryById(id: number): Promise<SuccessStory | undefined> {
    try {
      const sql = `SELECT * FROM success_stories WHERE id = $1 LIMIT 1`;
      const result = await db.execute(sql, [id]);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      // تحويل أسماء الأعمدة لتتوافق مع التوقع في الكود
      const story = this.mapSuccessStoryFromDB(result.rows[0]);
      return story as SuccessStory;
    } catch (error) {
      console.error("Error in getSuccessStoryById:", error);
      throw error;
    }
  }

  /**
   * الحصول على قصة نجاح بواسطة الاسم المستعار
   */
  async getSuccessStoryBySlug(slug: string): Promise<SuccessStory | undefined> {
    try {
      const sql = `SELECT * FROM success_stories WHERE slug = $1 LIMIT 1`;
      const result = await db.execute(sql, [slug]);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      // تحويل أسماء الأعمدة لتتوافق مع التوقع في الكود
      const story = this.mapSuccessStoryFromDB(result.rows[0]);
      return story as SuccessStory;
    } catch (error) {
      console.error("Error in getSuccessStoryBySlug:", error);
      throw error;
    }
  }
  
  /**
   * تحويل أسماء الأعمدة من قاعدة البيانات إلى أسماء الخاصيات المتوقعة في الكود
   */
  private mapSuccessStoryFromDB(dbStory: Record<string, any>): Partial<SuccessStory> {
    return {
      id: dbStory.id,
      title: dbStory.title,
      slug: dbStory.slug,
      content: dbStory.content,
      name: dbStory.name,
      scholarshipName: dbStory.scholarship_name || dbStory.scholarshipName,
      isPublished: dbStory.is_published !== undefined ? dbStory.is_published : dbStory.isPublished,
      imageUrl: dbStory.image_url || dbStory.imageUrl,
      createdAt: dbStory.created_at ? new Date(dbStory.created_at) : dbStory.createdAt
    };
  }

  /**
   * إنشاء قصة نجاح جديدة
   */
  async createSuccessStory(storyData: InsertSuccessStory): Promise<SuccessStory> {
    try {
      const [result] = await db.insert(successStories)
        .values(storyData)
        .returning();
      return result;
    } catch (error) {
      console.error("Error in createSuccessStory:", error);
      throw error;
    }
  }

  /**
   * تحديث قصة نجاح
   */
  async updateSuccessStory(id: number, storyData: Partial<InsertSuccessStory>): Promise<SuccessStory | undefined> {
    try {
      const [result] = await db.update(successStories)
        .set(storyData)
        .where(eq(successStories.id, id))
        .returning();
      return result;
    } catch (error) {
      console.error("Error in updateSuccessStory:", error);
      throw error;
    }
  }

  /**
   * حذف قصة نجاح
   */
  async deleteSuccessStory(id: number): Promise<boolean> {
    try {
      const result = await db.delete(successStories)
        .where(eq(successStories.id, id));
      
      return result.rowCount! > 0;
    } catch (error) {
      console.error("Error in deleteSuccessStory:", error);
      throw error;
    }
  }

  /**
   * الحصول على قائمة قصص النجاح
   */
  async listSuccessStories(filters?: {
    isFeatured?: boolean,
    limit?: number
  }): Promise<SuccessStory[]> {
    try {
      // استخدام استعلام SQL مباشر بدلاً من ORM لتجنب مشاكل أسماء الأعمدة
      let sqlQuery = `
        SELECT * FROM success_stories
        WHERE 1=1
      `;
      
      const params: any[] = [];
      let paramIndex = 1;
      
      if (filters?.isFeatured !== undefined) {
        sqlQuery += ` AND is_published = $${paramIndex++}`;
        params.push(true);
      }
      
      // ترتيب النتائج حسب تاريخ الإنشاء، الأحدث أولاً
      sqlQuery += ` ORDER BY created_at DESC`;
      
      // إضافة حد للنتائج إذا تم تحديده
      if (filters?.limit !== undefined && filters.limit > 0) {
        sqlQuery += ` LIMIT $${paramIndex++}`;
        params.push(filters.limit);
      }
      
      console.log("Success Stories SQL Query:", sqlQuery, "Params:", params);
      
      // تنفيذ الاستعلام
      const result = await db.execute(sqlQuery, params);
      console.log("Success stories result:", result.rows.length);
      
      // تحويل أسماء الأعمدة لتتوافق مع التوقع في الكود
      const mappedStories = result.rows.map(story => this.mapSuccessStoryFromDB(story));
      
      return mappedStories as SuccessStory[];
    } catch (error) {
      console.error("Error in listSuccessStories:", error);
      throw error;
    }
  }
}