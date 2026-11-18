'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import GotaLogo from './GotaLogo';
import { User } from '../types';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const switchDemoUser = async (userId: string | null) => {
    if (!userId) {
      await fetch('/api/auth', { method: 'DELETE' });
      setCurrentUser(null);
      router.push('/');
    } else {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      await fetchUser();
      if (userId === 'usr_cidadao_1') router.push('/cidadao');
      else if (userId === 'usr_empresa_1') router.push('/empresa');
      else if (userId === 'usr_admin_1') router.push('/admin');
    }
  };

  const getProfileLink = () => {
    if (!currentUser) return '/entrar';
    if (currentUser.role === 'admin') return '/admin';
    if (currentUser.role === 'empresa') return '/empresa';
    return '/cidadao';
  };

  const getProfileLabel = () => {
    if (!currentUser) return 'Entrar';
    if (currentUser.role === 'admin') return 'Admin';
    if (currentUser.role === 'empresa') return 'Empresa';
    return 'Perfil';
  };

  if (pathname === '/simulador') {
    return null;
  }

  return (
    <>
      {/* Barra de atalho estilo Apple Menu para testes rápidos */}
      <div className="bg-[#123B5D] text-white text-[11px] py-1.5 px-4 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#62D6BE] inline-block shadow-[0_0_8px_#62D6BE]" />
            <span className="font-medium tracking-tight">Protótipo funcional Gota, Moçambique</span>
            <Link
              href="/simulador"
              className="ml-2 inline-flex items-center gap-1 bg-[#20B8D5]/20 hover:bg-[#20B8D5]/35 text-[#62D6BE] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#20B8D5]/40 transition-colors"
            >
              <span>📱 Modo Telemóvel</span>
            </Link>
          </div>

          <div className="flex items-center gap-1.5 bg-black/20 p-0.5 rounded-full px-2 border border-white/10">
            <span className="text-white/60 text-[10px] hidden sm:inline mr-1">Perfil de teste:</span>
            <button
              onClick={() => switchDemoUser('usr_cidadao_1')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                currentUser?.id === 'usr_cidadao_1'
                  ? 'bg-[#20B8D5] text-white shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Cidadão
            </button>
            <button
              onClick={() => switchDemoUser('usr_empresa_1')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                currentUser?.id === 'usr_empresa_1'
                  ? 'bg-[#20B8D5] text-white shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              FIPAG
            </button>
            <button
              onClick={() => switchDemoUser('usr_admin_1')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                currentUser?.id === 'usr_admin_1'
                  ? 'bg-[#20B8D5] text-white shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Admin
            </button>
            {currentUser && (
              <button
                onClick={() => switchDemoUser(null)}
                className="text-[10px] text-red-300 hover:text-red-200 ml-1.5 underline"
              >
                Terminar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navegação de topo com vidro translúcido Apple (Frosted Glass) */}
      <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-2xl border-b border-black/[0.05] transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-95">
            <GotaLogo size="sm" animated={false} />
          </Link>

          {/* Links para ecrãs médios e grandes */}
          <nav className="hidden md:flex items-center gap-1 bg-black/[0.03] p-1 rounded-full border border-black/[0.04]">
            <Link
              href="/"
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                pathname === '/'
                  ? 'bg-white text-[#123B5D] shadow-xs font-semibold'
                  : 'text-[#667085] hover:text-[#123B5D]'
              }`}
            >
              Início
            </Link>
            <Link
              href="/mapa"
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                pathname === '/mapa'
                  ? 'bg-white text-[#123B5D] shadow-xs font-semibold'
                  : 'text-[#667085] hover:text-[#123B5D]'
              }`}
            >
              Mapa
            </Link>
            <Link
              href="/ocorrencias"
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                pathname.startsWith('/ocorrencias')
                  ? 'bg-white text-[#123B5D] shadow-xs font-semibold'
                  : 'text-[#667085] hover:text-[#123B5D]'
              }`}
            >
              Ocorrências
            </Link>
            <Link
              href="/registo-empresa"
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                pathname === '/registo-empresa'
                  ? 'bg-white text-[#123B5D] shadow-xs font-semibold'
                  : 'text-[#667085] hover:text-[#123B5D]'
              }`}
            >
              Empresas
            </Link>
          </nav>

          {/* Botões de acção à direita */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/comunicar"
              className="apple-btn-primary text-xs sm:text-sm px-4 sm:px-5 py-2 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>Comunicar fuga</span>
            </Link>

            <Link
              href={getProfileLink()}
              className="apple-btn-secondary text-xs px-3.5 py-2 hidden sm:inline-flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-[#20B8D5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>{currentUser ? currentUser.name.split(' ')[0] : 'Entrar'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Navegação móvel flutuante estilo Apple Floating Dock (iOS) */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 pointer-events-none">
        <nav className="pointer-events-auto max-w-sm mx-auto bg-white/85 backdrop-blur-2xl border border-white/60 shadow-[0_12px_40px_rgba(0,0,0,0.14)] rounded-full px-3 py-1.5 flex items-center justify-around">
          <Link
            href="/"
            className={`flex flex-col items-center py-1 px-2.5 rounded-full text-[10px] font-medium transition-all ${
              pathname === '/' ? 'text-[#20B8D5] font-bold scale-105' : 'text-[#667085]'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Início
          </Link>

          <Link
            href="/mapa"
            className={`flex flex-col items-center py-1 px-2.5 rounded-full text-[10px] font-medium transition-all ${
              pathname === '/mapa' ? 'text-[#20B8D5] font-bold scale-105' : 'text-[#667085]'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Mapa
          </Link>

          {/* Botão Comunicar em Destaque no Centro */}
          <Link
            href="/comunicar"
            className="flex flex-col items-center -my-3"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#123B5D] to-[#20B8D5] text-white flex items-center justify-center shadow-[0_6px_20px_rgba(32,184,213,0.5)] border-2 border-white transition-transform active:scale-90">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-[9px] font-bold text-[#123B5D] mt-0.5">Comunicar</span>
          </Link>

          <Link
            href="/ocorrencias"
            className={`flex flex-col items-center py-1 px-2.5 rounded-full text-[10px] font-medium transition-all ${
              pathname.startsWith('/ocorrencias') ? 'text-[#20B8D5] font-bold scale-105' : 'text-[#667085]'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Ocorrências
          </Link>

          <Link
            href={getProfileLink()}
            className={`flex flex-col items-center py-1 px-2.5 rounded-full text-[10px] font-medium transition-all ${
              pathname === getProfileLink() ? 'text-[#20B8D5] font-bold scale-105' : 'text-[#667085]'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {getProfileLabel()}
          </Link>
        </nav>
      </div>
    </>
  );
}
