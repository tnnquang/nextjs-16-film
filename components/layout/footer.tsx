import Link from 'next/link'
import { Film, Twitter, Facebook, Instagram, Youtube } from 'lucide-react'
import { APP_NAME, ROUTES, SOCIAL_LINKS, FOOTER_LINKS } from '@/lib/constants'

const footerNavigation = {
  main: [
    { name: 'Trang chủ', href: ROUTES.HOME },
    { name: 'Phim', href: ROUTES.MOVIES },
    { name: 'Thể loại', href: ROUTES.CATEGORIES },
    { name: 'Quốc gia', href: ROUTES.COUNTRIES },
    { name: 'Blog', href: ROUTES.BLOG },
  ],
  support: [
    { name: 'Về chúng tôi', href: FOOTER_LINKS.ABOUT },
    { name: 'Liên hệ', href: FOOTER_LINKS.CONTACT },
    { name: 'Chính sách', href: FOOTER_LINKS.PRIVACY },
    { name: 'Điều khoản', href: FOOTER_LINKS.TERMS },
    { name: 'DMCA', href: FOOTER_LINKS.DMCA },
  ],
  company: [
    { name: 'Trang cá nhân', href: ROUTES.PROFILE },
    { name: 'Yêu thích', href: ROUTES.FAVORITES },
    { name: 'Lịch sử', href: ROUTES.WATCH_HISTORY },
    { name: 'Xem sau', href: ROUTES.WATCH_LATER },
    { name: 'Tìm kiếm', href: ROUTES.SEARCH },
  ],
  social: [
    {
      name: 'Facebook',
      href: SOCIAL_LINKS.FACEBOOK,
      icon: Facebook,
    },
    {
      name: 'Instagram',
      href: SOCIAL_LINKS.INSTAGRAM,
      icon: Instagram,
    },
    {
      name: 'Twitter',
      href: SOCIAL_LINKS.TWITTER,
      icon: Twitter,
    },
    {
      name: 'YouTube',
      href: SOCIAL_LINKS.YOUTUBE,
      icon: Youtube,
    },
  ],
}

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4">
        <div className="py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="space-y-4">
              <Link href={ROUTES.HOME} className="flex items-center space-x-2">
                <Film className="text-primary h-8 w-8" />
                <span className="text-xl font-bold">{APP_NAME}</span>
              </Link>
              <p className="text-muted-foreground max-w-xs text-sm">
                Xem phim online chất lượng cao miễn phí. Phim mới, phim hot, phim chiếu rạp cập nhật
                liên tục.
              </p>
              <div className="flex space-x-4">
                {footerNavigation.social.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span className="sr-only">{item.name}</span>
                    <item.icon className="h-5 w-5" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="mb-4 text-sm font-semibold">Điều hướng</h3>
              <ul className="space-y-2">
                {footerNavigation.main.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-primary text-sm transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="mb-4 text-sm font-semibold">Hỗ trợ</h3>
              <ul className="space-y-2">
                {footerNavigation.support.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-primary text-sm transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="mb-4 text-sm font-semibold">Tài khoản</h3>
              <ul className="space-y-2">
                {footerNavigation.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-primary text-sm transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t py-6">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-muted-foreground text-sm">
              © 2025 {APP_NAME}. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <Link
                href={FOOTER_LINKS.PRIVACY}
                className="text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Chính sách
              </Link>
              <Link
                href={FOOTER_LINKS.TERMS}
                className="text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                Điều khoản
              </Link>
              <Link
                href={FOOTER_LINKS.DMCA}
                className="text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                DMCA
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
