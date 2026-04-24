import Link from 'next/link';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Collection', href: '/collection' },
  { label: 'Blog', href: '/blog' },
];

const supportLinks = [
  { label: 'My Orders', href: '/account/orders' },
  { label: 'Returns', href: '/returns' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

const socialLinks = [
  { icon: 'icon-[mingcute--instagram-line]', href: '#', label: 'Instagram' },
  { icon: 'icon-[mingcute--twitter-x-line]', href: '#', label: 'Twitter' },
  { icon: 'icon-[mingcute--youtube-line]', href: '#', label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className='relative bg-foreground text-background overflow-hidden'>
      <div className='absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent' />

      <div className='max-w-7xl mx-auto px-6 py-16 lg:py-20'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-14 border-b border-white/10'>
          <div className='lg:col-span-2 flex flex-col gap-5'>
            <div className='flex items-baseline gap-0.5'>
              <span className='text-3xl font-medium tracking-tight'>HearHouse</span>
              <span className='text-teal-500 text-3xl leading-none'>.</span>
            </div>
            <p className='text-sm text-white/45 leading-relaxed max-w-sm'>
              Premium audio equipment for those who hear the difference. From
              studio monitors to everyday earbuds — your sound, elevated.
            </p>
            <div className='flex gap-3 mt-1'>
              {socialLinks.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className='size-9 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:border-teal-500 hover:text-teal-400 transition-colors duration-200'
                >
                  <span className={`${s.icon} size-[18px]`} />
                </Link>
              ))}
            </div>
          </div>

          <div className='flex flex-col gap-4'>
            <span className='text-[11px] uppercase tracking-[0.15em] text-teal-500 font-medium'>
              Navigation
            </span>
            <ul className='flex flex-col gap-3'>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='text-sm text-white/55 hover:text-white transition-colors duration-200'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className='flex flex-col gap-4'>
            <span className='text-[11px] uppercase tracking-[0.15em] text-teal-500 font-medium'>
              Support
            </span>
            <ul className='flex flex-col gap-3'>
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='text-sm text-white/55 hover:text-white transition-colors duration-200'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-white/25'>
          <span>© 2026 HearHouse. All rights reserved.</span>
          <div className='flex gap-5'>
            <Link
              href='/privacy'
              className='hover:text-white/55 transition-colors duration-200'
            >
              Privacy Policy
            </Link>
            <Link
              href='/terms'
              className='hover:text-white/55 transition-colors duration-200'
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
