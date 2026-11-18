'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import InteractiveMap from '../../components/InteractiveMap';
import Badge from '../../components/Badge';
import { Occurrence } from '../../types';

const COMMON_NEIGHBORHOODS = [
  'Polana Caniço B',
  'Maxaquene',
  'Bairro Central',
  'Zimpeto',
  'Sommerschield',
  'Chamanculo',
  'Machava',
  'Matola C',
];

export default function MapaPage() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'mapa' | 'lista'>('mapa');
  const [selectedOcc, setSelectedOcc] = useState<Occurrence | null>(null);

  // Filtros
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [searchFilter, setSearchFilter] = useState<string>('');

  useEffect(() => {
    async function loadOccurrences() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (statusFilter !== 'todos') query.append('status', statusFilter);
        if (typeFilter !== 'todos') query.append('type', typeFilter);
        if (neighborhoodFilter !== 'todos') query.append('neighborhood', neighborhoodFilter);
        if (searchFilter.trim()) query.append('search', searchFilter.trim());

        const res = await fetch(`/api/occurrences?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          const list: Occurrence[] = data.occurrences || [];
          setOccurrences(list);
          if (list.length > 0) {
            setSelectedOcc((prev) => {
              if (prev && list.some((o) => o.id === prev.id)) {
                return list.find((o) => o.id === prev.id) || list[0];
              }
              return list[0];
            });
          } else {
            setSelectedOcc(null);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar mapa:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOccurrences();
  }, [neighborhoodFilter, statusFilter, typeFilter, searchFilter]);

  const handleClearFilters = () => {
    setNeighborhoodFilter('todos');
    setStatusFilter('todos');
    setTypeFilter('todos');
    setSearchFilter('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-4">
      {/* Barra de Titulo e Alternancia de Vista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#123B5D]">
            Mapa de Fugas de Água
          </h1>
          <p className="text-xs text-[#718493]">
            Localização e estado das ocorrências comunicadas nas zonas urbanas de Moçambique.
          </p>
        </div>

        {/* Botao de alternancia Mapa ou Lista */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex rounded-xl bg-slate-200/70 p-1 text-xs">
            <button
              onClick={() => setViewMode('mapa')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'mapa'
                  ? 'bg-white text-[#123B5D] shadow-xs'
                  : 'text-[#718493] hover:text-[#243746]'
              }`}
            >
              Vista de Mapa
            </button>
            <button
              onClick={() => setViewMode('lista')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === 'lista'
                  ? 'bg-white text-[#123B5D] shadow-xs'
                  : 'text-[#718493] hover:text-[#243746]'
              }`}
            >
              Vista de Lista
            </button>
          </div>

          <Link
            href="/comunicar"
            className="bg-[#20B8D5] hover:bg-[#19a1bb] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-2xs"
          >
            + Comunicar Fuga
          </Link>
        </div>
      </div>

      {/* Barra de Filtros Avancada */}
      <div className="apple-card p-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2.5 items-center">
          {/* Filtro por Bairro (Selector Principal) */}
          <div className="min-w-[170px] flex-1 sm:flex-none">
            <select
              value={neighborhoodFilter}
              onChange={(e) => setNeighborhoodFilter(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border border-[#E1EBF0] bg-white text-[#123B5D] font-semibold focus:outline-hidden focus:border-[#20B8D5]"
            >
              <option value="todos">Todos os bairros</option>
              {COMMON_NEIGHBORHOODS.map((bairro) => (
                <option key={bairro} value={bairro}>
                  {bairro}
                </option>
              ))}
            </select>
          </div>

          {/* Pesquisa por texto livre */}
          <div className="relative flex-1 min-w-[200px]">
            <svg
              className="w-4 h-4 text-[#718493] absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Pesquisar por código, rua ou detalhe..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-[#E1EBF0] focus:outline-hidden focus:border-[#20B8D5]"
            />
          </div>

          {/* Filtro de Estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-[#E1EBF0] bg-white text-[#243746] focus:outline-hidden focus:border-[#20B8D5]"
          >
            <option value="todos">Todos os estados</option>
            <option value="recebida">Recebida</option>
            <option value="em_analise">Em analise</option>
            <option value="em_resolucao">Em resolucao</option>
            <option value="intervencao_programada">Intervencao programada</option>
            <option value="resolvida">Resolvida</option>
          </select>

          {/* Filtro de Tipo */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-[#E1EBF0] bg-white text-[#243746] focus:outline-hidden focus:border-[#20B8D5]"
          >
            <option value="todos">Todos os tipos</option>
            <option value="tubagem_rompida">Tubagem rompida</option>
            <option value="fuga_visivel">Fuga visivel</option>
            <option value="agua_alagar_via">Agua a alagar via</option>
            <option value="fuga_residencia">Fuga junto a residencia</option>
            <option value="fuga_subterranea">Fuga subterranea</option>
          </select>

          {/* Botao de Limpeza se houver filtro activo */}
          {(neighborhoodFilter !== 'todos' ||
            statusFilter !== 'todos' ||
            typeFilter !== 'todos' ||
            searchFilter) && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-[#20B8D5] hover:text-[#123B5D] font-semibold underline px-2 py-1"
            >
              Limpar filtros
            </button>
          )}

          <span className="text-xs text-[#718493] ml-auto font-medium">
            {occurrences.length} {occurrences.length === 1 ? 'ocorrencia' : 'ocorrencias'}
          </span>
        </div>

        {/* Atalhos rapidos de Bairro (Pills / Chips) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 no-scrollbar">
          <span className="text-[11px] text-[#718493] font-semibold mr-1 shrink-0">
            Filtrar rápido:
          </span>
          <button
            onClick={() => setNeighborhoodFilter('todos')}
            className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all shrink-0 ${
              neighborhoodFilter === 'todos'
                ? 'bg-[#123B5D] text-white shadow-2xs'
                : 'bg-slate-100 text-[#718493] hover:bg-slate-200'
            }`}
          >
            Todos
          </button>
          {COMMON_NEIGHBORHOODS.map((bairro) => (
            <button
              key={bairro}
              onClick={() => setNeighborhoodFilter(bairro)}
              className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all shrink-0 ${
                neighborhoodFilter === bairro
                  ? 'bg-[#20B8D5] text-white shadow-2xs'
                  : 'bg-slate-100 text-[#718493] hover:bg-slate-200'
              }`}
            >
              {bairro}
            </button>
          ))}
        </div>
      </div>

      {/* Conteudo Principal: Mapa ou Lista */}
      {viewMode === 'mapa' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <InteractiveMap
              occurrences={occurrences}
              height="540px"
              selectedOccurrenceId={selectedOcc?.id}
              onOccurrenceSelect={(occ) => setSelectedOcc(occ)}
            />

            {occurrences.length === 0 && !loading && (
              <div className="mt-3 p-4 bg-[#F5FAFC] border border-[#E1EBF0] rounded-2xl text-center">
                <p className="text-xs text-[#123B5D] font-bold">
                  Nenhuma ocorrencia encontrada para o filtro seleccionado.
                </p>
                <p className="text-[11px] text-[#718493] mt-0.5">
                  Tenta seleccionar outro bairro ou limpar os filtros de pesquisa.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-2 text-xs bg-[#20B8D5] text-white font-bold px-3 py-1.5 rounded-xl hover:bg-[#19a1bb] transition-colors"
                >
                  Restaurar todos os bairros
                </button>
              </div>
            )}
          </div>

          {/* Painel lateral de detalhes da ocorrencia seleccionada */}
          <div className="apple-card p-6 flex flex-col justify-between">
            {selectedOcc ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#123B5D]">
                    {selectedOcc.code}
                  </span>
                  <Badge type="status" value={selectedOcc.status} size="sm" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#123B5D]">{selectedOcc.typeLabel}</h3>
                  <p className="text-xs text-[#718493] mt-0.5 font-medium">
                    {selectedOcc.location.neighborhood}, {selectedOcc.location.city}
                  </p>
                  {selectedOcc.location.street && (
                    <p className="text-[11px] text-[#718493]">{selectedOcc.location.street}</p>
                  )}
                </div>

                {selectedOcc.photos.length > 0 && (
                  <div className="h-36 rounded-xl overflow-hidden border border-[#E1EBF0] bg-slate-50">
                    <img
                      src={selectedOcc.photos[0]}
                      alt="Foto da ocorrencia"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="text-xs text-[#243746] leading-relaxed bg-[#F5FAFC] p-3 rounded-xl border border-[#E1EBF0]">
                  {selectedOcc.description || 'Sem descricao detalhada inserida.'}
                </div>

                <div className="text-[11px] text-[#718493] space-y-1.5 pt-1">
                  <div className="flex justify-between items-center">
                    <span>Prioridade:</span>
                    <Badge type="priority" value={selectedOcc.priority} size="sm" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Entidade responsavel:</span>
                    <span className="font-semibold text-[#123B5D]">
                      {selectedOcc.assignedCompanyName || 'Pendente de atribuicao'}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/ocorrencias/${selectedOcc.id}`}
                  className="block text-center bg-[#123B5D] hover:bg-[#0c273e] text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-2xs"
                >
                  Ver Ficha e Cronologia Completa
                </Link>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#718493]">
                <svg
                  className="w-10 h-10 text-slate-300 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                <p className="text-xs font-medium text-[#243746]">Nenhuma ocorrencia seleccionada</p>
                <p className="text-[11px] mt-1 text-[#718493]">
                  Toca num marcador no mapa para ver a informacao detalhada aqui.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Vista de Lista */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {occurrences.map((occ) => (
            <Link
              key={occ.id}
              href={`/ocorrencias/${occ.id}`}
              className="group bg-white p-5 rounded-2xl border border-[#E1EBF0] hover:border-[#20B8D5] transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-[#123B5D]">{occ.code}</span>
                  <Badge type="status" value={occ.status} size="sm" />
                </div>

                <h3 className="font-bold text-sm text-[#123B5D] group-hover:text-[#20B8D5] transition-colors mb-1">
                  {occ.typeLabel}
                </h3>

                <p className="text-xs text-[#718493] mb-3">
                  {occ.location.neighborhood}, {occ.location.city}
                </p>

                {occ.description && (
                  <p className="text-xs text-[#243746] line-clamp-2 mb-4 leading-relaxed">
                    {occ.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#E1EBF0] flex items-center justify-between text-[11px]">
                <Badge type="priority" value={occ.priority} size="sm" />
                <span className="text-[#718493]">
                  {new Date(occ.reportedAt).toLocaleDateString('pt-PT')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
