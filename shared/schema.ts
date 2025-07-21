// MongoDB-compatible schema and types for all entities
import { z } from 'zod';

// User
export interface User {
  _id?: string;
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: Date;
}
export const userSchema = z.object({
  _id: z.string().optional(),
  username: z.string(),
  password: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  role: z.string().default('user'),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});
export const insertUserSchema = userSchema.omit({ _id: true, createdAt: true });

// Category
export interface Category {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
}
export const categorySchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
});
export const insertCategory = categorySchema.omit({ _id: true });

// Level
export interface Level {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
}
export const levelSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
});
export const insertLevelSchema = levelSchema.omit({ _id: true });

// Country
export interface Country {
  _id?: string;
  name: string;
  slug: string;
  flagUrl?: string;
}
export const countrySchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  slug: z.string(),
  flagUrl: z.string().optional(),
});
export const insertCountrySchema = countrySchema.omit({ _id: true });

// Scholarship
export interface Scholarship {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  content?: string;
  deadline?: string;
  amount?: string;
  currency?: string;
  university?: string;
  department?: string;
  website?: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  isFeatured?: boolean;
  isFullyFunded?: boolean;
  isPublished?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  focusKeyword?: string;
  countryId?: string;
  levelId?: string;
  categoryId?: string;
  requirements?: string;
  applicationLink?: string;
  imageUrl?: string;
  views?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
export const scholarshipSchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  content: z.string().optional(),
  deadline: z.string().optional(),
  amount: z.string().optional(),
  currency: z.string().optional(),
  university: z.string().optional(),
  department: z.string().optional(),
  website: z.string().optional(),
  startDate: z.any().optional(),
  endDate: z.any().optional(),
  isFeatured: z.boolean().optional(),
  isFullyFunded: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  focusKeyword: z.string().optional(),
  countryId: z.string().optional(),
  levelId: z.string().optional(),
  categoryId: z.string().optional(),
  requirements: z.string().optional(),
  applicationLink: z.string().optional(),
  imageUrl: z.string().optional(),
  views: z.number().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export const insertScholarshipSchema = scholarshipSchema.omit({ _id: true, createdAt: true, updatedAt: true });

// Post
export interface Post {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  authorId: string;
  status: string;
  imageUrl?: string;
  isFeatured?: boolean;
  views?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  focusKeyword?: string;
  categoryId?: string;
  readTime?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
export const postSchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().optional(),
  authorId: z.string(),
  status: z.string(),
  imageUrl: z.string().optional(),
  isFeatured: z.boolean().optional(),
  views: z.number().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  focusKeyword: z.string().optional(),
  categoryId: z.string().optional(),
  readTime: z.number().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export const insertPostSchema = postSchema.omit({ _id: true, createdAt: true, updatedAt: true });

// Tag
export interface Tag {
  _id?: string;
  name: string;
  slug: string;
}
export const tagSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  slug: z.string(),
});
export const insertTagSchema = tagSchema.omit({ _id: true });

// PostTag (Junction)
export interface PostTag {
  _id?: string;
  postId: string;
  tagId: string;
}
export const postTagSchema = z.object({
  _id: z.string().optional(),
  postId: z.string(),
  tagId: z.string(),
});
export const insertPostTagSchema = postTagSchema.omit({ _id: true });

// Success Story
export interface SuccessStory {
  _id?: string;
  name: string;
  title: string;
  slug: string;
  content: string;
  university: string;
  country: string;
  degree: string;
  graduationYear: string;
  thumbnailUrl: string;
  studentName: string;
  scholarshipName?: string;
  imageUrl?: string;
  isPublished?: boolean;
  createdAt?: Date;
}
export const successStorySchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  university: z.string(),
  country: z.string(),
  degree: z.string(),
  graduationYear: z.string(),
  thumbnailUrl: z.string(),
  studentName: z.string(),
  scholarshipName: z.string().optional(),
  imageUrl: z.string().optional(),
  isPublished: z.boolean().optional(),
  createdAt: z.date().optional(),
});
export const insertSuccessStory = successStorySchema.omit({ _id: true, createdAt: true });

// Subscriber
export interface Subscriber {
  _id?: string;
  email: string;
  createdAt?: Date;
}
export const subscriberSchema = z.object({
  _id: z.string().optional(),
  email: z.string().email(),
  createdAt: z.date().optional(),
});
export const InsertSubscriber = subscriberSchema.omit({ _id: true, createdAt: true });

