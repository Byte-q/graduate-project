import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// تعريف نوع البيانات لإعدادات الموقع
export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  siteEmail: string;
  sitePhone: string;
  siteAddress: string;
  logoUrl: string;
  faviconUrl: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    backgroundColor: string;
  };
  socialMedia: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  isLoading: boolean;
  error: string | null;
}

// القيم الافتراضية لإعدادات الموقع
const defaultSiteSettings: SiteSettings = {
  siteName: 'منصة المنح الدراسية',
  siteDescription: 'منصة متخصصة في المنح الدراسية',
  siteUrl: 'https://example.com',
  siteEmail: 'info@example.com',
  sitePhone: '+123456789',
  siteAddress: 'عنوان المنصة',
  logoUrl: '/logo.png',
  faviconUrl: '/favicon.ico',
  theme: {
    primaryColor: '#3b82f6',
    secondaryColor: '#6b7280',
    textColor: '#111827',
    backgroundColor: '#ffffff',
  },
  socialMedia: {
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
    youtube: 'https://youtube.com',
  },
  isLoading: true,
  error: null,
};

// إنشاء السياق (Context)
const SiteSettingsContext = createContext<{
  siteSettings: SiteSettings;
  setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
}>({
  siteSettings: defaultSiteSettings,
  setSiteSettings: () => {},
});

// مزود السياق (Provider)
export const SiteSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);

  useEffect(() => {
    // جلب إعدادات الموقع من الخادم
    const fetchSiteSettings = async () => {
      try {
        const response = await fetch('/api/site-settings');
        if (!response.ok) {
          throw new Error('فشل في جلب إعدادات الموقع');
        }
        const data = await response.json();
        setSiteSettings({
          ...data,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('خطأ في جلب إعدادات الموقع:', error);
        setSiteSettings({
          ...defaultSiteSettings,
          isLoading: false,
          error: error instanceof Error ? error.message : 'حدث خطأ غير معروف',
        });
      }
    };

    fetchSiteSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ siteSettings, setSiteSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

// هوك استخدام إعدادات الموقع
export const useSiteSettings = () => useContext(SiteSettingsContext);