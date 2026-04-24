import Image from 'next/image';
import PresentationCard from './presentation-card';
import ConnectorLine from './connector-line';

const connectors = [
  {
    d: 'M 900 160 L 760 232 L 620 250 L 410 350',
    dot: {
      x: 410,
      y: 350,
      dotRadius: 3,
      ringRadius: 5,
    },
  },
  {
    d: 'M 750 382 L 860 382 L 700 390 L 220 520',
    dot: {
      x: 220,
      y: 520,
      dotRadius: 3,
      ringRadius: 5,
    },
  },
];

export default function PresentationSection() {
  return (
    <section className='w-full h-140 min-h-150 border border-border mb-50 rounded-2xl bg-radial-[at_50%_15%] from-teal-400 via-teal-600 to-teal-800 via-35% to-90% relative overflow-hidden'>
      <Image
        src='/presentation.webp'
        alt='Presentation of the product'
        className='object-center absolute bottom-0 left-0 rounded-2xl w-155 h-auto object-cover z-10'
        width={640}
        height={640}
      />

      <h4 className='absolute bottom-4 right-4 text-white text-xl lg:text-3xl font-medium max-w-lg text-left z-30'>
        At we believe in creating headphones that bring sounds to life
      </h4>

      <div className='absolute top-25 right-35 z-30'>
        <PresentationCard
          title='Bluetooth 6.0'
          description='Advanced connectivity'
          icon='icon-[mingcute--bluetooth-line]'
        />
      </div>

      <div className='absolute top-62.5 right-60 z-30'>
        <PresentationCard
          title='Noise Cancellation'
          description='Immersive sound experience'
          icon='icon-[mingcute--sound-line-fill]'
        />
      </div>

      <svg
        className='pointer-events-none absolute inset-0 z-20 h-full w-full'
        viewBox='0 0 1200 600'
        preserveAspectRatio='none'
      >
        {connectors.map((connector, index) => (
          <ConnectorLine key={index} d={connector.d} dot={connector.dot} />
        ))}
      </svg>
    </section>
  );
}
