import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, User, Clock, ArrowLeft } from 'lucide-react'
import { APP_NAME, ROUTES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

// Mock blog post data
const blogPosts: Record<string, any> = {
  'top-10-phim-hay-nhat-2024': {
    title: 'Top 10 Phim Hay Nhất 2024',
    excerpt: 'Điểm qua những bộ phim đáng xem nhất trong năm 2024',
    content: `
      <p>Năm 2024 đã mang đến cho khán giả yêu phim rất nhiều tác phẩm xuất sắc từ nhiều thể loại khác nhau. Dưới đây là top 10 bộ phim hay nhất năm theo đánh giá của Cineverse.</p>
      
      <h2>1. Avatar 2: Dòng Chảy Của Nước</h2>
      <p>James Cameron trở lại với phần tiếp theo hoành tráng sau 13 năm. Bộ phim tiếp tục câu chuyện của Jake Sully và gia đình trên hành tinh Pandora với những công nghệ CGI đột phá.</p>
      
      <h2>2. Oppenheimer</h2>
      <p>Christopher Nolan mang đến một tác phẩm sử thi về J. Robert Oppenheimer, người cha đẻ của bom nguyên tử. Diễn xuất xuất sắc của Cillian Murphy và đạo diễn tài ba đã tạo nên một kiệt tác điện ảnh.</p>
      
      <h2>3. Guardians of the Galaxy Vol. 3</h2>
      <p>James Gunn kết thúc trilogy Guardians với một câu chuyện cảm động về gia đình và sự hy sinh. Đây là một trong những bộ phim Marvel xuất sắc nhất.</p>
      
      <p class="text-muted-foreground italic mt-6">Bài viết sẽ được cập nhật thêm nội dung...</p>
    `,
    author: 'Admin',
    date: '2024-01-15',
    category: 'Tổng hợp',
    readTime: '5 phút đọc',
  },
  'review-avatar-2-dong-chay-cua-nuoc': {
    title: 'Review Avatar 2: Dòng Chảy Của Nước',
    excerpt: 'James Cameron trở lại với phần tiếp theo hoành tráng của Avatar',
    content: `
      <p>Sau 13 năm chờ đợi, James Cameron cuối cùng cũng mang đến cho khán giả phần tiếp theo của Avatar - một trong những bộ phim ăn khách nhất mọi thời đại.</p>
      
      <h2>Cốt truyện</h2>
      <p>Avatar 2 tiếp tục câu chuyện của Jake Sully và Neytiri, giờ đây đã có gia đình riêng trên hành tinh Pandora. Khi con người quay trở lại đe dọa, gia đình họ buộc phải tìm đến sự trú ẩn của bộ tộc Metkayina sống ở biển.</p>
      
      <h2>Công nghệ CGI đột phá</h2>
      <p>Điểm nổi bật nhất của Avatar 2 chính là công nghệ CGI đỉnh cao. Những cảnh quay dưới nước được thực hiện hoàn hảo, tạo nên một thế giới biển cả huyền ảo và sống động.</p>
      
      <h2>Đánh giá</h2>
      <p>Mặc dù kéo dài hơn 3 tiếng, Avatar 2 vẫn giữ được sự hấp dẫn nhờ hình ảnh tuyệt đẹp và câu chuyện cảm động về gia đình. Đây là một bộ phim đáng xem trên màn hình lớn.</p>
      
      <p><strong>Điểm số: 9/10</strong></p>
    `,
    author: 'Reviewer',
    date: '2024-01-10',
    category: 'Review',
    readTime: '8 phút đọc',
  },
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts[slug]

  if (!post) {
    return {
      title: 'Không tìm thấy',
    }
  }

  return {
    title: `${post.title} - ${APP_NAME}`,
    description: post.excerpt,
  }
}

// Separate component for content that needs data fetching
function BlogPostContent({ slug }: { slug: string }) {
  const post = blogPosts[slug]

  if (!post) {
    notFound()
  }

  return (
    <div className="container py-8">
      <Link href={ROUTES.BLOG}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại Blog
        </Button>
      </Link>

      <article className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Badge className="mb-4">{post.category}</Badge>
          <h1 className="mb-4 text-4xl font-bold">{post.title}</h1>

          <div className="text-muted-foreground flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(post.date).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{post.readTime}</span>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div
          className="prose prose-slate dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  )
}

// Wrapper to handle async params
async function BlogPostWrapper({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <BlogPostContent slug={slug} />
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  return (
    <Suspense
      fallback={
        <div className="container py-8">
          <LoadingSpinner className="h-96" />
        </div>
      }
    >
      <BlogPostWrapper params={params} />
    </Suspense>
  )
}
