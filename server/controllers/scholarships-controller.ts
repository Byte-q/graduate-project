import { Request, Response } from 'express';
import { ScholarshipsService } from '../services/scholarships-service';
import { insertScholarshipSchema } from '../../shared/schema';
import { handleException, successResponse } from '../utils/api-helper';
import { z } from 'zod';

export class ScholarshipsController {
  private service: ScholarshipsService;

  constructor() {
    this.service = new ScholarshipsService();
  }

  /**
   * الحصول على قائمة المنح الدراسية
   */
  async listScholarships(req: Request, res: Response): Promise<void> {
    try {
      const { isFeatured, countryId, levelId, categoryId, isPublished } = req.query;
      
      // تحويل المعلمات إلى الأنواع المناسبة
      const filters: any = {};
      
      if (isFeatured !== undefined) {
        filters.isFeatured = isFeatured === 'true';
      }
      
      if (countryId !== undefined && !isNaN(Number(countryId))) {
        filters.countryId = Number(countryId);
      }
      
      if (levelId !== undefined && !isNaN(Number(levelId))) {
        filters.levelId = Number(levelId);
      }
      
      if (categoryId !== undefined && !isNaN(Number(categoryId))) {
        filters.categoryId = Number(categoryId);
      }

      if (isPublished !== undefined) {
        filters.isPublished = isPublished === 'true';
      }
      
      const scholarships = await this.service.listScholarships(filters);
      res.json(successResponse(scholarships));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * الحصول على المنح الدراسية المميزة
   */
  async getFeaturedScholarships(req: Request, res: Response): Promise<void> {
    try {
      console.log("Getting featured scholarships...");
      
      // Implementar caché simple
      const cacheKey = 'featured_scholarships';
      const cacheTime = 5 * 60 * 1000; // 5 minutos
      
      // Comprobar si hay datos en caché
      const cache = global.memoryCache = global.memoryCache || new Map();
      const cachedData = cache.get(cacheKey);
      
      if (cachedData && (Date.now() - cachedData.timestamp < cacheTime)) {
        console.log("Using cached featured scholarships:", cachedData.data.length);
        res.json(successResponse(cachedData.data));
      }
      
      // Si no hay caché, obtener datos frescos
      const scholarships = await this.service.getFeaturedScholarships();
      console.log("Fresh featured scholarships:", scholarships ? scholarships.length : 0);
      
      // Guardar en caché
      cache.set(cacheKey, {
        data: scholarships || [],
        timestamp: Date.now()
      });
      
      // استخدام تنسيق استجابة موحد
      res.json(successResponse(scholarships || []));
    } catch (error) {
      console.error("Error in getFeaturedScholarships:", error);
      // Always return a valid response even in case of error
      res.status(500).json(successResponse([], "Error loading featured scholarships"));
    }
  }

  /**
   * الحصول على منحة دراسية بواسطة المعرف
   */
  async getScholarshipById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'معرف المنحة الدراسية يجب أن يكون رقماً'
        });
        return;
      }

      const scholarship = await this.service.getScholarshipById(id);
      if (!scholarship) {
        res.status(404).json({
          success: false,
          message: 'المنحة الدراسية غير موجودة'
        });
        return;
      }

      res.json(successResponse(scholarship));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * الحصول على منحة دراسية بواسطة الاسم المستعار
   */
  async getScholarshipBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      if (!slug) {
        res.status(400).json({
          success: false,
          message: 'الاسم المستعار للمنحة الدراسية مطلوب'
        });
        return;
      }

      const scholarship = await this.service.getScholarshipBySlug(slug);
      if (!scholarship) {
        res.status(404).json({
          success: false,
          message: 'المنحة الدراسية غير موجودة'
        });
        return;
      }

      // زيادة عدد المشاهدات تلقائياً
      this.service.incrementScholarshipViews(scholarship.id);

      res.json(scholarship);
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * إنشاء منحة دراسية جديدة
   */
  async createScholarship(req: Request, res: Response): Promise<void> {
    try {
      // تخطي التحقق من صحة البيانات باستخدام Zod
      // بدلاً من ذلك، نقوم بمعالجة البيانات مباشرة
      const scholarshipData = {...req.body};
      
      // تحويل حقول ID من نصوص إلى أرقام إذا لزم الأمر
      if (typeof scholarshipData.countryId === 'string') {
        scholarshipData.countryId = parseInt(scholarshipData.countryId, 10);
      }
      
      if (typeof scholarshipData.levelId === 'string') {
        scholarshipData.levelId = parseInt(scholarshipData.levelId, 10);
      }
      
      if (typeof scholarshipData.categoryId === 'string') {
        scholarshipData.categoryId = parseInt(scholarshipData.categoryId, 10);
      }
      
      // الحفاظ على التواريخ كما هي 
      // سيتم التعامل معها على مستوى قاعدة البيانات
      
      // معالجة الصورة
      if (scholarshipData.featuredImage) {
        scholarshipData.imageUrl = scholarshipData.featuredImage;
        delete scholarshipData.featuredImage;
      }
      
      // استدعاء الخدمة لإنشاء المنحة الدراسية
      const newScholarship = await this.service.createScholarship(scholarshipData);
      
      res.status(201).json(successResponse(
        newScholarship,
        'تم إنشاء المنحة الدراسية بنجاح'
      ));
    } catch (error) {
      console.error('Error in createScholarship:', error);
      handleException(res, error);
    }
  }

  /**
   * تحديث منحة دراسية موجودة
   */
  async updateScholarship(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'معرف المنحة الدراسية يجب أن يكون رقماً'
        });
        return;
      }

      // تحقق من وجود المنحة الدراسية
      const existingScholarship = await this.service.getScholarshipById(id);
      if (!existingScholarship) {
        res.status(404).json({
          success: false,
          message: 'المنحة الدراسية غير موجودة'
        });
        return;
      }

      // تخطي التحقق من صحة البيانات باستخدام Zod
      // بدلاً من ذلك، نقوم بمعالجة البيانات مباشرة
      const scholarshipData = {...req.body};
      
      // تحويل حقول ID من نصوص إلى أرقام إذا لزم الأمر
      if (typeof scholarshipData.countryId === 'string') {
        scholarshipData.countryId = parseInt(scholarshipData.countryId, 10);
      }
      
      if (typeof scholarshipData.levelId === 'string') {
        scholarshipData.levelId = parseInt(scholarshipData.levelId, 10);
      }
      
      if (typeof scholarshipData.categoryId === 'string') {
        scholarshipData.categoryId = parseInt(scholarshipData.categoryId, 10);
      }
      
      // الحفاظ على التواريخ كما هي 
      // سيتم التعامل معها على مستوى قاعدة البيانات
      
      // معالجة الصورة
      if (scholarshipData.featuredImage) {
        scholarshipData.imageUrl = scholarshipData.featuredImage;
        delete scholarshipData.featuredImage;
      }
      
      // استدعاء الخدمة لتحديث المنحة الدراسية
      const updatedScholarship = await this.service.updateScholarship(id, scholarshipData);
      
      res.json(successResponse(
        updatedScholarship,
        'تم تحديث المنحة الدراسية بنجاح'
      ));
    } catch (error) {
      console.error('Error in updateScholarship:', error);
      handleException(res, error);
    }
  }

  /**
   * حذف منحة دراسية
   */
  async deleteScholarship(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'معرف المنحة الدراسية يجب أن يكون رقماً'
        });
        return;
      }

      // تحقق من وجود المنحة الدراسية
      const existingScholarship = await this.service.getScholarshipById(id);
      if (!existingScholarship) {
        res.status(404).json({
          success: false,
          message: 'المنحة الدراسية غير موجودة'
        });
        return;
      }

      // حذف المنحة الدراسية
      const result = await this.service.deleteScholarship(id);
      
      if (result) {
        res.json({
          success: true,
          message: 'تم حذف المنحة الدراسية بنجاح'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'فشل في حذف المنحة الدراسية'
        });
      }
    } catch (error) {
      handleException(res, error);
    }
  }
}