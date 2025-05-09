import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { siteSettings } from '@/shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // الحصول على إعدادات الموقع من قاعدة البيانات
    const siteSettingsData = await db.select().from(siteSettings).limit(1);
    
    if (siteSettingsData && siteSettingsData.length > 0) {
      // إعادة الإعدادات إذا تم العثور عليها
      return res.status(200).json({
        success: true,
        settings: siteSettingsData[0]
      });
    } else {
      // إعادة القيم الافتراضية إذا لم يتم العثور على إعدادات
      const defaultSettings = {
        siteName: 'FULLSCO',
        siteDescription: 'منصة المنح الدراسية والفرص التعليمية',
        theme: {
          primaryColor: '#3b82f6',
          secondaryColor: '#f59e0b',
          accentColor: '#a855f7',
          enableDarkMode: true,
          rtlDirection: true
        },
        socialMedia: {
          facebook: 'https://facebook.com',
          twitter: 'https://twitter.com',
          instagram: 'https://instagram.com',
          linkedin: 'https://linkedin.com'
        },
        layout: {
          homePageLayout: 'default',
          scholarshipPageLayout: 'default',
          articlePageLayout: 'default'
        },
        sections: {
          showHeroSection: true,
          showFeaturedScholarships: true,
          showSearchSection: true,
          showCategoriesSection: true,
          showCountriesSection: true,
          showLatestArticles: true,
          showSuccessStories: true,
          showNewsletterSection: true,
          showStatisticsSection: true,
          showPartnersSection: true
        }
      };
      
      return res.status(200).json({
        success: true,
        settings: defaultSettings
      });
    }
  } catch (error) {
    console.error('Error fetching site settings:', error);
    
    // إعادة رسالة خطأ في حالة فشل الطلب
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب إعدادات الموقع',
      error: error instanceof Error ? error.message : 'خطأ غير معروف'
    });
  }
}