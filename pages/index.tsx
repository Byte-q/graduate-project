import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Search, GraduationCap, Globe, BookOpen, Award, ArrowDown, BookMarked, Users } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { useSiteSettings } from '../contexts/site-settings-context';
import { ScholarshipCard } from '../components/scholarships/ScholarshipCard';
import { PostCard } from '../components/posts/PostCard';
import { SuccessStoryCard } from '../components/success-stories/SuccessStoryCard';
import { apiGet } from '@/lib/api';

// تعريف أنواع البيانات
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  scholarshipCount?: number;
}

interface Country {
  id: number;
  name: string;
  slug: string;
  flagUrl?: string;
  scholarshipCount?: number;
}

interface Scholarship {
  id: number;
  title: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  deadline?: string;
  amount?: string;
  currency?: string;
  university?: string;
  isFeatured?: boolean;
  isFullyFunded?: boolean;
  countryId?: number;
  levelId?: number;
  categoryId?: number;
  country?: { id: number; name: string; slug: string; };
  category?: { id: number; name: string; slug: string; };
  level?: { id: number; name: string; slug: string; };
  // دعم الحقول القديمة للتوافقية
  image_url?: string;
  is_featured?: boolean;
  is_fully_funded?: boolean;
  country_id?: number;
  level_id?: number;
  category_id?: number;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  authorId?: number;
  authorName?: string;
  categoryId?: number;
  status?: string;
  isFeatured?: boolean;
  viewCount?: number;
  tags?: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
  category?: { id: number; name: string; slug: string; };
}

