import Navbar from '@/components/layout/navbar';
import Navigation from '@/components/layout/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='py-10'>
      <Navbar>
        <Navigation orientation='horizontal' />
      </Navbar>

      {children}
    </div>
  );
}
