// Blog类型定义，与数据库schema保持一致
export interface Blog {
  id: string
  title: string
  content: string
  summary?: string | null
  author: string | null
  created_at: string | null
  updated_at: string | null
  tags: string[] | null
  image_url?: string | null
  is_published: boolean | null
}

// 用于插入新博客的类型
export interface BlogInsert {
  title: string
  content: string
  summary?: string
  author?: string
  tags?: string[]
  image_url?: string
  is_published?: boolean
}

// 用于更新博客的类型
export interface BlogUpdate {
  title?: string
  content?: string
  summary?: string
  author?: string
  tags?: string[]
  image_url?: string
  is_published?: boolean
}
