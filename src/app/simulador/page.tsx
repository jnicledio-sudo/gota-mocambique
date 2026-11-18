'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

interface DeviceModel {
  name: string;
  width: number;
  height: number;
  scale: number;
  radius: string;
}

const DEVICES: Record<string, DeviceModel> = {
  iphone16: {
    name: 'iPhone 16 Pro',
    width: 393,
    height: 852,
    scale: 0.95,
    radius: '52px',
  },
  samsung: {
    name: 'Samsung Galaxy S24',
    width: 360,
    height: 780,
    scale: 0.98,
    radius: '42px',
  },
  iphonese: {
    name: 'iPhone SE',
    width: 375,
    height: 667,
    scale: 1,
    radius: '36px',
  },
};

export default function SimuladorPage() {
  const [selectedDevice, setSelectedDevice] = useState<string>('iphone16');
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [zoom, setZoom] = useState<number>(1);
  const [isRotated, setIsRotated] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const device = DEVICES[selectedDevice];

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    if (iframeRef.current) {
      iframeRef.current.src = path;
    }
  };

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = currentPath;
    }
  };

  const currentWidth = isRotated ? device.height : device.width;
  const currentHeight = isRotated ? device.width : device.height;

  return (
    <div className="min-h-screen bg-[#07131F] text-white flex flex-col font-sans select-none overflow-x-hidden">
      {/* Barra de Controlo do Simulador */}
      <header className="bg-[#0C1B2B]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl transition-all"
          >
            <span>&larr;</span>
            <span>Voltar ao Computador</span>
          </Link>

          <div className="h-4 w-px bg-white/20" />

          <span className="text-xs font-bold text-[#62D6BE] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#62D6BE] animate-pulse" />
            Simulador de Telemóvel Gota
          </span>
        </div>

        {/* Botoes de Navegacao Rapida na App */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {[
            { label: 'Início', path: '/' },
            { label: 'Mapa', path: '/mapa' },
            { label: 'Comunicar Fuga', path: '/comunicar' },
            { label: 'Ocorrências', path: '/ocorrencias' },
            { label: 'Painel Cidadão', path: '/cidadao' },
            { label: 'Painel FIPAG', path: '/empresa' },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                currentPath === item.path
                  ? 'bg-[#20B8D5] text-white font-bold'
                  : 'bg-white/5 text-slate-300 hover:bg-white/15 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Ferramentas de Controlo de Ecrã */}
        <div className="flex items-center gap-2">
          {/* Selector de Dispositivo */}
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="text-xs bg-white/10 text-white border border-white/15 rounded-xl px-2.5 py-1.5 focus:outline-hidden"
          >
            <option value="iphone16" className="bg-[#0C1B2B] text-white">iPhone 16 Pro</option>
            <option value="samsung" className="bg-[#0C1B2B] text-white">Samsung Galaxy S24</option>
            <option value="iphonese" className="bg-[#0C1B2B] text-white">iPhone SE</option>
          </select>

          {/* Rodar Ecrã */}
          <button
            onClick={() => setIsRotated(!isRotated)}
            title="Rodar ecrã (Retrato / Paisagem)"
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all text-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Recarregar */}
          <button
            onClick={handleReload}
            title="Recarregar ecrã do telemóvel"
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all text-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Ajustar Zoom */}
          <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-xl text-xs">
            <button
              onClick={() => setZoom(Math.max(0.75, zoom - 0.1))}
              className="px-2 py-0.5 hover:bg-white/20 rounded-lg text-slate-300"
            >
              -
            </button>
            <span className="text-[11px] font-mono px-1">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(1.2, zoom + 0.1))}
              className="px-2 py-0.5 hover:bg-white/20 rounded-lg text-slate-300"
            >
              +
            </button>
          </div>
        </div>
      </header>

      {/* Espaco Central com a Moldura Fisica do Telemovel */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-auto">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center top',
            transition: 'transform 0.2s ease, width 0.3s ease, height 0.3s ease',
          }}
          className="relative my-4"
        >
          {/* Carcaca Externa do Telemovel (Titanium Apple Style) */}
          <div
            style={{
              width: `${currentWidth + 24}px`,
              height: `${currentHeight + 24}px`,
              borderRadius: device.radius,
            }}
            className="relative bg-[#1A2633] p-[12px] shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_0_2px_#344759,0_0_0_6px_#141D26] transition-all"
          >
            {/* Botoes Fisicos Laterais Simulados */}
            {!isRotated && (
              <>
                {/* Botao de Silenciamento / Action Button */}
                <div className="absolute -left-[5px] top-[100px] w-[5px] h-[28px] bg-[#3B4D5E] rounded-l-md" />
                {/* Volume Mais */}
                <div className="absolute -left-[5px] top-[145px] w-[5px] h-[48px] bg-[#3B4D5E] rounded-l-md" />
                {/* Volume Menos */}
                <div className="absolute -left-[5px] top-[205px] w-[5px] h-[48px] bg-[#3B4D5E] rounded-l-md" />
                {/* Botao de Ligar / Desligar */}
                <div className="absolute -right-[5px] top-[160px] w-[5px] h-[64px] bg-[#3B4D5E] rounded-r-md" />
              </>
            )}

            {/* Ecra Interno com Dynamic Island */}
            <div
              style={{
                width: `${currentWidth}px`,
                height: `${currentHeight}px`,
                borderRadius: `calc(${device.radius} - 12px)`,
              }}
              className="relative overflow-hidden bg-white shadow-inner flex flex-col"
            >
              {/* Barra de Estado do Telemovel (Status Bar) */}
              <div className="absolute top-0 left-0 right-0 h-11 z-30 flex items-center justify-between px-7 pointer-events-none text-black select-none text-[12px] font-semibold">
                <span>09:41</span>

                {/* Ilha Dinamica (Dynamic Island) */}
                {!isRotated && selectedDevice === 'iphone16' && (
                  <div className="w-[108px] h-[28px] bg-black rounded-full flex items-center justify-end px-3 shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A] mr-1" />
                    <div className="w-2 h-2 rounded-full bg-[#0D2137] border border-[#20B8D5]/60 animate-pulse" />
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-[11px]">
                  <span>5G</span>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 22l7.03-4.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z" />
                  </svg>
                  <div className="w-5 h-2.5 rounded-xs border border-current p-0.5 flex items-center">
                    <div className="w-full h-full bg-current rounded-xs" />
                  </div>
                </div>
              </div>

              {/* Iframe que Carrega a Plataforma Gota ao Vivo */}
              <iframe
                ref={iframeRef}
                src={currentPath}
                title="Plataforma Gota Telemovel"
                className="w-full h-full border-0 pt-7 pb-4 bg-white"
                style={{ width: `${currentWidth}px`, height: `${currentHeight}px` }}
              />

              {/* Barra de Inicio do iPhone (Home Indicator) */}
              {!isRotated && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/30 rounded-full pointer-events-none z-30" />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Rodape Informativo */}
      <footer className="bg-[#0C1B2B] border-t border-white/10 px-4 py-2.5 text-center text-xs text-slate-400">
        Podes navegar, testar os botões, clicar no mapa e registar ocorrências directamente dentro da moldura do telemóvel.
      </footer>
    </div>
  );
}
