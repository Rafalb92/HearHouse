import { IconButton as HeaderIconButton } from '@/components/ui/icon-button';
import { UserDropdown } from './user-dropdown';
import { CartButton } from '../cart/cart-button';

type HeaderAction = {
  icon: string;
  label: string;
  href?: string;
  onClick?: () => void;
};

// User button celowo wyłączony z tej tablicy – obsługuje go UserDropdown
const actions: HeaderAction[] = [
  { icon: 'icon-[mingcute--search-3-line]', label: 'Search' },
];

type HeaderRightProps = {
  className?: string;
};

export function HeaderRight({ className }: HeaderRightProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {actions.map((a) => (
        <HeaderIconButton
          key={a.label}
          iconName={a.icon}
          label={a.label}
          href={a.href}
          onClick={a.onClick}
        />
      ))}
      <CartButton />
      <UserDropdown />
    </div>
  );
}
