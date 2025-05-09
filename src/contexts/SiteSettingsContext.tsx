import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the site settings interface
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

// Define the context value type
interface SiteSettingsContextType {
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
}

// Default site settings
const defaultSiteSettings: SiteSettings = {
  siteName: 'منصة المنح الدراسية',
  siteDescription: 'منصة للمنح الدراسية والفرص التعليمية',
  siteUrl: 'https://scholarships.example.com',
  siteEmail: 'info@scholarships.example.com',
  sitePhone: '+1234567890',
  siteAddress: 'العنوان، المدينة، البلد',
  logoUrl: '/logo.png',
  faviconUrl: '/favicon.ico',
  theme: {
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    textColor: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  socialMedia: {
    facebook: 'https://facebook.com/scholarships',
    twitter: 'https://twitter.com/scholarships',
    instagram: 'https://instagram.com/scholarships',
    linkedin: 'https://linkedin.com/company/scholarships',
    youtube: 'https://youtube.com/scholarships',
  },
  isLoading: false,
  error: null,
};

// Create the context
const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

// Provider component
export const SiteSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);

  // Fetch site settings from API
  useEffect(() => {
    const fetchSiteSettings = async () => {
      setSiteSettings((prev) => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const response = await fetch('/api/site-settings');
        
        if (!response.ok) {
          throw new Error('Failed to fetch site settings');
        }
        
        const data = await response.json();
        
        setSiteSettings({
          ...data,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching site settings:', error);
        setSiteSettings((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'An unknown error occurred',
        }));
      }
    };

    // الآن قمنا بإنشاء نقطة الـ API، سنقوم بتفعيل جلب الإعدادات
    fetchSiteSettings();
  }, []);

  // Update site settings
  const updateSiteSettings = (settings: Partial<SiteSettings>) => {
    setSiteSettings((prev) => ({ ...prev, ...settings }));
  };

  return (
    <SiteSettingsContext.Provider value={{ siteSettings, updateSiteSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

// Hook to use site settings
export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  
  return context;
};