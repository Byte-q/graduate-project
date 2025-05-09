import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

// تعريف نوع بيانات إعدادات الموقع
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
}

// تعريف نوع بيانات context
interface SiteSettingsContextType {
  siteSettings: SiteSettings | null;
  isLoading: boolean;
  error: string | null;
}

// إعدادات افتراضية
const defaultSiteSettings: SiteSettings = {
  siteName: 'FULLSCO',
  siteDescription: 'منصة المنح الدراسية للطلاب العرب',
  theme: {
    primaryColor: '#3b82f6',
    secondaryColor: '#f59e0b',
    accentColor: '#a855f7',
    enableDarkMode: true,
    rtlDirection: true,
  },
  socialMedia: {},
  layout: {
    homePageLayout: 'default',
    scholarshipPageLayout: 'default',
    articlePageLayout: 'default',
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
    showPartnersSection: false,
  },
};

// إنشاء context
const SiteSettingsContext = createContext<SiteSettingsContextType>({
  siteSettings: null,
  isLoading: true,
  error: null,
});

// مزود السياق
export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // جلب بيانات إعدادات الموقع من API
    const fetchSiteSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/site-settings');
        
        if (!response.ok) {
          throw new Error('فشل في جلب إعدادات الموقع');
        }
        
        const data = await response.json();
        setSiteSettings({
          ...defaultSiteSettings,
          ...data
        });
        setError(null);
      } catch (err) {
        console.error('خطأ في جلب إعدادات الموقع:', err);
        setError('حدث خطأ أثناء تحميل إعدادات الموقع');
        
        // استخدام الإعدادات الافتراضية في حالة الخطأ
        setSiteSettings(defaultSiteSettings);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiteSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ siteSettings, isLoading, error }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

// هوك لاستخدام قيم السياق
export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}