import express, { type Express } from "express";
import { createServer, type Server } from "http";

/**
 * وظيفة تسجيل المسارات الرئيسية
 * بعد اكتمال الانتقال، تستخدم هذه الوظيفة نظام المسارات الجديد فقط
 */
export async function registerRoutes(app: Express): Promise<Server> {
  console.log("🚀 بدء تسجيل المسارات...");
  
  try {
    // تحميل وتسجيل المسارات الجديدة
    const routesModule = await import("./routes/index");
    if (typeof routesModule.registerApiRoutes === "function") {
      console.log("✅ تسجيل المسارات باستخدام النظام الجديد");
      // تغيير بادئة API لتجنب التداخل مع Next.js
      routesModule.registerApiRoutes(app, "/server/api");
      console.log("🔀 تم تغيير بادئة مسارات API إلى /server/api");
    }
  } catch (error) {
    console.error("❌ خطأ في تسجيل المسارات:", error);
  }
  
  // إنشاء وإرجاع خادم HTTP
  const httpServer = createServer(app);
  return httpServer;
}
