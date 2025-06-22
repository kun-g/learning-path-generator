import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 定义Blog类型
export interface Blog {
  id: string
  title: string
  content: string
  summary?: string
  author: string
  created_at: string
  updated_at: string
  tags: string[]
  image_url?: string
  is_published: boolean
}

// Blog相关的数据库操作
export const blogService = {
  // 获取所有已发布的博客文章
  async getPublishedBlogs(): Promise<Blog[]> {
    try {
      const response = await fetch('/api/blogs')
      if (!response.ok) {
        throw new Error('Failed to fetch blogs')
      }
      const blogs = await response.json()
      return blogs.filter((blog: Blog) => blog.is_published)
        .sort((a: Blog, b: Blog) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (error) {
      console.error('Error fetching blogs:', error)
      throw error
    }
  },

  // 根据ID获取单篇博客文章
  async getBlogById(id: string): Promise<Blog | null> {
    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        return null
      }

      const blog = await response.json()
      return blog.is_published ? blog : null
    } catch (error) {
      console.error('Error fetching blog:', error)
      return null
    }
  },

  // 根据标签获取博客文章
  async getBlogsByTag(tag: string): Promise<Blog[]> {
    try {
      const blogs = await this.getPublishedBlogs()
      return blogs.filter(blog => blog.tags.includes(tag))
    } catch (error) {
      console.error('Error fetching blogs by tag:', error)
      throw error
    }
  },

  // 搜索博客文章
  async searchBlogs(query: string): Promise<Blog[]> {
    try {
      const blogs = await this.getPublishedBlogs()
      const lowerQuery = query.toLowerCase()
      return blogs.filter(blog =>
        blog.title.toLowerCase().includes(lowerQuery) ||
        blog.content.toLowerCase().includes(lowerQuery) ||
        (blog.summary?.toLowerCase().includes(lowerQuery))
      )
    } catch (error) {
      console.error('Error searching blogs:', error)
      throw error
    }
  },

  // 获取所有标签
  async getAllTags(): Promise<string[]> {
    try {
      const blogs = await this.getPublishedBlogs()
      const allTags = blogs.flatMap(blog => blog.tags || [])
      return [...new Set(allTags)].sort()
    } catch (error) {
      console.error('Error fetching tags:', error)
      throw error
    }
  }
}
