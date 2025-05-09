import { useState } from 'react';
import Link from 'next/link';
import { Calendar, User } from 'lucide-react';
import { Post } from '@/shared/schema';
import { formatDate } from '@/lib/utils';
import { OptimizedImage } from '@/components/OptimizedImage';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: Post;
  isCompact?: boolean;
}

/**
 * مكون يعرض بطاقة مقال
 * @param post بيانات المقال
 * @param isCompact ما إذا كان العرض مختصر أم كامل
 */
export function PostCard({ post, isCompact = false }: PostCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // استخراج مقتطف من المحتوى إذا لم يكن المقتطف موجودًا
  const excerpt = post.excerpt || (post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '');
  
  return (
    <Link
      href={`/posts/${post.slug}`}
      className={cn(
        "block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow",
        isHovered && "ring-2 ring-primary"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        <OptimizedImage
          src={post.imageUrl || (post as any).thumbnailUrl}
          alt={post.title}
          fill
          className="object-cover"
          lazyLoading={true}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {post.isFeatured && (
          <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs px-2 py-1 rounded">
            مقال مميز
          </div>
        )}
      </div>
      
      <div className="p-4 md:p-6">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{post.title}</h3>
        
        {!isCompact && (
          <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {excerpt}
          </p>
        )}
        
        <div className="flex flex-wrap justify-between items-center text-sm text-gray-500 dark:text-gray-400 mt-3">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 ml-1" />
            <span>{formatDate(post.createdAt)}</span>
          </div>
          
          <div className="flex items-center">
            <User className="w-4 h-4 ml-1" />
            <span>بواسطة: {(post as any).authorName || 'كاتب المقال'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}