import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, User, ArrowRight } from 'lucide-react'
import { APP_NAME, ROUTES } from '@/lib/constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: `Blog - ${APP_NAME}`,
  description: 'Tin tức, review và bài viết về phim ảnh',
}

// Mock blog posts - In production, this would come from a CMS or API
const blogPosts = [
  {
    id: '1',
    slug: 'top-10-phim-hay-nhat-2024',
    title: 'Top 10 Phim Hay Nhất 2024',
    excerpt: 'Điểm qua những bộ phim đáng xem nhất trong năm 2024, từ phim hành động đến phim tâm lý.',
    image: '/blog/post-1.jpg',
    author: 'Admin',
    date: '2024-01-15',
    category: 'Tổng hợp',
    readTime: '5 phút đọc',
  },
  {
    id: '2',
    slug: 'review-avatar-2-dong-chay-cua-nuoc',
    title: 'Review Avatar 2: Dòng Chảy Của Nước',
    excerpt: 'James Cameron trở lại với phần tiếp theo hoành tráng của Avatar sau 13 năm chờ đợi.',
    image: '/blog/post-2.jpg',
    author: 'Reviewer',
    date: '2024-01-10',
    category: 'Review',
    readTime: '8 phút đọc',
  },
  {
    id: '3',
    slug: 'nhung-bo-phim-marvel-dang-cho-doi-2024',
    title: 'Những Bộ Phim Marvel Đáng Chờ Đợi 2024',
    excerpt: 'Lịch chiếu và thông tin về các bộ phim Marvel sẽ ra mắt trong năm 2024.',
    image: '/blog/post-3.jpg',
    author: 'Admin',
    date: '2024-01-05',
    category: 'Tin tức',
    readTime: '6 phút đọc',
  },
  {
    id: '4',
    slug: 'bi-kip-xem-phim-chat-luong-cao',
    title: 'Bí Kíp Xem Phim Chất Lượng Cao Tại Nhà',
    excerpt: 'Hướng dẫn tối ưu hóa trải nghiệm xem phim tại nhà với các thiết bị phổ biến.',
    image: '/blog/post-4.jpg',
    author: 'Tech Expert',
    date: '2024-01-01',
    category: 'Hướng dẫn',
    readTime: '10 phút đọc',
  },
]

export default function BlogPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Blog</h1>
        <p className="text-muted-foreground">
          Tin tức, review và bài viết về phim ảnh
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <Link
            key={post.id}
            href={ROUTES.BLOG_POST(post.slug)}
            className="group"
          >
            <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <div className="aspect-video relative overflow-hidden bg-muted">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <span className="text-sm">Image placeholder</span>
                </div>
                <Badge className="absolute top-4 left-4 z-20">
                  {post.category}
                </Badge>
              </div>
              
              <CardHeader>
                <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.date).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {post.readTime}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
