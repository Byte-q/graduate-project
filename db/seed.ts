import { db } from './index';
import { users, insertUserSchema } from '../shared/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 بدء زراعة البيانات...');

  try {
    // التحقق مما إذا كان هناك مستخدم إداري موجود بالفعل
    const existingAdmin = await db.query.users.findFirst({
      where: eq(users.email, 'admin@example.com'),
    });

    if (!existingAdmin) {
      console.log('👤 إنشاء مستخدم إداري...');
      
      // تشفير كلمة المرور
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // إنشاء المستخدم الإداري
      const adminData = {
        username: 'admin',
        fullName: 'مسؤول النظام',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      };
      
      // التحقق من البيانات باستخدام zod
      const validatedData = insertUserSchema.parse(adminData);
      
      // إدخال المستخدم في قاعدة البيانات
      await db.insert(users).values(validatedData);
      console.log('✅ تم إنشاء المستخدم الإداري بنجاح');
    } else {
      console.log('ℹ️ المستخدم الإداري موجود بالفعل');
    }
    
    console.log('✅ اكتملت زراعة البيانات بنجاح');
  } catch (error) {
    console.error('❌ خطأ أثناء زراعة البيانات:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

seed();