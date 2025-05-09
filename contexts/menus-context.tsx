import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { apiGet } from "@/lib/api"; // استيراد وحدة API الجديدة

export type MenuItemType = {
  id: number;
  title: string;
  type: string;
  url?: string;
  slug?: string;
  children: MenuItemType[];
  [key: string]: any;
};

type MenusContextType = {
  headerMenu: MenuItemType[];
  footerMainMenu: MenuItemType[];
  footerSecondaryMenu: MenuItemType[];
  isLoading: boolean;
  error: string | null;
};

// القائمة الافتراضية للهيدر
const defaultHeaderMenu = [
  { id: 1, title: 'الرئيسية', type: 'link', url: '/', children: [] },
  { id: 2, title: 'المنح الدراسية', type: 'link', url: '/scholarships', children: [] },
  { 
    id: 3,
    title: 'التصنيفات', 
    type: 'link',
    url: '#',
    children: [
      { id: 31, title: 'حسب التخصص', type: 'link', url: '/categories', children: [] },
      { id: 32, title: 'حسب الدولة', type: 'link', url: '/countries', children: [] },
      { id: 33, title: 'حسب المستوى', type: 'link', url: '/levels', children: [] },
    ]
  },
  { id: 4, title: 'المقالات', type: 'link', url: '/posts', children: [] },
  { id: 5, title: 'قصص النجاح', type: 'link', url: '/success-stories', children: [] },
  { id: 6, title: 'اتصل بنا', type: 'link', url: '/contact', children: [] },
];

// القائمة الافتراضية للفوتر الرئيسي
const defaultFooterMainMenu = [
  { id: 1, title: 'الرئيسية', type: 'link', url: '/', children: [] },
  { id: 2, title: 'المنح الدراسية', type: 'link', url: '/scholarships', children: [] },
  { id: 3, title: 'المقالات', type: 'link', url: '/posts', children: [] },
  { id: 4, title: 'قصص النجاح', type: 'link', url: '/success-stories', children: [] },
  { id: 5, title: 'اتصل بنا', type: 'link', url: '/contact', children: [] }
];

// القائمة الافتراضية للفوتر الثانوي
const defaultFooterSecondaryMenu = [
  { id: 1, title: 'عن المنصة', type: 'link', url: '/about', children: [] },
  { id: 2, title: 'سياسة الخصوصية', type: 'link', url: '/privacy-policy', children: [] },
  { id: 3, title: 'الشروط والأحكام', type: 'link', url: '/terms', children: [] },
  { id: 4, title: 'الأسئلة الشائعة', type: 'link', url: '/faq', children: [] },
  { id: 5, title: 'تسجيل الدخول', type: 'link', url: '/auth/login', children: [] }
];

// إنشاء السياق
const MenusContext = createContext<MenusContextType>({
  headerMenu: defaultHeaderMenu,
  footerMainMenu: defaultFooterMainMenu,
  footerSecondaryMenu: defaultFooterSecondaryMenu,
  isLoading: false,
  error: null
});

