import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { PgTable } from 'drizzle-orm/pg-core';

/**
 * Repository أساسي يوفر عمليات CRUD العامة
 */
export class BaseRepository<T, InsertT> {
  protected table: PgTable;
  protected idColumn: any;

  constructor(table: PgTable, idColumn: any) {
    this.table = table;
    this.idColumn = idColumn;
  }

  /**
   * الحصول على كافة السجلات
   */
  async findAll(filters: Record<string, any> = {}): Promise<T[]> {
    const baseQuery = db.select().from(this.table);
    const conditions = Object.entries(filters)
      .filter(([key, value]) => value !== undefined && (this.table as any)[key])
      .map(([key, value]) => eq((this.table as any)[key], value));

    const query = conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery;

    return query as Promise<T[]>;
  }

  /**
   * الحصول على سجل واحد بواسطة المعرف
   */
  async findById(id: number): Promise<T | undefined> {
    const result = await db.select()
      .from(this.table)
      .where(eq(this.idColumn, id))
      .limit(1);
    
    return result[0] as T | undefined;
  }

  /**
   * إنشاء سجل جديد
   */
  async create(data: InsertT): Promise<T> {
    const result = await db.insert(this.table)
      .values(data as any)
      .returning();
    
    return result[0] as T;
  }

  /**
   * تحديث سجل موجود
   */
  async update(id: number, data: Partial<InsertT>): Promise<T | undefined> {
    const result = await db.update(this.table)
      .set(data as any)
      .where(eq(this.idColumn, id))
      .returning();
    
    return result[0] as T | undefined;
  }

  /**
   * حذف سجل
   */
  async delete(id: number): Promise<boolean> {
    const result = await db.delete(this.table)
      .where(eq(this.idColumn, id))
      .returning();
    
    return result.length > 0;
  }
}