// SEO Setting
export interface SeoSetting {
  _id?: string;
  pagePath: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  keywords?: string;
}
export const seoSettingSchema = z.object({
  _id: z.string().optional(),
  pagePath: z.string(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: z.string().optional(),
  keywords: z.string().optional(),
});
export const insertSeoSettingsSchema = seoSettingSchema.omit({ _id: true });

// Partners

export interface Partner {
  _id: string;
  name: string;
  logoUrl?: string;
  website?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export const partnerSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  logoUrl: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
});

export const InsertPartner = partnerSchema.omit({ _id: true});

// Site Setting
export interface SiteSetting {
  _id?: string;
  siteName: string;
  siteTagline?: string;
  siteDescription?: string;
  favicon?: string;
  logo?: string;
  logoDark?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  enableDarkMode?: boolean;
  rtlDirection?: boolean;
  defaultLanguage?: string;
  heroButtonText?: string;
  enableNewsletter?: boolean;
  enableScholarshipSearch?: boolean;
  footerText?: string;
  showHeroSection?: boolean;
  showFeaturedScholarships?: boolean;
  showSearchSection?: boolean;
  showCategoriesSection?: boolean;
  showCountriesSection?: boolean;
  showLatestArticles?: boolean;
  showSuccessStories?: boolean;
  showNewsletterSection?: boolean;
  showStatisticsSection?: boolean;
  showPartnersSection?: boolean;
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
}
export const siteSettingSchema = z.object({
  _id: z.string().optional(),
  siteName: z.string(),
  siteTagline: z.string().optional(),
  siteDescription: z.string().optional(),
  favicon: z.string().optional(),
  logo: z.string().optional(),
  logoDark: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  linkedin: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  enableDarkMode: z.boolean().optional(),
  rtlDirection: z.boolean().optional(),
  defaultLanguage: z.string().optional(),
  heroButtonText: z.string().optional(),
  enableNewsletter: z.boolean().optional(),
  enableScholarshipSearch: z.boolean().optional(),
  footerText: z.string().optional(),
  showHeroSection: z.boolean().optional(),
  showFeaturedScholarships: z.boolean().optional(),
  showSearchSection: z.boolean().optional(),
  showCategoriesSection: z.boolean().optional(),
  showCountriesSection: z.boolean().optional(),
  showLatestArticles: z.boolean().optional(),
  showSuccessStories: z.boolean().optional(),
  showNewsletterSection: z.boolean().optional(),
  showStatisticsSection: z.boolean().optional(),
  showPartnersSection: z.boolean().optional(),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroDescription: z.string().optional(),
});
export const insertSiteSettingsSchema = siteSettingSchema.omit({ _id: true });

// Statistics
export interface statistic {
  _id?: string,
  data: any,
  type: string, 
};

export const statisticSchema = z.object({
  _id: z.string(),
  data: z.any(),
  type: z.string(),
});

export const insertStatisticSchema = statisticSchema.omit({ _id: true })

// Pages
export interface Page {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isPublished?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const pageSchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  isPublished: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export const insertPageSchema = pageSchema.omit({ _id: true, createdAt: true, updatedAt: true });

// Menus
export interface MenuItem {
  _id?: string;
  label: string;
  url: string;
  order?: number;
  menuId: string;
  parentId?: string;
  icon?: string;
  isActive?: boolean;
}

export interface Menu {
  _id?: string;
  title: string;
  slug: string;
  items: MenuItem[];
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export const menuItemSchema = z.object({
  _id: z.string().optional(),
  label: z.string(),
  url: z.string(),
  order: z.number().optional(),
  parentId: z.string().optional(),
  menuId: z.string(),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const menuSchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  slug: z.string(),
  items: z.array(menuItemSchema),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  isActive: z.boolean().optional(),
});
export const insertMenuSchema = menuSchema.omit({ _id: true, createdAt: true, updatedAt: true });
export const insertMenuItemSchema = menuItemSchema.omit({ _id: true, });

// Media
export interface MediaFile {
  _id?: string;
  filename: string;
  url: string;
  type: string;
  size: number;
  altText?: string;
  title?: string;
  uploadedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export const mediaFileSchema = z.object({
  _id: z.string().optional(),
  filename: z.string(),
  url: z.string(),
  type: z.string(),
  size: z.number(),
  altText: z.string().optional(),
  title: z.string().optional(),
  uploadedBy: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  isActive: z.boolean().optional(),
});
export const insertMediaFileSchema = mediaFileSchema.omit({ _id: true, createdAt: true, updatedAt: true });
// Add similar interfaces and schemas for Menu, MenuItem, MediaFile, ContactMessage as needed.
