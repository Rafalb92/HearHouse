import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type IconButtonProps = {
  iconName: string;
  label: string; // aria-label
  href?: string; // if navigation is needed instead of action
  onClick?: () => void; // if action is needed instead of navigation
  disabled?: boolean;
};

export function IconButton({
  iconName,
  label,
  href,
  onClick,
  disabled,
}: IconButtonProps) {
  if (href) {
    return (
      <Button
        variant='ghost'
        size='icon-lg'
        asChild
        disabled={disabled}
        aria-label={label}
        className='rounded-full size-10'
      >
        <Link href={href}>
          <span className={cn('size-6', `${iconName}`)} aria-hidden='true' />
          <span className='sr-only'>{label}</span>
        </Link>
      </Button>
    );
  }

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      type='button'
      className='rounded-full size-10'
    >
      <span className={cn('size-6', `${iconName}`)} aria-hidden='true' />
      <span className='sr-only'>{label}</span>
    </Button>
  );
}
