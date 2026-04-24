import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function PasswordInput({
  id,
  show,
  onToggle,
  invalid,
  ...props
}: React.ComponentProps<typeof Input> & {
  show: boolean;
  onToggle: () => void;
  invalid?: boolean;
}) {
  return (
    <div className='relative'>
      <Input
        {...props}
        id={id}
        type={show ? 'text' : 'password'}
        aria-invalid={invalid}
        className={cn('pr-10', props.className)}
      />
      <Button
        type='button'
        variant='ghost'
        size='icon'
        onClick={onToggle}
        tabIndex={-1}
        aria-label={show ? 'Hide password' : 'Show password'}
        className='absolute right-0 top-0 h-full w-10 rounded-l-none text-muted-foreground hover:text-foreground hover:bg-transparent'
      >
        {show ? (
          <span className='icon-[mingcute--eye-2-line] size-4' />
        ) : (
          <span className='icon-[mingcute--eye-close-line] size-4' />
        )}
      </Button>
    </div>
  );
}
