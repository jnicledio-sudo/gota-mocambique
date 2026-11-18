'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Badge from '../../components/Badge';
import InteractiveMap from '../../components/InteractiveMap';
import { Occurrence, User } from '../../types';

export default function CidadaoPainelPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userOccurrences, setUserOccurrences] = useState<Occurrence[]>([]);
  const [allOccurrences, setAllOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [authRes, occRes] = await Promise.all([
          fetch('/api/auth'),
          fetch('/api/occurrences'),
        ]);

        if (!authRes.ok) {
          router.push('/entrar');
          return;
        }

        const authData = await authRes.json();
        if (!authData.user) {
          router.push('/entrar');
          return;
        }

        setCurrentUser(authData.user);

        if (occRes.ok) {
          const occData = await occRes.json();
          const all = occData.occurrences || [];
          setAllOccurrences(all);

          // Filtrar as ocorrências associadas ao utilizador
          const mine = all.filter(
            (o: Occurrence) =>
              o.reporterContact?.userId === authData.user.id ||
              o.reporterContact?.name?.toLowerCase().includes(authData.user.name.toLowerCase())
          );
          setUserOccurrences(mine);
        }
      } catch (err) {
        console.error('Erro ao carregar painel do cidadão:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const activeOccurrences = userOccurrences.filter(
    (o) => o.status !== 'resolvida' && o.status !== 'encerrada' && o.status !== 'rejeitada'
  );

  const resolvedOccurrences = userOccurrences.filter(
    (o) => o.status === 'resolvida' || o.status === 'encerrada'
  );

  const handleDeleteAccount = () => {
    const confirmed = confirm(
      'Tens a certeza de que queres eliminar a tua conta? As tuas comunicações de interesse público permanecerão no sistema de forma anonimizada para histórico de intervenção.'
    );
    if (confirmed) {
      fetch('/api/auth', { method: 'DELETE' }).then(() => router.push('/'));
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-[#718493]">
        A carregar o teu painel de cidadão...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-8">
      {/* Cabeçalho do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#20B8D5] uppercase tracking-wider">
            Painel do Cidadão
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123B5D]">
            Olá, {currentUser?.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#718493] mt-1">
            Aqui podes acompanhar as fugas de água que comunicaste e o estado das reparações.
          </p>
        </div>

        <Link
          href="/comunicar"
          className="apple-btn-primary text-xs px-5 py-2.5 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Comunicar nova fuga</span>
        </Link>
      </div>

      {/* Cartões de Indicadores Úteis */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="apple-card p-5">
          <span className="text-[11px] font-semibold text-[#718493] uppercase tracking-wider block mb-1">
            Total de denúncias
          </span>
          <div className="text-2xl font-black text-[#123B5D]">
            {userOccurrences.length}
          </div>
          <p className="text-[11px] text-[#718493] mt-1">Comunicadas na plataforma</p>
        </div>

        <div className="apple-card p-5">
          <span className="text-[11px] font-semibold text-[#20B8D5] uppercase tracking-wider block mb-1">
            Em acompanhamento
          </span>
          <div className="text-2xl font-black text-[#20B8D5]">
            {activeOccurrences.length}
          </div>
          <p className="text-[11px] text-[#718493] mt-1">A aguardar ou em intervenção</p>
        </div>

        <div className="apple-card p-5">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block mb-1">
            Resolvidas
          </span>
          <div className="text-2xl font-black text-emerald-700">
            {resolvedOccurrences.length}
          </div>
          <p className="text-[11px] text-[#718493] mt-1">Reparações confirmadas</p>
        </div>
      </div>

      {/* As Minhas Denúncias */}
      <div className="apple-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#123B5D]">As Minhas Ocorrências</h2>
          <span className="text-xs text-[#718493]">{userOccurrences.length} registadas</span>
        </div>

        {userOccurrences.length === 0 ? (
          <div className="text-center py-8 bg-[#F5FAFC] rounded-2xl border border-[#E1EBF0] space-y-2">
            <p className="text-xs font-semibold text-[#123B5D]">Ainda não comunicaste nenhuma fuga</p>
            <p className="text-[11px] text-[#718493]">
              Quando vires água potável desperdiçada ou um cano rebentado, clica no botão abaixo.
            </p>
            <div className="pt-2">
              <Link
                href="/comunicar"
                className="inline-block bg-[#20B8D5] text-white font-bold px-4 py-2 rounded-full text-xs shadow-2xs"
              >
                Comunicar a primeira fuga
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#E1EBF0]">
            {userOccurrences.map((occ) => (
              <div
                key={occ.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#123B5D]">{occ.code}</span>
                    <Badge type="status" value={occ.status} size="sm" />
                    <Badge type="priority" value={occ.priority} size="sm" />
                  </div>
                  <h3 className="text-sm font-bold text-[#123B5D]">{occ.typeLabel}</h3>
                  <p className="text-xs text-[#718493] mt-0.5">
                    {occ.location.neighborhood}, {occ.location.city}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-[#718493] hidden sm:inline">
                    {new Date(occ.reportedAt).toLocaleDateString('pt-PT')}
                  </span>
                  <Link
                    href={`/ocorrencias/${occ.id}`}
                    className="bg-[#123B5D] hover:bg-[#0c273e] text-white font-semibold px-4 py-1.5 rounded-full text-xs transition-colors shadow-2xs"
                  >
                    Ver Cronologia
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mapa de Fugas Próximas */}
      <div className="apple-card p-6 sm:p-8 space-y-3">
        <div>
          <h2 className="text-base font-bold text-[#123B5D]">Ocorrências na Tua Cidade</h2>
          <p className="text-xs text-[#718493]">
            Consulta outros problemas comunicados por cidadãos próximos.
          </p>
        </div>
        <InteractiveMap
          occurrences={allOccurrences}
          height="320px"
        />
      </div>

      {/* Definições e Privacidade da Conta */}
      <div className="apple-card p-6 sm:p-8 space-y-3">
        <h2 className="text-sm font-bold text-[#123B5D]">Dados Pessoais e Privacidade</h2>
        <div className="text-xs text-[#718493] space-y-1">
          <div><span className="font-semibold text-[#123B5D]">Nome:</span> {currentUser?.name}</div>
          <div><span className="font-semibold text-[#123B5D]">Correio Electrónico:</span> {currentUser?.email}</div>
          {currentUser?.phone && (
            <div><span className="font-semibold text-[#123B5D]">Telefone:</span> {currentUser?.phone}</div>
          )}
        </div>

        <div className="pt-3 border-t border-[#E1EBF0] flex justify-between items-center">
          <p className="text-[11px] text-[#718493]">
            Em cumprimento das directrizes de protecção de dados, podes encerrar a tua conta a qualquer momento.
          </p>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="text-xs text-[#D94848] hover:underline font-semibold"
          >
            Eliminar conta
          </button>
        </div>
      </div>
    </div>
  );
}
