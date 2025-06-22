'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Calendar, User, ArrowRight } from 'lucide-react';
import { type Blog, blogService } from '@/lib/supabase';

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBlogs();
    loadTags();
  }, []);

  const loadBlogs = async () => {
    try {
      const data = await blogService.getPublishedBlogs();
      setBlogs(data);
      setFilteredBlogs(data);
    } catch (error) {
      console.error('Failed to load blogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const tags = await blogService.getAllTags();
      setAllTags(tags);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredBlogs(selectedTag ? await blogService.getBlogsByTag(selectedTag) : blogs);
    } else {
      try {
        const searchResults = await blogService.searchBlogs(query);
        setFilteredBlogs(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
      }
    }
  };

  const handleTagFilter = async (tag: string) => {
    setSelectedTag(tag === selectedTag ? '' : tag);
    try {
      if (tag === selectedTag) {
        // 取消选择，显示所有博客
        setFilteredBlogs(blogs);
      } else {
        // 选择标签，筛选博客
        const taggedBlogs = await blogService.getBlogsByTag(tag);
        setFilteredBlogs(taggedBlogs);
      }
    } catch (error) {
      console.error('Tag filtering failed:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">加载博客中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">学习资源博客</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            探索高效学习方法，分享项目驱动学习经验，助力你的技能提升之路
          </p>
        </div>

        {/* 搜索和筛选 */}
        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索博客文章..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Link href="/">
              <Button variant="outline">返回首页</Button>
            </Link>
          </div>

          {/* 标签筛选 */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2">标签筛选:</span>
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? 'default' : 'secondary'}
                className="cursor-pointer hover:bg-blue-100"
                onClick={() => handleTagFilter(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* 博客列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <Card key={blog.id} className="hover:shadow-lg transition-shadow duration-300">
              {blog.image_url && (
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={blog.image_url}
                    alt={blog.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex flex-wrap gap-1 mb-2">
                  {blog.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <CardTitle className="line-clamp-2 hover:text-blue-600 transition-colors">
                  <Link href={`/blog/${blog.id}`}>{blog.title}</Link>
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {blog.summary || `${blog.content.slice(0, 100)}...`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{blog.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(blog.created_at)}</span>
                  </div>
                </div>
                <Link href={`/blog/${blog.id}`}>
                  <Button className="w-full group">
                    阅读全文
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 无结果提示 */}
        {filteredBlogs.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">未找到相关文章</h3>
            <p className="text-gray-500">
              {searchQuery ? '尝试使用其他关键词搜索' : '暂时没有文章，请稍后再来查看'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
