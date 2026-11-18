'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GotaLogo from '../../components/GotaLogo';

export default function RegistoPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, role: 'cidadao' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao criar conta.');

      router.push('/cidadao');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="apple-card p-6 sm:p-10 space-y-6">
        <div className="text-center">
          <div className="inline-block mb-3">
            <GotaLogo size="md" animated />
          </div>
          <h1 className="text-xl font-extrabold text-[#123B5D]">Criar Conta de Cidadão</h1>
          <p className="text-xs text-[#718493] mt-1">
            Regista-te para acompanhar as tuas denúncias de forma organizada.
          </p>
        </div>

        {error && (
          <p className="text-xs text-[#D94848] bg-red-50 p-2.5 rounded-xl border border-red-100">
            {error}
          </p>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#123B5D] mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Alberto Macuácua"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-[#E1EBF0] focus:outline-hidden focus:border-[#20B8D5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#123B5D] mb-1">
              Correio Electrónico *
            </label>
            <input
              type="email"
              required
              placeholder="exemplo@dominio.mz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-[#E1EBF0] focus:outline-hidden focus:border-[#20B8D5]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#123B5D] mb-1">
              Contacto Telefónico (opcional)
            </label>
            <input
              type="tel"
              placeholder="+258 84 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-[#E1EBF0] focus:outline-hidden focus:border-[#20B8D5]"
            />
          </div>

          <div className="text-[11px] text-[#718493] bg-[#F5FAFC] p-3 rounded-xl border border-[#E1EBF0] leading-relaxed">
            Ao criar conta, os teus dados privados não serão tornados públicos. O teu contacto apenas será utilizado caso seja necessário esclarecer a localização de uma fuga.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#20B8D5] hover:bg-[#19a1bb] text-white font-bold py-3 rounded-full text-xs transition-colors shadow-xs"
          >
            {loading ? 'A criar conta...' : 'Concluir Registo'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-[#718493] border-t border-[#E1EBF0]">
          Já tens uma conta?{' '}
          <Link href="/entrar" className="text-[#123B5D] font-semibold hover:underline">
            Inicia sessão
          </Link>
        </div>
      </div>
    </div>
  );
}
