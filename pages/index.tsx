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
                  key={story.id} 
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

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // تحسين الأداء: إضافة خيار التخزين المؤقت Cache-Control
  // تخزين مؤقت لمدة ساعة للصفحة الرئيسية
  res.setHeader(
    'Cache-Control',
    'public, max-age=1800, s-maxage=3600, stale-while-revalidate=59'
  );
  try {
    // استيراد الوظائف والوحدات اللازمة
    const { db } = await import('../db');
    const { sql, desc } = await import('drizzle-orm');
    const { categories, countries, scholarships, levels, posts, successStories } = await import('../fullsco-backend/src/shared/schema');

    // جلب التصنيفات مع عدد المنح الدراسية لكل تصنيف
    const categoriesWithCount = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        scholarshipCount: sql`count(${scholarships.id})`.mapWith(Number),
      })
      .from(categories)
      .leftJoin(scholarships, sql`${scholarships.categoryId} = ${categories.id}`)
      .groupBy(categories.id)
      .orderBy(sql`count(${scholarships.id}) DESC`)
      .limit(8);

    // جلب الدول مع عدد المنح الدراسية لكل دولة
    const countriesWithCount = await db
      .select({
        id: countries.id,
        name: countries.name,
        slug: countries.slug,
        scholarshipCount: sql`count(${scholarships.id})`.mapWith(Number),
      })
      .from(countries)
      .leftJoin(scholarships, sql`${scholarships.countryId} = ${countries.id}`)
      .groupBy(countries.id)
      .orderBy(sql`count(${scholarships.id}) DESC`)
      .limit(8);
    
    // إضافة حقل flagUrl افتراضي لكل دولة
    const countriesWithFlags = countriesWithCount.map(country => ({
      ...country,
      flagUrl: null // سيتم تحديثه لاحقًا من مصدر خارجي
    }));
    
    // جلب المستويات الدراسية مع عدد المنح الدراسية لكل مستوى
    const levelsWithCount = await db
      .select({
        id: levels.id,
        name: levels.name,
        slug: levels.slug,
        description: levels.description,
        scholarshipCount: sql`count(${scholarships.id})`.mapWith(Number),
      })
      .from(levels)
      .leftJoin(scholarships, sql`${scholarships.levelId} = ${levels.id}`)
      .groupBy(levels.id)
      .orderBy(sql`count(${scholarships.id}) DESC`)
      .limit(6);

    // جلب المنح الدراسية المميزة باستخدام واجهة API
    console.log('Fetching featured scholarships from API...');
    let featuredScholarships = [];
    
    // تحديد المسار الكامل للاتصال بـ Express API
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
    
    try {
      // استخدام طلب fetch مع المسار المطلق للخادم وإصلاح المسارات
      console.log('Using server/api path for featured scholarships');
      const response = await fetch(`${API_BASE_URL}/server/api/scholarships/featured`);
      
      if (response.ok) {
        const data = await response.json();
        
        // التعامل مع الاستجابة مباشرة كمصفوفة
        if (Array.isArray(data)) {
          featuredScholarships = data;
          console.log(`Successfully fetched ${featuredScholarships.length} featured scholarships from API`);
        } 
        // التحقق من هيكل البيانات القديم
        else if (data.success && Array.isArray(data.scholarships)) {
          featuredScholarships = data.scholarships;
          console.log(`Successfully fetched ${featuredScholarships.length} featured scholarships from API (old format)`);
        } else {
          console.error('API returned invalid data structure:', typeof data);
        }
      } else {
        console.error(`Failed to fetch featured scholarships, status: ${response.status}`);
        throw new Error(`API request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching featured scholarships from API:', error);
      
      // إذا فشل استخدام API، نستخدم استعلام احتياطي مباشر
      console.log('Falling back to direct database query for featured scholarships...');
      
      const featuredScholarshipsQuery = await db
        .select({
          id: scholarships.id,
          title: scholarships.title,
          slug: scholarships.slug,
          description: scholarships.description,
          imageUrl: scholarships.imageUrl,
          deadline: scholarships.deadline,
          amount: scholarships.amount,
          currency: scholarships.currency,
          university: scholarships.university,
          isFeatured: scholarships.isFeatured,
          isFullyFunded: scholarships.isFullyFunded,
          countryId: scholarships.countryId,
          levelId: scholarships.levelId,
          categoryId: scholarships.categoryId,
          createdAt: scholarships.createdAt
        })
        .from(scholarships)
        .where(sql`${scholarships.isFeatured} = true AND ${scholarships.isPublished} = true`)
        .orderBy(desc(scholarships.createdAt))
        .limit(6);
      
      // تحويل النتائج إلى الصيغة المطلوبة
      featuredScholarships = await Promise.all(
        featuredScholarshipsQuery.map(async (scholarship) => {
          // جلب البيانات المرتبطة
          let category = null, country = null, level = null;
          
          // جلب التصنيف
          if (scholarship.categoryId) {
            const categoryData = await db
              .select({
                id: categories.id,
                name: categories.name,
                slug: categories.slug
              })
              .from(categories)
              .where(sql`${categories.id} = ${scholarship.categoryId}`)
              .limit(1);
            
            if (categoryData.length > 0) {
              category = categoryData[0];
            }
          }
          
          // جلب الدولة
          if (scholarship.countryId) {
            const countryData = await db
              .select({
                id: countries.id,
                name: countries.name,
                slug: countries.slug
              })
              .from(countries)
              .where(sql`${countries.id} = ${scholarship.countryId}`)
              .limit(1);
            
            if (countryData.length > 0) {
              country = countryData[0];
            }
          }
          
          // جلب المستوى
          if (scholarship.levelId) {
            const levelData = await db
              .select({
                id: levels.id,
                name: levels.name,
                slug: levels.slug
              })
              .from(levels)
              .where(sql`${levels.id} = ${scholarship.levelId}`)
              .limit(1);
            
            if (levelData.length > 0) {
              level = levelData[0];
            }
          }
          
          // تحويل كائن المنحة للنموذج المتوافق مع الواجهة
          return {
            ...scholarship,
            image_url: scholarship.imageUrl,
            is_featured: scholarship.isFeatured,
            is_fully_funded: scholarship.isFullyFunded,
            category_id: scholarship.categoryId,
            country_id: scholarship.countryId,
            level_id: scholarship.levelId,
            thumbnailUrl: scholarship.imageUrl || '/images/default-scholarship.svg',
            category,
            country,
            level
          };
        })
      );
    }

    // جلب آخر المقالات
    let latestPosts = [];
    try {
      // استخدام المسار الكامل للخادم مع تحديث المسار
      console.log('Using server/api path for latest posts');
      const postsResponse = await fetch(`${API_BASE_URL}/server/api/posts?limit=3`);
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        // استقبال البيانات كمصفوفة مباشرة أو كجزء من كائن
        const posts = Array.isArray(postsData) ? postsData : (Array.isArray(postsData.posts) ? postsData.posts : []);
        if (posts.length > 0) {
          // تجهيز المقالات ليتناسب مع نموذج البيانات المتوقع
          latestPosts = posts.map((post: any) => {
            return {
              ...post,
              content: post.content || '',
              isFeatured: post.isFeatured === true,
              imageUrl: post.imageUrl || post.image_url || null,
              thumbnailUrl: post.thumbnailUrl || post.imageUrl || post.image_url || null,
              // إضافة الحقول المفقودة التي يتوقعها المكون
              metaTitle: post.metaTitle || null,
              metaDescription: post.metaDescription || null,
              metaKeywords: post.metaKeywords || null,
              focusKeyword: post.focusKeyword || null,
              views: post.views || 0,
              authorName: post.authorName || 'كاتب المقال'
            };
          });
          console.log(`Successfully fetched ${latestPosts.length} latest posts from API`);
        } else {
          console.log(`Response structure is not as expected: ${JSON.stringify(postsData)}`);
        }
      }
    } catch (postsError) {
      console.error('Error fetching latest posts from API:', postsError);
      // استعلام مباشر لقاعدة البيانات كنسخة احتياطية
      latestPosts = await db
        .select()
        .from(posts)
        .orderBy(desc(posts.createdAt))
        .limit(3);
    }

    // جلب قصص النجاح
    let featuredSuccessStories = [];
    try {
      // استخدام المسار الكامل للخادم مع تحديث المسار
      console.log('Using server/api path for success stories');
      const storiesResponse = await fetch(`${API_BASE_URL}/server/api/success-stories?limit=3`);
      if (storiesResponse.ok) {
        const storiesData = await storiesResponse.json();
        // استقبال البيانات كمصفوفة مباشرة أو كجزء من كائن
        const stories = Array.isArray(storiesData) ? storiesData : (Array.isArray(storiesData.stories) ? storiesData.stories : []);
        if (stories.length > 0) {
          // تجهيز قصص النجاح لتتناسب مع نموذج البيانات المتوقع
          featuredSuccessStories = stories.map((story: any) => {
            return {
              ...story,
              content: story.content || '',
              isPublished: story.isPublished === true || true,
              imageUrl: story.imageUrl || null,
              scholarshipName: story.scholarshipName || null,
              // التأكد من وجود الحقول المتوقعة في المكون
              studentName: story.studentName || story.name || null,
              name: story.name || story.studentName || null
            };
          });
          console.log(`Successfully fetched ${featuredSuccessStories.length} success stories from API`);
        } else {
          console.log(`Response structure for stories is not as expected: ${JSON.stringify(storiesData)}`);
        }
      }
    } catch (storiesError) {
      console.error('Error fetching success stories from API:', storiesError);
      // استعلام مباشر لقاعدة البيانات كنسخة احتياطية
      featuredSuccessStories = await db
        .select()
        .from(successStories)
        .orderBy(desc(successStories.createdAt))
        .limit(3);
    }

    // تحويل البيانات إلى صيغة يمكن تمثيلها كـ JSON
    // تحويل كائنات التاريخ إلى سلاسل نصية
    const serializableData = {
      categories: JSON.parse(JSON.stringify(categoriesWithCount)),
      countries: JSON.parse(JSON.stringify(countriesWithFlags)),
      levels: JSON.parse(JSON.stringify(levelsWithCount)),
      featuredScholarships: JSON.parse(JSON.stringify(featuredScholarships)),
      latestPosts: JSON.parse(JSON.stringify(latestPosts)),
      featuredSuccessStories: JSON.parse(JSON.stringify(featuredSuccessStories))
    };

    return {
      props: serializableData
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    
    // في حالة حدوث خطأ، نعيد قيم افتراضية فارغة
    // مع التأكد من إمكانية تمثيلها كـ JSON
    const emptyData = {
      categories: [],
      countries: [],
      levels: [],
      featuredScholarships: [],
      latestPosts: [],
      featuredSuccessStories: []
    };
    
    return {
      props: emptyData
    };
  }
};