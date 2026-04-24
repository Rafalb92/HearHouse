import { cn } from '@/lib/utils';
import Link from 'next/link';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Collection', href: '/products' },
  { label: 'Blog', href: '/blog' },
];

type Props = {
  orientation: 'horizontal' | 'vertical';
};

const Navigation = ({ orientation }: Props) => {
  return (
    <nav className='hidden md:block'>
      <ul
        className={cn(
          'flex gap-4',
          orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        )}
      >
        {navLinks.map((link) => (
          <li key={link.href} className='text-xl '>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
