import Navbar from '@/components/layout/navbar';
import Navigation from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar>
        <Navigation orientation='vertical' />
      </Navbar>

      {children}

      <Footer />
    </>
  );
}
