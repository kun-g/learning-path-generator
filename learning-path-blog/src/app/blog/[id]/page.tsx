'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, Share2, BookOpen } from 'lucide-react';
import { type Blog, blogService } from '@/lib/supabase';

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    if (params.id) {
      loadBlog(params.id as string);
    }
  }, [params.id]);

  const loadBlog = async (id: string) => {
    try {
      setIsLoading(true);
      const blogData = await blogService.getBlogById(id);

      if (!blogData) {
        router.push('/blog');
        return;
      }

      setBlog(blogData);

      // 加载相关文章（基于标签）
      if (blogData.tags.length > 0) {
        const related = await blogService.getBlogsByTag(blogData.tags[0]);
        const filteredRelated = related.filter(b => b.id !== id).slice(0, 3);
        setRelatedBlogs(filteredRelated);
      }
    } catch (error) {
      console.error('Failed to load blog:', error);
      router.push('/blog');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatContent = (content: string) => {
    // 简单的内容格式化，将换行符转换为段落
    return content.split('\n\n').map((paragraph) => (
      <p key={paragraph.slice(0, 50)} className="mb-4 text-gray-700 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  const handleShare = async () => {
    if (navigator.share && blog) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.summary,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // 备用：复制链接
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">加载文章中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">文章不存在</h1>
          <Link href="/blog">
            <Button>返回博客列表</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 返回按钮 */}
        <div className="flex gap-4">
          <Link href="/blog">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回博客
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">返回首页</Button>
          </Link>
        </div>

        {/* 文章主体 */}
        <Card>
          {blog.image_url && (
            <div className="aspect-video overflow-hidden rounded-t-lg">
              <img
                src={blog.image_url}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <CardHeader className="space-y-4">
            {/* 标签 */}
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* 标题 */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              {blog.title}
            </h1>

            {/* 摘要 */}
            {blog.summary && (
              <p className="text-lg text-gray-600 leading-relaxed border-l-4 border-blue-500 pl-4 italic">
                {blog.summary}
              </p>
            )}

            {/* 文章信息 */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{blog.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(blog.created_at)}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                分享
              </Button>
            </div>
          </CardHeader>

          <CardContent className="prose prose-lg max-w-none">
            <div className="text-gray-800">
              {formatContent(blog.content)}
            </div>
          </CardContent>
        </Card>

        {/* 相关文章 */}
        {relatedBlogs.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                相关文章
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedBlogs.map((relatedBlog) => (
                  <Link key={relatedBlog.id} href={`/blog/${relatedBlog.id}`}>
                    <Card className="hover:shadow-md transition-shadow duration-200 h-full">
                      {relatedBlog.image_url && (
                        <div className="aspect-video overflow-hidden rounded-t-lg">
                          <img
                            src={relatedBlog.image_url}
                            alt={relatedBlog.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader className="p-4">
                        <h3 className="font-semibold text-sm line-clamp-2 hover:text-blue-600 transition-colors">
                          {relatedBlog.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {relatedBlog.summary || `${relatedBlog.content.slice(0, 80)}...`}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(relatedBlog.created_at)}</span>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
