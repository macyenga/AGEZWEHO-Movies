import Link from 'next/link';
import Head from 'next/head';
import CinematicBackground from '../components/CinematicBackground';
import { ArrowLeft, Film } from 'lucide-react';

export default function Custom404() {
  return (
    <div className="min-h-screen bg-deep flex items-center justify-center">
      <Head><title>404 — Agezweho Movies</title></Head>
      <CinematicBackground />
      <div className="relative z-10 text-center px-6 max-w-md">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)' }}>
          <Film size={36} style={{ color: '#c9a84c' }} />
        </div>
        <h1 className="font-cinzel text-5xl font-bold mb-3" style={{ fontFamily: 'Cinzel, serif', color: '#c9a84c' }}>404</h1>
        <p className="text-sm mb-6" style={{ color: '#6a6a5a' }}>This page doesn&apos;t exist in our library.</p>
        <Link href="/">
          <span className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm cursor-pointer">
            <ArrowLeft size={14} /> Back to Home
          </span>
        </Link>
      </div>
    </div>
  );
}
