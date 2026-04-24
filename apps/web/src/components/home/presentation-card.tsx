import { cn } from '@/lib/utils';

type Props = {
  title: string;
  description: string;
  icon: string;
  className?: string;
};

const PresentationCard = ({ title, description, icon, className }: Props) => {
  return (
    <div
      className={cn(
        'w-70 flex items-center justify-start gap-6 pb-4 text-white',
        className,
      )}
    >
      <div className='bg-white size-10 rounded-lg flex items-center justify-center shrink-0'>
        <span className={cn('size-5 text-black', icon)}></span>
      </div>

      <div>
        <span className='block text-sm font-medium'>{title}</span>
        <span className='text-xs text-white/80 leading-5'>{description}</span>
      </div>
    </div>
  );
};

export default PresentationCard;
