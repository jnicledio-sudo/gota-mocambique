'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Badge from '../../components/Badge';
import { Occurrence } from '../../types';

export default function OcorrenciasPage() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  useEffect(() => {
    async function loadData() {
      try {
        const query = new URLSearchParams();
        if (search) query.append('search', search);
        if (statusFilter !== 'todos') query.append('status', statusFilter);

        const res = await fetch(`/api/occurrences?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setOccurrences(data.occurrences || []);
        }
      } catch (err) {
        console.error('Erro ao carregar lista de ocorrências:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [search, statusFilter]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123B5D]">
            Ocorrências de Fugas de Água
          </h1>
          <p className="text-xs sm:text-sm text-[#718493] mt-1">
            Consulta pública e transparente das denúncias registadas em Moçambique.
          </p>
        </div>

        <Link
          href="/comunicar"
          className="apple-btn-primary text-xs px-5 py-2.5 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Comunicar nova fuga</span>
        </Link>
      </div>

      {/* Filtros e Barra de Pesquisa */}
      <div className="apple-card p-4 flex flex-wrap gap-3 items-center mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="w-4 h-4 text-[#718493] absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Pesquisar por código, bairro ou rua..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-[#E1EBF0] focus:outline-hidden focus:border-[#20B8D5]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs py-2 px-3 rounded-xl border border-[#E1EBF0] bg-white text-[#243746] focus:outline-hidden focus:border-[#20B8D5]"
        >
          <option value="todos">Todos os estados</option>
          <option value="recebida">Recebida</option>
          <option value="em_analise">Em análise</option>
          <option value="encaminhada">Encaminhada</option>
          <option value="intervencao_programada">Intervenção programada</option>
          <option value="em_resolucao">Em resolução</option>
          <option value="resolvida">Resolvida</option>
          <option value="encerrada">Encerrada</option>
        </select>

        <span className="text-xs text-[#718493] ml-auto">
          {occurrences.length} {occurrences.length === 1 ? 'resultado' : 'resultados'}
        </span>
      </div>

      {/* Lista de Cartões */}
      {loading ? (
        <div className="text-center py-12 text-xs text-[#718493]">
          A carregar ocorrências...
        </div>
      ) : occurrences.length === 0 ? (
        <div className="apple-card p-8 text-center">
          <p className="text-sm font-semibold text-[#123B5D]">Nenhuma ocorrência encontrada</p>
          <p className="text-xs text-[#718493] mt-1">
            Tenta ajustar os termos de pesquisa ou remover os filtros aplicados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {occurrences.map((occ) => (
            <Link
              key={occ.id}
              href={`/ocorrencias/${occ.id}`}
              className="apple-card p-5.5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-[#123B5D] bg-[#F5FAFC] px-2 py-0.5 rounded border border-[#E1EBF0]">
                    {occ.code}
                  </span>
                  <Badge type="status" value={occ.status} size="sm" />
                </div>

                <h3 className="font-bold text-sm text-[#123B5D] group-hover:text-[#20B8D5] transition-colors mb-1">
                  {occ.typeLabel}
                </h3>

                <p className="text-xs text-[#718493] flex items-center gap-1 mb-2">
                  <svg className="w-3.5 h-3.5 text-[#20B8D5] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>{occ.location.neighborhood}, {occ.location.city}</span>
                </p>

                {occ.location.street && (
                  <p className="text-[11px] text-[#718493] mb-2">
                    {occ.location.street}
                  </p>
                )}

                {occ.description && (
                  <p className="text-xs text-[#243746] line-clamp-2 mb-3 leading-relaxed">
                    {occ.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#E1EBF0] flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <Badge type="priority" value={occ.priority} size="sm" />
                  {occ.assignedCompanyName && (
                    <span className="text-[#123B5D] font-medium hidden sm:inline">
                      {occ.assignedCompanyName}
                    </span>
                  )}
                </div>
                <span className="text-[#718493]">
                  {new Date(occ.reportedAt).toLocaleDateString('pt-PT', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
