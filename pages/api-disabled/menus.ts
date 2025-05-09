import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { menus, menuItems } from '@/shared/schema';
import { eq, asc, sql } from 'drizzle-orm';

type MenuResponse = {
  menu?: any;
  menuItems?: any[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MenuResponse>
) {
  try {
    const { location = 'header' } = req.query;
    
    // جلب القائمة حسب الموقع (header, footer, sidebar, mobile)
    const menuResult = await db
      .select()
      .from(menus)
      .where(sql`${menus.location}::text = ${location}`)
      .execute();
    
    const menu = menuResult.length > 0 ? menuResult[0] : null;
    
    if (!menu) {
      // إرجاع قائمة فارغة بدلاً من رمز الخطأ لتمكين استخدام القائمة الافتراضية
      return res.status(200).json({ menuItems: [] });
    }
    
    // جلب عناصر القائمة المرتبطة بالقائمة
    const items = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.menuId, menu.id))
      .orderBy(asc(menuItems.order))
      .execute();
    
    // بناء هيكل شجرة القائمة مع العناصر الفرعية
    const buildMenuTree = () => {
      const itemMap = new Map<number, any>();
      const rootItems: any[] = [];
      
      // تخزين جميع العناصر في خريطة حسب معرفاتها
      items.forEach(item => {
        itemMap.set(item.id, { ...item, children: [] });
      });
      
      // بناء العلاقات بين العناصر الرئيسية والفرعية
      items.forEach(item => {
        if (item.parentId) {
          const parent = itemMap.get(item.parentId);
          if (parent) {
            parent.children.push(itemMap.get(item.id));
          }
        } else {
          rootItems.push(itemMap.get(item.id));
        }
      });
      
      return rootItems;
    };
    
    const menuTree = buildMenuTree();
    
    res.status(200).json({
      menu,
      menuItems: menuTree
    });
  } catch (error: any) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب بيانات القائمة' });
  }
}