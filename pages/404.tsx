import Link from 'next/link';
import MainLayout from '../components/layout/MainLayout';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <MainLayout title="الصفحة غير موجودة" description="عذراً، الصفحة التي تبحث عنها غير موجودة">
      <div className="container py-20 md:py-32 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-7xl md:text-9xl font-bold text-primary mb-6">404</div>
          
          <h1 className="text-2xl md:text-3xl font-bold mb-4">
            عذراً، الصفحة غير موجودة
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            يبدو أن الصفحة التي تبحث عنها غير موجودة أو تمت إزالتها.
            يرجى التأكد من الرابط والمحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="ml-2 h-5 w-5 rtl:rotate-180" />
              العودة للصفحة الرئيسية
            </Link>
            
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              الاتصال بالدعم
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}