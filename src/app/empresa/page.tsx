'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Badge from '../../components/Badge';
import InteractiveMap from '../../components/InteractiveMap';
import { Occurrence, User, Company } from '../../types';

export default function EmpresaPainelPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(0);

  // Filtros internos da empresa
  const [statusFilter, setStatusFilter] = useState('todos');
  const [priorityFilter, setPriorityFilter] = useState('todos');

  useEffect(() => {
    async function loadData() {
      try {
        const [authRes, occRes, compRes] = await Promise.all([
          fetch('/api/auth'),
          fetch('/api/occurrences'),
          fetch('/api/companies'),
        ]);

        if (!authRes.ok) {
          router.push('/entrar');
          return;
        }

        const authData = await authRes.json();
        if (!authData.user || (authData.user.role !== 'empresa' && authData.user.role !== 'admin')) {
          router.push('/entrar');
          return;
        }

        setCurrentUser(authData.user);

        if (compRes.ok) {
          const compData = await compRes.json();
          const currentComp = compData.companies.find((c: Company) => c.id === authData.user.companyId);
          setCompany(currentComp || compData.companies[0]);
        }

        if (occRes.ok) {
          const occData = await occRes.json();
          setOccurrences(occData.occurrences || []);
        }
        setNow(Date.now());
      } catch (err) {
        console.error('Erro ao carregar painel empresarial:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  // Filtrar ocorrências da empresa
  const companyOccurrences = occurrences.filter((o) => {
    if (!company) return true;
    return o.assignedCompanyId === company.id || !o.assignedCompanyId;
  });

  // Métricas reais e documentadas
  const pendingCount = companyOccurrences.filter((o) => o.status === 'recebida' || o.status === 'em_analise').length;
  const criticalCount = companyOccurrences.filter((o) => o.priority === 'critica').length;
  const inProgressCount = companyOccurrences.filter((o) => o.status === 'em_resolucao' || o.status === 'intervencao_programada').length;
  const resolvedCount = companyOccurrences.filter((o) => o.status === 'resolvida' || o.status === 'encerrada').length;

  // Cálculo real do tempo médio de primeira resposta (em horas)
  let totalHours = 0;
  let countResponses = 0;
  companyOccurrences.forEach((o) => {
    if (o.firstResponseAt && o.reportedAt) {
      const diffMs = new Date(o.firstResponseAt).getTime() - new Date(o.reportedAt).getTime();
      const diffH = diffMs / (1000 * 60 * 60);
      if (diffH >= 0) {
        totalHours += diffH;
        countResponses++;
      }
    }
  });

  const avgResponseTime = countResponses > 0 ? (totalHours / countResponses).toFixed(1) + 'h' : 'Sem registos';

  // Alertas de casos sem actualização recente (> 48h)
  const unattendedOccurrences = now === 0 ? [] : companyOccurrences.filter((o) => {
    if (o.status === 'resolvida' || o.status === 'encerrada' || o.status === 'rejeitada') return false;
    const diff = now - new Date(o.reportedAt).getTime();
    return diff > 48 * 60 * 60 * 1000;
  });

  // Filtrar lista
  const filteredList = companyOccurrences.filter((o) => {
    if (statusFilter !== 'todos' && o.status !== statusFilter) return false;
    if (priorityFilter !== 'todos' && o.priority !== priorityFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-xs text-[#718493]">
        A carregar painel operacional da empresa...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10 space-y-8">
      {/* Cabeçalho da Empresa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#123B5D] uppercase tracking-wider">
              Painel Operacional
            </span>
            {company && <Badge type="companyStatus" value={company.status} size="sm" />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123B5D]">
            {company ? company.officialName : 'Entidade de Abastecimento'}
          </h1>
          <p className="text-xs text-[#718493] mt-0.5">
            Responsável técnico: <span className="font-semibold text-[#243746]">{currentUser?.name}</span>
          </p>
        </div>

        <Link
          href="/ocorrencias"
          className="self-start sm:self-auto bg-white border border-[#E1EBF0] hover:border-[#20B8D5] text-[#123B5D] font-bold px-4 py-2 rounded-full text-xs transition-colors shadow-2xs"
        >
          Consultar Todas as Zonas
        </Link>
      </div>

      {/* Alertas de Urgência e Atraso */}
      {unattendedOccurrences.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
          <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <span className="font-bold">Atenção ao tempo de resposta: </span>
            Existem {unattendedOccurrences.length} ocorrência(s) sem qualquer actualização há mais de 48 horas nesta área de concessão.
          </div>
        </div>
      )}

      {/* Cartões com Métricas Operacionais */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="apple-card p-4">
          <span className="text-[10px] uppercase font-bold text-[#718493] block mb-1">Total Atribuído</span>
          <div className="text-2xl font-black text-[#123B5D]">{companyOccurrences.length}</div>
        </div>

        <div className="apple-card p-4">
          <span className="text-[10px] uppercase font-bold text-[#E5A23C] block mb-1">Pendentes</span>
          <div className="text-2xl font-black text-[#E5A23C]">{pendingCount}</div>
        </div>

        <div className="apple-card p-4">
          <span className="text-[10px] uppercase font-bold text-[#D94848] block mb-1">Críticas / Urgentes</span>
          <div className="text-2xl font-black text-[#D94848]">{criticalCount}</div>
        </div>

        <div className="apple-card p-4">
          <span className="text-[10px] uppercase font-bold text-[#20B8D5] block mb-1">Em Resolução</span>
          <div className="text-2xl font-black text-[#20B8D5]">{inProgressCount}</div>
        </div>

        <div className="apple-card p-4 col-span-2 lg:col-span-1">
          <span className="text-[10px] uppercase font-bold text-[#718493] block mb-1">Tempo Médio Resposta</span>
          <div className="text-2xl font-black text-emerald-700">{avgResponseTime}</div>
          <span className="text-[10px] text-[#718493]">Até à 1.ª acção técnica</span>
        </div>
      </div>

      {/* Distribuição no Mapa Operacional */}
      <div className="apple-card p-6 sm:p-8 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#123B5D]">Distribuição Geográfica das Ocorrências</h2>
          <span className="text-xs text-[#718493]">Zonas de cobertura concessionadas</span>
        </div>
        <InteractiveMap
          occurrences={companyOccurrences}
          height="340px"
        />
      </div>

      {/* Lista Operacional Ordenável e Filtrável */}
      <div className="apple-card p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#123B5D]">Fila de Trabalho das Brigadas</h2>

          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-xl border border-[#E1EBF0] bg-white text-[#243746]"
            >
              <option value="todos">Todos os estados</option>
              <option value="recebida">Recebida</option>
              <option value="em_analise">Em análise</option>
              <option value="intervencao_programada">Programada</option>
              <option value="em_resolucao">Em resolução</option>
              <option value="resolvida">Resolvida</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-xl border border-[#E1EBF0] bg-white text-[#243746]"
            >
              <option value="todos">Todas as prioridades</option>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5FAFC] text-[#718493] uppercase text-[10px] font-bold border-y border-[#E1EBF0]">
              <tr>
                <th className="py-3 px-3">Código</th>
                <th className="py-3 px-3">Tipo / Descrição</th>
                <th className="py-3 px-3">Bairro</th>
                <th className="py-3 px-3">Prioridade</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-3">Brigada</th>
                <th className="py-3 px-3 text-right">Acção</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1EBF0]">
              {filteredList.map((occ) => (
                <tr key={occ.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#123B5D]">{occ.code}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-[#243746]">{occ.typeLabel}</div>
                    <div className="text-[11px] text-[#718493] line-clamp-1">{occ.description || 'Sem notas'}</div>
                  </td>
                  <td className="py-3 px-3 font-medium text-[#243746]">{occ.location.neighborhood}</td>
                  <td className="py-3 px-3">
                    <Badge type="priority" value={occ.priority} size="sm" />
                  </td>
                  <td className="py-3 px-3">
                    <Badge type="status" value={occ.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-[#718493]">
                    {occ.assignedTechnician || 'Não atribuído'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href={`/ocorrencias/${occ.id}`}
                      className="inline-block bg-[#123B5D] hover:bg-[#0c273e] text-white font-bold px-3 py-1 rounded-lg text-[11px] transition-colors"
                    >
                      Gerir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
