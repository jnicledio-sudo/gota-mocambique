'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Badge from '../../../components/Badge';
import InteractiveMap from '../../../components/InteractiveMap';
import { Occurrence, User, OccurrenceStatus } from '../../../types';

function OcorrenciaDetalheContent() {
  const params = useParams();
  const id = params?.id as string;

  const [occurrence, setOccurrence] = useState<Occurrence | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Formulário de actualização técnica (para empresa e admin)
  const [newStatus, setNewStatus] = useState<OccurrenceStatus>('em_resolucao');
  const [techNote, setTechNote] = useState('');
  const [technician, setTechnician] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');

  const loadData = async () => {
    try {
      const [occRes, authRes] = await Promise.all([
        fetch(`/api/occurrences/${id}`),
        fetch('/api/auth'),
      ]);

      if (!occRes.ok) {
        throw new Error('Ocorrência não encontrada.');
      }

      const occData = await occRes.json();
      setOccurrence(occData.occurrence);

      if (authRes.ok) {
        const authData = await authRes.json();
        setCurrentUser(authData.user);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar os dados da ocorrência.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!techNote.trim()) {
      alert('Por favor, indica uma observação ou relatório da acção.');
      return;
    }

    setUpdating(true);
    setUpdateError('');
    setUpdateSuccess('');

    try {
      const res = await fetch(`/api/occurrences/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStatus,
          note: techNote,
          assignedTechnician: technician,
          evidenceUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao actualizar o estado.');
      }

      setOccurrence(data.occurrence);
      setUpdateSuccess('Estado da ocorrência actualizado com sucesso!');
      setTechNote('');
    } catch (err: any) {
      setUpdateError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-xs text-[#718493]">
        A carregar informação da ocorrência...
      </div>
    );
  }

  if (error || !occurrence) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-base font-bold text-[#123B5D] mb-1">Ocorrência não encontrada</h2>
        <p className="text-xs text-[#718493] mb-4">O código ou identificador indicado pode ser inválido.</p>
        <Link
          href="/ocorrencias"
          className="bg-[#20B8D5] text-white font-bold px-4 py-2 rounded-full text-xs"
        >
          Voltar às Ocorrências
        </Link>
      </div>
    );
  }

  const canManage =
    currentUser &&
    (currentUser.role === 'admin' ||
      (currentUser.role === 'empresa' && (!occurrence.assignedCompanyId || currentUser.companyId === occurrence.assignedCompanyId)));

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-6">
      {/* Navegação Superior */}
      <div className="flex items-center justify-between">
        <Link
          href="/ocorrencias"
          className="inline-flex items-center gap-1 text-xs text-[#718493] hover:text-[#20B8D5]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar às ocorrências
        </Link>

        <span className="font-mono text-xs font-bold text-[#123B5D] bg-white px-2.5 py-1 rounded-md border border-[#E1EBF0]">
          {occurrence.code}
        </span>
      </div>

      {/* Cartão de Cabeçalho da Ocorrência */}
      <div className="apple-card p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge type="status" value={occurrence.status} />
              <Badge type="priority" value={occurrence.priority} />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#123B5D]">
              {occurrence.typeLabel}
            </h1>
            <p className="text-xs text-[#718493] mt-1 flex items-center gap-1">
              <svg className="w-4 h-4 text-[#20B8D5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span>
                {occurrence.location.neighborhood}, {occurrence.location.city}
                {occurrence.location.street ? `, ${occurrence.location.street}` : ''}
              </span>
            </p>
          </div>

          <div className="text-right text-[11px] text-[#718493]">
            <div>Registada em:</div>
            <div className="font-semibold text-[#123B5D]">
              {new Date(occurrence.reportedAt).toLocaleDateString('pt-PT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>

        {/* Justificação da Prioridade */}
        <div className="bg-[#F5FAFC] p-3 rounded-xl border border-[#E1EBF0] text-xs text-[#243746]">
          <span className="font-bold text-[#123B5D]">Critério de prioridade: </span>
          {occurrence.priorityReason}
          {occurrence.priorityNeedsConfirmation && (
            <span className="text-[#E5A23C] font-semibold block mt-1">
              (A prioridade necessita de confirmação técnica pela equipa no local).
            </span>
          )}
        </div>

        {/* Descrição e Ponto de Referência */}
        {occurrence.description && (
          <div className="text-xs text-[#243746] leading-relaxed">
            <span className="font-semibold text-[#123B5D] block mb-1">Descrição comunicada:</span>
            {occurrence.description}
          </div>
        )}

        {occurrence.location.referencePoint && (
          <div className="text-xs text-[#718493]">
            <span className="font-semibold text-[#123B5D]">Ponto de referência: </span>
            {occurrence.location.referencePoint}
          </div>
        )}

        {/* Empresa Atribuída */}
        <div className="pt-3 border-t border-[#E1EBF0] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div>
            <span className="text-[#718493]">Entidade responsável da área: </span>
            <span className="font-bold text-[#123B5D]">
              {occurrence.assignedCompanyName || 'Pendente de encaminhamento formal'}
            </span>
          </div>

          {occurrence.assignedTechnician && (
            <div className="text-[11px] text-[#718493]">
              Técnico / Brigada: <span className="font-medium text-[#123B5D]">{occurrence.assignedTechnician}</span>
            </div>
          )}
        </div>
      </div>

      {/* Fotografias Públicas */}
      {occurrence.photos.length > 0 && (
        <div className="apple-card p-6 sm:p-8">
          <h2 className="text-sm font-bold text-[#123B5D] mb-3">Fotografias da Ocorrência</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {occurrence.photos.map((url, i) => (
              <div key={i} className="h-40 rounded-xl overflow-hidden border border-[#E1EBF0]">
                <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mini-mapa da localização exacta */}
      <div className="apple-card p-6 sm:p-8">
        <h2 className="text-sm font-bold text-[#123B5D] mb-3">Localização no Terreno</h2>
        <InteractiveMap
          occurrences={[occurrence]}
          center={[occurrence.location.latitude, occurrence.location.longitude]}
          zoom={15}
          height="260px"
        />
      </div>

      {/* CRONOLOGIA DE INTERVENÇÃO / HISTÓRICO DE ESTADOS */}
      <div className="apple-card p-6 sm:p-8 space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#123B5D]">Cronologia Oficial da Intervenção</h2>
          <p className="text-xs text-[#718493]">
            Histórico verificável de acções registadas pelas entidades responsáveis.
          </p>
        </div>

        <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E1EBF0]">
          {occurrence.history.map((entry, index) => (
            <div key={entry.id} className="relative">
              {/* Ponto indicador */}
              <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-3 border-[#20B8D5]" />

              <div className="bg-[#F5FAFC] p-4 rounded-2xl border border-[#E1EBF0] space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <Badge type="status" value={entry.newStatus} size="sm" />
                  <span className="text-[11px] text-[#718493]">
                    {new Date(entry.timestamp).toLocaleDateString('pt-PT', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-[#243746] font-medium leading-relaxed">
                  {entry.note}
                </p>

                {entry.evidenceUrl && (
                  <div className="mt-2">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1">
                      Comprovativo de reparação anexado:
                    </span>
                    <img
                      src={entry.evidenceUrl}
                      alt="Comprovativo da reparação"
                      className="w-32 h-24 object-cover rounded-lg border border-emerald-200"
                    />
                  </div>
                )}

                <div className="text-[10px] text-[#718493] pt-1">
                  Registado por: <span className="font-semibold text-[#123B5D]">{entry.changedBy}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ÁREA DE GESTÃO DA EMPRESA / ADMIN */}
      {canManage && (
        <div className="apple-card p-6 sm:p-8 space-y-4 border-[#20B8D5]/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#20B8D5]" />
            <h2 className="text-base font-bold text-[#123B5D]">
              Actualização Técnica da Ocorrência ({currentUser.role === 'admin' ? 'Administração' : 'Entidade Operacional'})
            </h2>
          </div>

          {updateSuccess && (
            <p className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              {updateSuccess}
            </p>
          )}

          {updateError && (
            <p className="text-xs text-red-800 bg-red-50 p-3 rounded-xl border border-red-200">
              {updateError}
            </p>
          )}

          <form onSubmit={handleStatusUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#123B5D] mb-1">
                  Novo Estado Oficial
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OccurrenceStatus)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E1EBF0] bg-white text-[#243746]"
                >
                  <option value="em_analise">Em análise</option>
                  <option value="encaminhada">Encaminhada para brigada</option>
                  <option value="intervencao_programada">Intervenção programada</option>
                  <option value="em_resolucao">Em resolução no local</option>
                  <option value="resolvida">Marcada como resolvida</option>
                  <option value="encerrada">Encerrada após verificação</option>
                  <option value="rejeitada">Rejeitada (com justificação)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123B5D] mb-1">
                  Técnico / Brigada no terreno
                </label>
                <input
                  type="text"
                  placeholder="Ex: Brigada 3 (Águas de Maputo)"
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E1EBF0]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#123B5D] mb-1">
                Nota técnica / Descrição da intervenção *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Exemplo: Válvula isolada. Troço de tubagem de 110mm substituído com sucesso..."
                value={techNote}
                onChange={(e) => setTechNote(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#E1EBF0]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#123B5D] mb-1">
                URL da fotografia de comprovativo da reparação (opcional)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#E1EBF0]"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="bg-[#123B5D] hover:bg-[#0c273e] text-white font-bold px-6 py-2.5 rounded-full text-xs transition-colors shadow-xs"
            >
              {updating ? 'A registar actualização...' : 'Registar Actualização na Cronologia'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function OcorrenciaDetalhePage() {
  return (
    <React.Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-[#718493]">A carregar ocorrência...</div>}>
      <OcorrenciaDetalheContent />
    </React.Suspense>
  );
}