interface SuccessStory {
  id: number;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  studentName?: string;
  country?: string;
  university?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  graduationYear?: string;
  scholarshipName?: string;
  degree?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface Level {
  id: number;
  name: string;
  slug: string;
  description?: string;
  scholarshipCount?: number;
}

interface HomePageProps {
  categories: Category[];
  countries: Country[];
  levels: Level[];
  featuredScholarships: Scholarship[];
  latestPosts: Post[];
  featuredSuccessStories: SuccessStory[];
}

export default function HomePage({ categories, countries, levels = [], featuredScholarships, latestPosts = [], featuredSuccessStories = [] }: HomePageProps) {
  const { siteSettings } = useSiteSettings();
  const [searchQuery, setSearchQuery] = useState('');
  
  // عرض في وحدة التحكم لفحص البيانات (للتطوير فقط)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Categories:', categories);
      console.log('Countries:', countries);
      console.log('Levels:', levels);
      console.log('Featured Scholarships:', featuredScholarships);
      console.log('Latest Posts:', latestPosts);
      console.log('Featured Success Stories:', featuredSuccessStories);
    }
  }, [categories, countries, levels, featuredScholarships, latestPosts, featuredSuccessStories]);
  
  // مقاطع تمرير للأقسام
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <MainLayout
      title="الرئيسية"
      description="استكشف أفضل المنح الدراسية والفرص التعليمية حول العالم"
    >
      {/* قسم البطل */}
      <section className="relative py-20 md:py-28">
        {/* الخلفية */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-700 opacity-90"></div>
        
        {/* المحتوى */}
        <div className="container relative z-10 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
              {siteSettings?.siteTagline || 'اكتشف افضل فرص المنح الدراسية حول العالم'}
            </h1>
            
            <p className="text-lg md:text-xl opacity-90 mb-8 animate-slide-up">
              نقدم مجموعة شاملة من المنح الدراسية للطلاب من جميع أنحاء العالم.
              ابحث عن المنحة المناسبة لك وابدأ رحلتك التعليمية.
            </p>
            
            {/* صندوق البحث */}
            <div className="relative max-w-2xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <form 
                className="flex flex-col md:flex-row" 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    window.location.href = `/scholarships?search=${encodeURIComponent(searchQuery.trim())}`;
                  }
                }}
              >
                <div className="relative flex-grow mb-3 md:mb-0">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="w-full py-4 px-5 pr-14 rounded-lg md:rounded-r-none text-gray-800 border-0 focus:ring-2 focus:ring-blue-500"
                    placeholder="ابحث عن منح دراسية، جامعات، تخصصات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-4 px-8 rounded-lg md:rounded-l-none transition-all"
                >
                  بحث
                </button>
              </form>
            </div>
            
            {/* ميزات سريعة */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="flex items-center">
                <GraduationCap className="h-6 w-6 mr-2" />
                <span>+10,000 منحة دراسية</span>
              </div>
              <div className="flex items-center">
                <Globe className="h-6 w-6 mr-2" />
                <span>+100 دولة حول العالم</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="h-6 w-6 mr-2" />
                <span>كافة المستويات الدراسية</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* سهم التمرير لأسفل */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden md:block">
          <button
            onClick={() => scrollToSection('categories')}
            className="bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition-colors"
            aria-label="تمرير لأسفل"
          >
            <ArrowDown className="h-6 w-6" />
          </button>
        </div>
      </section>
      
      {/* قسم الإحصائيات */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600 dark:text-gray-300">منحة دراسية</div>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="text-3xl md:text-4xl font-bold text-amber-500 mb-2">110+</div>
              <div className="text-gray-600 dark:text-gray-300">دولة مستضيفة</div>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-600 dark:text-gray-300">تخصص دراسي</div>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">25,000+</div>
              <div className="text-gray-600 dark:text-gray-300">طالب مستفيد</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* قسم التصنيفات */}
      <section id="categories" className="py-16 bg-white dark:bg-gray-800">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">استكشف حسب التصنيف</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              تصفح المنح الدراسية حسب التصنيفات المختلفة للعثور على الفرصة المناسبة لاحتياجاتك واهتماماتك
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* عرض التصنيفات من قاعدة البيانات */}
            {categories && categories.length > 0 ? categories.map((category) => {
              // إنشاء رمز تعبيري استنادًا إلى اسم التصنيف
              let icon = '📚'; // رمز افتراضي
              
              if (category.name.includes('هندس')) icon = '🏗️';
              else if (category.name.includes('طب') || category.name.includes('صح')) icon = '🏥';
              else if (category.name.includes('حاسب') || category.name.includes('تقني')) icon = '💻';
              else if (category.name.includes('أعمال') || category.name.includes('إدار')) icon = '📊';
              else if (category.name.includes('علوم') || category.name.includes('بحث')) icon = '🔬';
              else if (category.name.includes('فن') || category.name.includes('تصميم')) icon = '🎨';
              else if (category.name.includes('قانون') || category.name.includes('حقوق')) icon = '⚖️';
              
              return (
                <Link
                  key={category.id}
                  href={`/scholarships?category=${category.slug}`}
                  className="block bg-gray-50 dark:bg-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow text-center card-hover"
                >
                  <div className="text-4xl mb-3">{icon}</div>
                  <h3 className="font-bold mb-1">{category.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {category.scholarshipCount || 0} منحة
                  </p>
                </Link>
              );
            }) : Array(8).fill(0).map((_, index) => (
              // عنصر تحميل
              <div key={index} className="block bg-gray-50 dark:bg-gray-700 rounded-xl p-6 animate-pulse">
                <div className="h-16 w-16 mx-auto mb-3 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-2/3 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mx-auto"></div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link
              href="/scholarships"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              عرض جميع التصنيفات
              <ArrowRight className="mr-2 h-4 w-4 rtl-mirror" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* قسم المستويات الدراسية */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">استكشف حسب المستوى الدراسي</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              تصفح المنح الدراسية حسب المستويات الدراسية المختلفة للعثور على الفرصة المناسبة لمرحلتك التعليمية
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* عرض المستويات الدراسية من قاعدة البيانات */}
            {levels && levels.length > 0 ? levels.map((level) => {
              // إنشاء رمز تعبيري استنادًا إلى اسم المستوى
              let icon = '🎓'; // رمز افتراضي
              
              if (level.name.includes('بكالوريوس')) icon = '🏛️';
              else if (level.name.includes('ماجستير')) icon = '📜';
              else if (level.name.includes('دكتوراه')) icon = '🔬';
              else if (level.name.includes('ثانوي') || level.name.includes('ثانوية')) icon = '🏫';
              else if (level.name.includes('مهني') || level.name.includes('تدريب')) icon = '🛠️';
              else if (level.name.includes('زمالة') || level.name.includes('بحثية')) icon = '🔍';
              
              return (
                <Link
                  key={level.id}
                  href={`/scholarships?level=${level.slug}`}
                  className="block bg-gray-50 dark:bg-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow text-center card-hover"
                >
                  <div className="text-4xl mb-3">{icon}</div>
                  <h3 className="font-bold mb-1">{level.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {level.scholarshipCount || 0} منحة
                  </p>
                </Link>
              );
            }) : Array(4).fill(0).map((_, index) => (
              // عنصر تحميل
              <div key={index} className="block bg-gray-50 dark:bg-gray-700 rounded-xl p-6 animate-pulse">
                <div className="h-16 w-16 mx-auto mb-3 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-2/3 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mx-auto"></div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link
              href="/scholarships"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              عرض جميع المستويات الدراسية
              <ArrowRight className="mr-2 h-4 w-4 rtl-mirror" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* قسم المنح المميزة */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">أحدث المنح الدراسية</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              استكشف أحدث المنح الدراسية المتاحة لمختلف التخصصات والمستويات الدراسية
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* عرض المنح الدراسية باستخدام مكون ScholarshipCard */}
            {featuredScholarships && featuredScholarships.length > 0 ? (
              featuredScholarships.map((scholarship) => (
                <ScholarshipCard 
                  key={scholarship.id} 
                  scholarship={scholarship} 
                />
              ))
            ) : Array(6).fill(0).map((_, index) => (
              // عنصر تحميل
              <div key={index} className="block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="h-4 mt-4 pt-4 border-t flex justify-between">
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link
              href="/scholarships"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              عرض جميع المنح الدراسية
            </Link>
          </div>
        </div>
      </section>
      
      {/* قسم الدول المميزة */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">الدول الأكثر استضافة للمنح</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              اكتشف أفضل الدول التي توفر فرص تعليمية متميزة للطلاب الدوليين
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {countries && countries.length > 0 ? countries.map((country) => (
              <Link
                key={country.id}
                href={`/scholarships?country=${country.slug}`}
                className="block bg-gray-50 dark:bg-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow card-hover"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                    {country.flagUrl ? (
                      <Image
                        src={country.flagUrl}
                        alt={country.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Globe className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold">{country.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {country.scholarshipCount || 0} منحة
                    </p>
                  </div>
                </div>
              </Link>
            )) : Array(8).fill(0).map((_, index) => (
              // عنصر تحميل
              <div key={index} className="block bg-gray-50 dark:bg-gray-700 rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link
              href="/scholarships"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              عرض جميع الدول
              <ArrowRight className="mr-2 h-4 w-4 rtl-mirror" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* قسم أحدث المقالات */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">آخر المقالات التعليمية</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              استكشف أحدث المقالات والأخبار المتعلقة بالتعليم والمنح الدراسية حول العالم
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestPosts && latestPosts.length > 0 ? (
              latestPosts.map((post: any) => (
                <PostCard 
                  key={post.id} 
                  post={post as any}
                  isCompact={true}
                />
              ))
            ) : Array(3).fill(0).map((_, index) => (
              // عنصر تحميل
              <div key={index} className="block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="h-4 mt-4 pt-4 border-t flex justify-between">
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link
              href="/posts"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              عرض جميع المقالات
              <ArrowRight className="mr-2 h-4 w-4 rtl-mirror" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* قسم قصص النجاح */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">قصص نجاح ملهمة</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              تعرف على تجارب الطلاب الذين حصلوا على منح دراسية وحققوا نجاحات في مسيرتهم التعليمية
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSuccessStories && featuredSuccessStories.length > 0 ? (
              featuredSuccessStories.map((story: any) => (
                <SuccessStoryCard 
                  key={story._id} 
                  story={story as any}
                  isCompact={true}
                />
              ))
            ) : Array(3).fill(0).map((_, index) => (
              // عنصر تحميل
              <div key={index} className="block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link
              href="/success-stories"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              عرض جميع قصص النجاح
              <ArrowRight className="mr-2 h-4 w-4 rtl-mirror" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* قسم الانضمام للنشرة البريدية */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">انضم إلى نشرتنا البريدية</h2>
            <p className="text-lg mb-8 opacity-90">
              احصل على آخر المنح الدراسية والفرص التعليمية مباشرة إلى بريدك الإلكتروني
            </p>
            
            <form className="flex flex-col md:flex-row max-w-xl mx-auto">
              <input
                type="email"
                className="bg-white bg-opacity-20 border-0 rounded-lg md:rounded-r-none py-3 px-4 text-white placeholder-white placeholder-opacity-70 mb-3 md:mb-0 focus:ring-2 focus:ring-white focus:bg-opacity-30"
                placeholder="أدخل بريدك الإلكتروني"
              />
              <button
                type="submit"
                className="bg-white text-blue-700 font-bold py-3 px-6 rounded-lg md:rounded-l-none"
              >
                اشترك الآن
              </button>
            </form>
            
            <div className="mt-4 text-sm opacity-80">
              نحترم خصوصيتك. يمكنك إلغاء الاشتراك في أي وقت.
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/server/api';

  try {
    // Fetch categories
    const categoriesRes = await apiGet(`/categories`);
    const categories = categoriesRes.data;
    // const categories = categoriesRes.ok ? await categoriesRes.json() : [];

    // Fetch countries
    const countriesRes = await apiGet(`/countries`);
    const countries = countriesRes.data;

    // Fetch levels
    const levelsRes = await apiGet(`/levels`);
    const levels = levelsRes.data;

    // Fetch featured scholarships
    const featuredScholarshipsRes = await apiGet(`/scholarships`);
    const featuredScholarships = featuredScholarshipsRes.data;

    // Fetch latest posts
    const latestPostsRes = await apiGet(`/posts?limit=3`);
    const latestPosts = latestPostsRes.data;

    // Fetch featured success stories
    const featuredSuccessStoriesRes = await apiGet(`/success-stories?limit=3`);
    const featuredSuccessStories = featuredSuccessStoriesRes.data;

    return {
      props: {
        categories,
        countries,
        levels,
        featuredScholarships,
        latestPosts,
        featuredSuccessStories,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        categories: [],
        countries: [],
        levels: [],
        featuredScholarships: [],
        latestPosts: [],
        featuredSuccessStories: [],
      },
    };
  }
};