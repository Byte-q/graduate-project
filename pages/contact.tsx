import { useState } from 'react';
import Head from 'next/head';
import MainLayout from '@/components/layout/MainLayout';
import { useSiteSettings } from '@/contexts/site-settings-context';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  AtSign, 
  MessageSquare,
  User,
  Send
} from 'lucide-react';

export default function ContactPage() {
  const { siteSettings } = useSiteSettings();
  
  // حالة النموذج
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<{
    success?: string;
    error?: string;
    errorDetails?: Array<{ message: string; path: string[] }>;
  }>({});
  
  // تحديث حالة النموذج
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // إرسال النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus({});
    
    try {
      // إرسال البيانات إلى API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // تنظيف النموذج
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        
        // عرض رسالة نجاح
        setFormStatus({
          success: result.message || 'تم إرسال رسالتك بنجاح. سنتواصل معك قريبًا.'
        });
      } else {
        // عرض رسالة الخطأ من API
        setFormStatus({
          error: result.error || 'حدث خطأ أثناء إرسال الرسالة. الرجاء المحاولة مرة أخرى.',
          errorDetails: result.details
        });
        
        // طباعة تفاصيل الأخطاء في وحدة التحكم للمساعدة في التصحيح
        console.error('Form validation errors:', result.details);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setFormStatus({
        error: 'حدث خطأ في الاتصال بالخادم. الرجاء التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Head>
        <title>{siteSettings?.siteName ? `اتصل بنا | ${siteSettings.siteName}` : 'اتصل بنا'}</title>
        <meta 
          name="description" 
          content="تواصل معنا للاستفسارات والاقتراحات. نحن هنا للإجابة على أسئلتك ومساعدتك." 
        />
      </Head>
      
      <MainLayout>
        {/* رأس الصفحة */}
        <div className="bg-gradient-brand py-16 text-white">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">اتصل بنا</h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              نحن هنا للإجابة على أسئلتك ومساعدتك. لا تتردد في التواصل معنا للاستفسارات والاقتراحات.
            </p>
          </div>
        </div>
        
        <div className="container py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* بيانات الاتصال */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border h-full">
                <h2 className="text-2xl font-bold mb-6">معلومات الاتصال</h2>
                
                <div className="space-y-6">
                  {/* البريد الإلكتروني */}
                  {siteSettings?.siteEmail && (
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-lg text-primary mr-4">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">البريد الإلكتروني</h3>
                        <a 
                          href={`mailto:${siteSettings.siteEmail}`} 
                          className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                        >
                          {siteSettings.siteEmail}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {/* رقم الهاتف */}
                  {siteSettings?.sitePhone && (
                    <div className="flex items-start">
                      <div className="bg-green-500/10 p-3 rounded-lg text-green-500 mr-4">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">الهاتف</h3>
                        <a 
                          href={`tel:${siteSettings.sitePhone}`} 
                          className="text-gray-600 dark:text-gray-300 hover:text-green-500 transition-colors"
                        >
                          {siteSettings.sitePhone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {/* العنوان */}
                  {siteSettings?.siteAddress && (
                    <div className="flex items-start">
                      <div className="bg-amber-500/10 p-3 rounded-lg text-amber-500 mr-4">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">العنوان</h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {siteSettings.siteAddress}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* وسائل التواصل الاجتماعي */}
                  <div className="pt-4 border-t">
                    <h3 className="font-medium text-lg mb-4">تابعنا على</h3>
                    <div className="flex gap-3">
                      {siteSettings?.socialMedia?.facebook && (
                        <a
                          href={siteSettings.socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-500 transition-colors"
                          aria-label="Facebook"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                          </svg>
                        </a>
                      )}
                      
                      {siteSettings?.socialMedia?.twitter && (
                        <a
                          href={siteSettings.socialMedia.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-500 transition-colors"
                          aria-label="Twitter"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                          </svg>
                        </a>
                      )}
                      
                      {siteSettings?.socialMedia?.instagram && (
                        <a
                          href={siteSettings.socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full hover:bg-pink-100 dark:hover:bg-pink-900 hover:text-pink-500 transition-colors"
                          aria-label="Instagram"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                          </svg>
                        </a>
                      )}
                      
                      {siteSettings?.socialMedia?.linkedin && (
                        <a
                          href={siteSettings.socialMedia.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 transition-colors"
                          aria-label="LinkedIn"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                        </a>
                      )}
                      
                      {siteSettings?.socialMedia?.youtube && (
                        <a
                          href={siteSettings.socialMedia.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-500 transition-colors"
                          aria-label="YouTube"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* نموذج الاتصال */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                <h2 className="text-2xl font-bold mb-6">أرسل لنا رسالة</h2>
                
                {/* عرض رسائل النجاح والخطأ */}
                {formStatus.success && (
                  <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
                    {formStatus.success}
                  </div>
                )}
                
                {formStatus.error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                    {formStatus.error}
                    {formStatus.errorDetails && (
                      <div className="mt-2 text-sm">
                        <ul className="list-disc list-inside">
                          {formStatus.errorDetails.map((detail, index) => (
                            <li key={index}>{detail.message}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* الاسم */}
                    <div>
                      <label 
                        htmlFor="name" 
                        className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        الاسم الكامل
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                          <User className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="block w-full pr-10 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="ادخل الاسم الكامل"
                          required
                        />
                      </div>
                    </div>
                    
                    {/* البريد الإلكتروني */}
                    <div>
                      <label 
                        htmlFor="email" 
                        className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        البريد الإلكتروني
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                          <AtSign className="w-5 h-5" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="block w-full pr-10 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="example@domain.com"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* الموضوع */}
                  <div className="mb-6">
                    <label 
                      htmlFor="subject" 
                      className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      الموضوع
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="block w-full pr-10 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="أدخل موضوع الرسالة"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* الرسالة */}
                  <div className="mb-6">
                    <label 
                      htmlFor="message" 
                      className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      الرسالة
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="block w-full py-3 px-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="اكتب رسالتك هنا..."
                      required
                    />
                  </div>
                  
                  {/* زر الإرسال */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="mr-2">جاري الإرسال...</span>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </>
                    ) : (
                      <>
                        <span className="mr-2">إرسال الرسالة</span>
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          {/* خريطة الموقع - يمكن إضافتها إذا توفر العنوان */}
          {siteSettings?.siteAddress && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">موقعنا</h2>
              <div className="bg-gray-200 dark:bg-gray-700 h-96 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Globe className="w-12 h-12 mx-auto mb-4 text-gray-500 dark:text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-300">
                    {siteSettings.siteAddress}
                  </p>
                  <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                    (ستظهر هنا خريطة الموقع في الإصدار النهائي)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </>
  );
}