import { db } from "@/db";
import { scholarships, InsertScholarship, Scholarship } from "@/shared/schema";
import { eq, and, desc } from "drizzle-orm";

export class ScholarshipsRepository {
  /**
   * الحصول على منحة دراسية بواسطة المعرف
   */
  async getScholarshipById(id: number): Promise<Scholarship | undefined> {
    try {
      console.log("Getting scholarship by id:", id);
      
      const result = await db.execute(
        `SELECT * FROM scholarships WHERE id = $1 LIMIT 1`,
        [id]
      );
      
      if (result.rows && result.rows.length > 0) {
        console.log("Found scholarship with title:", result.rows[0].title);
        return result.rows[0] as Scholarship;
      } else {
        console.log("No scholarship found with id:", id);
        return undefined;
      }
    } catch (error) {
      console.error("Error in getScholarshipById:", error);
      return undefined;
    }
  }

  /**
   * الحصول على منحة دراسية بواسطة الاسم المستعار
   */
  async getScholarshipBySlug(slug: string): Promise<Scholarship | undefined> {
    try {
      console.log("Getting scholarship by slug:", slug);
      
      const result = await db.execute(
        `SELECT * FROM scholarships WHERE slug = $1 LIMIT 1`,
        [slug]
      );
      
      if (result.rows && result.rows.length > 0) {
        console.log("Found scholarship with title:", result.rows[0].title);
        return result.rows[0] as Scholarship;
      } else {
        console.log("No scholarship found with slug:", slug);
        return undefined;
      }
    } catch (error) {
      console.error("Error in getScholarshipBySlug:", error);
      return undefined;
    }
  }

  /**
   * إنشاء منحة دراسية جديدة
   */
  async createScholarship(scholarshipData: InsertScholarship): Promise<Scholarship> {
    try {
      const [result] = await db.insert(scholarships)
        .values(scholarshipData)
        .returning();
      return result;
    } catch (error) {
      console.error("Error in createScholarship:", error);
      throw error;
    }
  }

  /**
   * تحديث منحة دراسية
   */
  async updateScholarship(id: number, scholarshipData: Partial<InsertScholarship>): Promise<Scholarship | undefined> {
    try {
      const [result] = await db.update(scholarships)
        .set(scholarshipData)
        .where(eq(scholarships.id, id))
        .returning();
      return result;
    } catch (error) {
      console.error("Error in updateScholarship:", error);
      throw error;
    }
  }

  /**
   * حذف منحة دراسية
   */
  async deleteScholarship(id: number): Promise<boolean> {
    try {
      const result = await db.delete(scholarships)
        .where(eq(scholarships.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error in deleteScholarship:", error);
      throw error;
    }
  }

  /**
   * الحصول على قائمة المنح الدراسية
   * يمكن تصفية النتائج حسب المعايير المقدمة
   */
  async listScholarships(filters?: {
    isFeatured?: boolean,
    countryId?: number,
    levelId?: number,
    categoryId?: number,
    isPublished?: boolean
  }): Promise<Scholarship[]> {
    try {
      const conditions = [];
      
      if (filters?.isFeatured !== undefined) {
        conditions.push(eq(scholarships.isFeatured, filters.isFeatured));
      }
      
      if (filters?.countryId !== undefined) {
        conditions.push(eq(scholarships.countryId, filters.countryId));
      }
      
      if (filters?.levelId !== undefined) {
        conditions.push(eq(scholarships.levelId, filters.levelId));
      }
      
      if (filters?.categoryId !== undefined) {
        conditions.push(eq(scholarships.categoryId, filters.categoryId));
      }

      if (filters?.isPublished !== undefined) {
        conditions.push(eq(scholarships.isPublished, filters.isPublished));
      }
      
      let query = db.select().from(scholarships);
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      // ترتيب النتائج حسب تاريخ الإنشاء، الأحدث أولاً
      query = query.orderBy(desc(scholarships.createdAt));
      
      const result = await query;
      return result;
    } catch (error) {
      console.error("Error in listScholarships:", error);
      throw error;
    }
  }

  /**
   * الحصول على المنح الدراسية المميزة
   */
  async getFeaturedScholarships(): Promise<Scholarship[]> {
    try {
      // استخدام أسماء الأعمدة الفعلية في قاعدة البيانات (is_featured)
      // نسجل الاستعلام كاملاً للمساعدة في تشخيص المشكلة
      console.log("Running getFeaturedScholarships query...");
      
      // تسهيل الاستعلام - فقط الحصول على المنح المميزة
      const result = await db.execute(
        `SELECT * FROM scholarships WHERE is_featured = true ORDER BY created_at DESC LIMIT 10`
      );
      
      console.log("Featured scholarships result count:", result.rows ? result.rows.length : 0);
      
      if (result.rows && result.rows.length > 0) {
        console.log("First scholarship title:", result.rows[0].title);
      } else {
        console.log("No featured scholarships found");
      }
      
      return result.rows || [];
    } catch (error) {
      console.error("Error in getFeaturedScholarships:", error);
      // نعيد مصفوفة فارغة بدلاً من رمي الخطأ
      return [];
    }
  }

  /**
   * زيادة عدد مشاهدات منحة دراسية
   */
  async incrementScholarshipViews(id: number): Promise<boolean> {
    try {
      // في بعض الحالات، جدول المنح الدراسية قد لا يحتوي على حقل views
      // يجب التحقق من وجود الحقل أولاً قبل محاولة التحديث
      
      // التحقق مما إذا كان الحقل موجودًا في الجدول
      try {
        // محاولة الحصول على المنحة أولاً
        const scholarship = await this.getScholarshipById(id);
        if (!scholarship) {
          return false;
        }
        
        // حساب عدد المشاهدات الحالي (إذا كان الحقل موجودًا)
        const currentViews = typeof scholarship.views === 'number' ? scholarship.views : 0;
        
        // تنفيذ استعلام التحديث
        await db.execute(
          `UPDATE scholarships SET views = $1 WHERE id = $2`,
          [currentViews + 1, id]
        );
        
        return true;
      } catch (viewsError) {
        // إذا كان الخطأ بسبب عدم وجود حقل views، قم بتسجيل الخطأ فقط ولا تقم برميه
        console.warn("لا يمكن تحديث عدد المشاهدات، قد يكون الحقل غير موجود:", viewsError);
        return false;
      }
    } catch (error) {
      console.error("Error in incrementScholarshipViews:", error);
      return false; // نعيد false بدلاً من رمي الخطأ لمنع توقف التطبيق
    }
  }
}