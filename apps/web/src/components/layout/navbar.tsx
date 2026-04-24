'use client';
import { HeaderRight } from './header-right';
import { ReactNode, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { Button } from '../ui/button';
import { Menu } from 'lucide-react';
import Navigation from './navigation';

const Navbar = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <header className='w-full absolute top-0 left-0 right-0 flex items-center md:items-start justify-between py-6 max-w-7xl mx-auto px-2 bg-transparent'>
      {children}

      <div id='logo' className='font-medium md:text-2xl'>
        HearHouse
      </div>

      {/* Desktop */}
      <menu className='flex items-center justify-around'>
        <HeaderRight className='hidden md:flex' />
      </menu>

      {/* Mobile sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className='md:hidden'>
          <Button variant='ghost' size='icon' aria-label='Menu'>
            <Menu className='h-5 w-5' />
          </Button>
        </SheetTrigger>
        <SheetContent side='right' className='w-75 sm:w-100 p-4'>
          <SheetHeader>
            <SheetTitle className='text-left text-xl font-bold'>
              Hear_House.
            </SheetTitle>
          </SheetHeader>
          <div className='flex flex-col gap-6'>
            <nav className='flex flex-col gap-4'>
              <HeaderRight />
            </nav>
            <div className='flex flex-col gap-3 pt-6 border-t'>
              <Navigation orientation='vertical' />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Navbar;
