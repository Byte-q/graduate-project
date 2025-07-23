import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiGet } from '@/lib/api'; // استيراد وحدة API الجديدة

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteTagline?: string;
  siteEmail?: string;
  sitePhone?: string;
  siteAddress?: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  faviconUrl?: string;
  footerText?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    enableDarkMode: boolean;
    rtlDirection: boolean;
  };
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    whatsapp?: string;
  };
  layout: {
    homePageLayout: string;
    scholarshipPageLayout: string;
    articlePageLayout: string;
  };
  sections: {
    showHeroSection: boolean;
    showFeaturedScholarships: boolean;
    showSearchSection: boolean;
    showCategoriesSection: boolean;
    showCountriesSection: boolean;
    showLatestArticles: boolean;
    showSuccessStories: boolean;
    showNewsletterSection: boolean;
    showStatisticsSection: boolean;
    showPartnersSection: boolean;
  };
  customCss?: string;
  
  // حقول إضافية لدعم التوافق مع هيكل البيانات المستلمة من الخادم
  email?: string;
  phone?: string;
  address?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  whatsapp?: string;
}

interface SiteSettingsContextType {
  siteSettings: SiteSettings | null;
  isLoading: boolean;
  error: string | null;
}

// إنشاء سياق إعدادات الموقع
const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

// القيم الافتراضية لإعدادات الموقع
const defaultSiteSettings: SiteSettings = {
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

// مزود سياق إعدادات الموقع
export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  // القيم المبدئية هي null (لا نستخدم قيم افتراضية)
  const [cachedSettings, setCachedSettings] = useState<SiteSettings | null>(null);
  
  // محاولة تحميل البيانات المخزنة مبدئيًا
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && localStorage) {
        const cachedDataString = localStorage.getItem('site_settings_cache');
        if (cachedDataString) {
          const parsed = JSON.parse(cachedDataString);
          console.log('تم العثور على بيانات مخزنة للإعدادات');
          setCachedSettings(parsed);
        }
      }
    } catch (e) {
      console.warn('خطأ عند محاولة قراءة التخزين المحلي:', e);
    }
  }, []);
  
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(cachedSettings);
  const [isLoading, setIsLoading] = useState(!cachedSettings);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // التحقق من وجود بيانات في التخزين المحلي أولاً
    const loadFromCache = () => {
      try {
        const cachedDataString = localStorage.getItem('site_settings_cache');
        const cachedTimestamp = localStorage.getItem('site_settings_timestamp');
        
        if (cachedDataString && cachedTimestamp) {
          const now = Date.now();
          const timestamp = parseInt(cachedTimestamp, 10);
          
          // التحقق من صلاحية البيانات المخزنة (24 ساعة)
          if (now - timestamp < 24 * 60 * 60 * 1000) {
            const cachedData = JSON.parse(cachedDataString);
            console.log('تم استخدام البيانات المخزنة مؤقتاً لإعدادات الموقع');
            setSiteSettings(cachedData);
            return true;
          }
        }
      } catch (error) {
        console.warn('خطأ في قراءة البيانات المخزنة:', error);
      }
      return false;
    };

    async function fetchSiteSettings() {
      try {
        // محاولة استخدام البيانات المخزنة أولاً
        if (loadFromCache()) {
          setIsLoading(false);
          return;
        }
        
        setIsLoading(true);
        console.log('بدء استعلام إعدادات الموقع');
        
        // استخدام وحدة API الجديدة
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:3500/server/api'; // تأكد من تعيين URL API في البيئة
        const res = (await fetch(`${apiUrl}/site-settings`));
        const data: any = res.json();
        console.log('بيانات استجابة API لإعدادات الموقع:', data);
        
        if (data) {
          console.log('تم استلام إعدادات الموقع:', data);
          
          // إعداد كائن الإعدادات
          const formattedSettings: SiteSettings = {
            // البيانات الأساسية
            siteName: data.siteName,
            siteDescription: data.siteDescription,
            siteTagline: data.siteTagline,
            siteEmail: data.email,
            sitePhone: data.phone,
            siteAddress: data.address,
            logoUrl: data.logo,
            logoDarkUrl: data.logoDark,
            faviconUrl: data.favicon,
            footerText: data.footerText,
            
            // البيانات المحسنة
            socialMedia: {
              facebook: data.facebook,
              twitter: data.twitter,
              instagram: data.instagram,
              linkedin: data.linkedin,
              youtube: data.youtube,
              whatsapp: data.whatsapp
            },
            
            // السمة
            theme: {
              primaryColor: data.primaryColor,
              secondaryColor: data.secondaryColor,
              accentColor: data.accentColor,
              enableDarkMode: data.enableDarkMode,
              rtlDirection: data.rtlDirection
            },
            
            // التخطيط
            layout: {
              homePageLayout: data.homePageLayout,
              scholarshipPageLayout: data.scholarshipPageLayout,
              articlePageLayout: data.articlePageLayout
            },
            
            // الأقسام
            sections: {
              showHeroSection: data.showHeroSection,
              showFeaturedScholarships: data.showFeaturedScholarships,
              showSearchSection: data.showSearchSection,
              showCategoriesSection: data.showCategoriesSection,
              showCountriesSection: data.showCountriesSection,
              showLatestArticles: data.showLatestArticles,
              showSuccessStories: data.showSuccessStories,
              showNewsletterSection: data.showNewsletterSection,
              showStatisticsSection: data.showStatisticsSection,
              showPartnersSection: data.showPartnersSection
            },
            
            // إضافات
            customCss: data.customCss,
            
            // دعم الحقول البديلة
            email: data.email,
            phone: data.phone, 
            address: data.address,
            facebook: data.facebook,
            twitter: data.twitter,
            instagram: data.instagram,
            linkedin: data.linkedin,
            youtube: data.youtube,
            whatsapp: data.whatsapp
          };
          
          // تخزين البيانات في التخزين المحلي
          try {
            localStorage.setItem('site_settings_cache', JSON.stringify(formattedSettings));
            localStorage.setItem('site_settings_timestamp', Date.now().toString());
            console.log('تم تخزين إعدادات الموقع في التخزين المؤقت');
          } catch (error) {
            console.warn('فشل تخزين إعدادات الموقع في التخزين المحلي:', error);
          }
          
          // تعيين البيانات في الحالة
          setSiteSettings(formattedSettings);
          setError(null);
        } else {
          console.error('لم يتم العثور على إعدادات في استجابة API');
          setError('لم يتم العثور على إعدادات الموقع');
        }
      } catch (err) {
        console.error('خطأ في جلب إعدادات الموقع:', err);
        setError('حدث خطأ أثناء جلب إعدادات الموقع');
        
        // في حالة الخطأ، نحاول استخدام البيانات المخزنة بغض النظر عن وقت انتهاء الصلاحية
        try {
          const cachedDataString = localStorage.getItem('site_settings_cache');
          if (cachedDataString) {
            const cachedData = JSON.parse(cachedDataString);
            console.log('استخدام البيانات المخزنة في حالة الخطأ');
            setSiteSettings(cachedData);
            setError(null);
          }
        } catch (cacheError) {
          console.error('فشل استخدام البيانات المخزنة أيضًا:', cacheError);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchSiteSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ siteSettings, isLoading, error }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

// Hook لاستخدام سياق إعدادات الموقع
export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  
  if (context === undefined) {
    throw new Error('يجب استخدام useSiteSettings داخل SiteSettingsProvider');
  }
  
  return context;
}