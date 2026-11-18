'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GotaLogo from '../../components/GotaLogo';

export default function EntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password || undefined }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao iniciar sessao.');

      if (data.user.role === 'admin') router.push('/admin');
      else if (data.user.role === 'empresa') router.push('/empresa');
      else router.push('/cidadao');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = async (userId: string, targetPath: string) => {
    setLoading(true);
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      router.push(targetPath);
    } catch {
      setError('Erro ao alternar para a conta de demonstracao.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="apple-card p-6 sm:p-10 space-y-6">
        <div className="text-center">
          <div className="inline-block mb-3">
            <GotaLogo size="lg" animated />
          </div>
          <h1 className="text-xl font-extrabold text-[#123B5D]">Acesso a Plataforma Gota</h1>
          <p className="text-xs text-[#718493] mt-1">
            Inicia sessao para gerir ocorrencias e acompanhar comunicacoes.
          </p>
        </div>

        {/* Seleccao rapida para avaliacao do prototipo */}
        <div className="p-4 rounded-2xl bg-[#E8F6FA] border border-[#20B8D5]/30 space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#123B5D] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#62D6BE]" />
            <span>Contas de demonstracao para avaliacao</span>
          </div>
          <p className="text-[11px] text-[#718493]">
            Clica numa conta para entrar directamente com as respectivas permissoes:
          </p>

          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => handleDemoSelect('usr_cidadao_1', '/cidadao')}
              className="p-2.5 rounded-xl bg-white text-left border border-[#E1EBF0] hover:border-[#20B8D5] transition-colors flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-[#123B5D]">Joaquim Sitoe</div>
                <div className="text-[10px] text-[#718493]">Cidadao (Comunicacoes e historico)</div>
              </div>
              <span className="text-[10px] bg-sky-50 text-[#20B8D5] font-semibold px-2 py-0.5 rounded-full">
                Cidadao
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSelect('usr_empresa_1', '/empresa')}
              className="p-2.5 rounded-xl bg-white text-left border border-[#E1EBF0] hover:border-[#20B8D5] transition-colors flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-[#123B5D]">Eng. Alberto Munguambe</div>
                <div className="text-[10px] text-[#718493]">FIPAG (Gestao operacional da rede)</div>
              </div>
              <span className="text-[10px] bg-blue-50 text-[#123B5D] font-semibold px-2 py-0.5 rounded-full">
                Empresa
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSelect('usr_admin_1', '/admin')}
              className="p-2.5 rounded-xl bg-white text-left border border-[#E1EBF0] hover:border-[#20B8D5] transition-colors flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-[#123B5D]">Carla Mondlane</div>
                <div className="text-[10px] text-[#718493]">Administracao (Moderacao e auditoria)</div>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                Admin
              </span>
            </button>
          </div>
        </div>

        {/* Formulario de login normal */}
        <form onSubmit={handleLogin} className="space-y-4 pt-2">
          {error && (
            <p className="text-xs text-[#D94848] bg-red-50 p-2.5 rounded-xl border border-red-100">
              {error}
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#123B5D] mb-1">
              Correio Electronico
            </label>
            <input
              type="email"
              required
              placeholder="o-teu-email@exemplo.mz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-[#E1EBF0] focus:outline-hidden focus:border-[#20B8D5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#123B5D] mb-1">
              Senha <span className="text-[#718493] font-normal">(obrigatoria para acesso institucional)</span>
            </label>
            <input
              type="password"
              placeholder="Senha de acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full text-xs p-3 rounded-xl border border-[#E1EBF0] focus:outline-hidden focus:border-[#20B8D5]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#123B5D] hover:bg-[#0c273e] active:scale-[0.98] text-white font-bold py-3 rounded-full text-xs transition-all shadow-xs"
          >
            {loading ? 'A verificar...' : 'Entrar na Conta'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-[#718493] space-y-2 border-t border-[#E1EBF0]">
          <div>
            Ainda nao tens conta de cidadao?{' '}
            <Link href="/registo" className="text-[#20B8D5] font-semibold hover:underline">
              Regista-te aqui
            </Link>
          </div>
          <div>
            Representas uma empresa de abastecimento?{' '}
            <Link href="/registo-empresa" className="text-[#123B5D] font-semibold hover:underline">
              Registo institucional
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