export function MenusProvider({ children }: { children: ReactNode }) {
  const [headerMenu, setHeaderMenu] = useState<MenuItemType[]>(defaultHeaderMenu);
  const [footerMainMenu, setFooterMainMenu] = useState<MenuItemType[]>(defaultFooterMainMenu);
  const [footerSecondaryMenu, setFooterSecondaryMenu] = useState<MenuItemType[]>(defaultFooterSecondaryMenu);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // التحقق مما إذا كانت البيانات موجودة في التخزين المؤقت
    let cachedMenus;
    let cacheTimestamp;
    
    // استخدام try-catch لتجنب أخطاء في بيئات لا تدعم localStorage
    try {
      cachedMenus = localStorage.getItem('menus_cache');
      cacheTimestamp = localStorage.getItem('menus_cache_timestamp');
      
      // التحقق من صلاحية التخزين المؤقت (تخزين لمدة 24 ساعة)
      const isCacheValid = cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 86400000;
      
      if (cachedMenus && isCacheValid) {
        try {
          // استخدام البيانات المخزنة مؤقتًا
          const parsedMenus = JSON.parse(cachedMenus);
          setHeaderMenu(parsedMenus.headerMenu || defaultHeaderMenu);
          setFooterMainMenu(parsedMenus.footerMainMenu || defaultFooterMainMenu);
          setFooterSecondaryMenu(parsedMenus.footerSecondaryMenu || defaultFooterSecondaryMenu);
          setIsLoading(false);
          console.log("تم استخدام البيانات المخزنة مؤقتاً للقوائم");
          return;
        } catch (error) {
          // في حالة حدوث خطأ عند تحليل البيانات المخزنة، نتابع بجلب البيانات من الخادم
          console.error("خطأ في تحليل البيانات المخزنة:", error);
        }
      } else {
        console.log("التخزين المؤقت للقوائم غير موجود أو انتهت صلاحيته، سيتم جلب البيانات من الخادم");
      }
    } catch (error) {
      console.warn("لا يمكن استخدام localStorage:", error);
    }

    // جلب البيانات من الخادم
    const fetchMenus = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // جلب جميع القوائم في طلبات متوازية باستخدام وحدة API الجديدة
        const [headerData, footerData, footerSecondaryData] = await Promise.all([
          apiGet('menus', { params: { location: 'header' } }),
          apiGet('menus', { params: { location: 'footer' } }),
          apiGet('menus', { params: { location: 'footer-secondary' } })
        ]);
        
        // معالجة بيانات قائمة الهيدر
        if (headerData.menuItems && Array.isArray(headerData.menuItems)) {
          setHeaderMenu(headerData.menuItems);
        }
        
        // معالجة بيانات قائمة الفوتر الرئيسية
        if (footerData.menuItems && Array.isArray(footerData.menuItems)) {
          setFooterMainMenu(footerData.menuItems);
        }
        
        // معالجة بيانات قائمة الفوتر الثانوية
        if (footerSecondaryData.menuItems && Array.isArray(footerSecondaryData.menuItems) && footerSecondaryData.menuItems.length > 0) {
          setFooterSecondaryMenu(footerSecondaryData.menuItems);
        } else {
          // استخدام القائمة الافتراضية إذا كانت البيانات فارغة
          console.log('استخدام قائمة الفوتر الثانوية الافتراضية');
          setFooterSecondaryMenu(defaultFooterSecondaryMenu);
        }
        
        // تخزين البيانات في التخزين المؤقت
        const menuData = {
          headerMenu: headerData.menuItems && Array.isArray(headerData.menuItems) ? headerData.menuItems : defaultHeaderMenu,
          footerMainMenu: footerData.menuItems && Array.isArray(footerData.menuItems) ? footerData.menuItems : defaultFooterMainMenu,
          footerSecondaryMenu: footerSecondaryData.menuItems && Array.isArray(footerSecondaryData.menuItems) ? footerSecondaryData.menuItems : defaultFooterSecondaryMenu
        };
        
        try {
          localStorage.setItem('menus_cache', JSON.stringify(menuData));
          localStorage.setItem('menus_cache_timestamp', Date.now().toString());
          console.log("تم تخزين بيانات القوائم في التخزين المؤقت بنجاح");
        } catch (error) {
          console.warn("لا يمكن تخزين البيانات في localStorage:", error);
        }
      } catch (error) {
        console.error('فشل في جلب بيانات القوائم:', error);
        setError('حدث خطأ أثناء جلب بيانات القوائم');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMenus();
  }, []);

  return (
    <MenusContext.Provider
      value={{
        headerMenu,
        footerMainMenu,
        footerSecondaryMenu,
        isLoading,
        error
      }}
    >
      {children}
    </MenusContext.Provider>
  );
}

export function useMenus() {
  const context = useContext(MenusContext);
  
  if (context === undefined) {
    throw new Error("useMenus يجب أن تستخدم داخل MenusProvider");
  }
  
  return context;
}