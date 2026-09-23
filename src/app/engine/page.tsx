import type { Metadata } from 'next';
import EngineShowcase from '@/components/engine/EngineShowcase';

export const metadata: Metadata = {
  title: 'See the Engine Think | ATLAS AI Neural Trading Engine',
  description:
    'Watch the ATLAS institutional AI trading engine analyze multi-asset order books, compute neural vectors, and execute signals in sub-11ms.',
  openGraph: {
    title: 'See the Engine Think | ATLAS AI Neural Trading Engine',
    description:
      'Real-time neural telemetry, live order flow sweeps, and high-frequency execution demonstrations.',
  },
};

export default function EnginePage() {
  return <EngineShowcase />;
}
