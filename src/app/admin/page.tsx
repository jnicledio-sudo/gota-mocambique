'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Badge from '../../components/Badge';
import { Company, AuditLog, Occurrence, User } from '../../types';

export default function AdminPainelPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [staleOccurrences, setStaleOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'empresas' | 'auditoria' | 'atrasos'>('empresas');

  const [moderatingId, setModeratingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState('');

  const loadData = async () => {
    try {
      const [authRes, adminRes, auditRes] = await Promise.all([
        fetch('/api/auth'),
        fetch('/api/admin?action=stats'),
        fetch('/api/admin?action=audit'),
      ]);

      if (!authRes.ok) {
        router.push('/entrar');
        return;
      }

      const authData = await authRes.json();
      if (!authData.user || authData.user.role !== 'admin') {
        router.push('/entrar');
        return;
      }
      setCurrentUser(authData.user);

      if (adminRes.ok) {
        const adminData = await adminRes.json();
        setStats(adminData.stats);
        setCompanies(adminData.companies || []);
        setStaleOccurrences(adminData.staleOccurrences || []);
      }

      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditLogs(auditData.auditLogs || []);
      }
    } catch (err) {
      console.error('Erro ao carregar dados de administração:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [router]);

  // Moderação de Empresa
  const handleModerateCompany = async (companyId: string, status: string) => {
    setModeratingId(companyId);
    try {
      const res = await fetch('/api/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, status }),
      });

      if (res.ok) {
        setActionMessage(`Estado da empresa alterado para ${status}.`);
        await loadData();
      }
    } catch (err) {
      console.error('Erro na moderação:', err);
    } finally {
      setModeratingId(null);
    }
  };

  // Exportar CSV
  const handleExportCsv = () => {
    window.open('/api/admin?action=export', '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-xs text-[#718493]">
        A carregar consola administrativa da Gota...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10 space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#123B5D] uppercase tracking-wider">
            Supervisão Geral
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123B5D]">
            Consola de Administração
          </h1>
          <p className="text-xs text-[#718493] mt-0.5">
            Sessão autenticada: <span className="font-semibold text-[#243746]">{currentUser?.name}</span> (Super-administrador)
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="self-start sm:self-auto bg-[#123B5D] hover:bg-[#0c273e] text-white font-bold px-4 py-2 rounded-full text-xs transition-colors shadow-2xs flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Exportar Relatório (CSV)</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="font-bold">✕</button>
        </div>
      )}

      {/* Cartões Estatísticos da Plataforma */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="apple-card p-5">
            <span className="text-[10px] uppercase font-bold text-[#718493] block mb-1">Total de Denúncias</span>
            <div className="text-2xl font-black text-[#123B5D]">{stats.totalOccurrences}</div>
            <span className="text-[10px] text-[#718493]">{stats.resolvedCount} resolvidas</span>
          </div>

          <div className="apple-card p-5">
            <span className="text-[10px] uppercase font-bold text-[#E5A23C] block mb-1">Empresas Pendentes</span>
            <div className="text-2xl font-black text-[#E5A23C]">{stats.pendingCompanies}</div>
            <span className="text-[10px] text-[#718493]">De {stats.totalCompanies} registadas</span>
          </div>

          <div className="apple-card p-5">
            <span className="text-[10px] uppercase font-bold text-[#D94848] block mb-1">Ocorrências Críticas</span>
            <div className="text-2xl font-black text-[#D94848]">{stats.criticalCount}</div>
            <span className="text-[10px] text-[#718493]">Risco para via/estrutura</span>
          </div>

          <div className="apple-card p-5">
            <span className="text-[10px] uppercase font-bold text-[#20B8D5] block mb-1">Sem Actualização (&gt;48h)</span>
            <div className="text-2xl font-black text-[#20B8D5]">{stats.staleOccurrencesCount}</div>
            <span className="text-[10px] text-[#718493]">Necessitam de atenção</span>
          </div>
        </div>
      )}

      {/* Abas de Navegação Administrativa */}
      <div className="flex border-b border-[#E1EBF0] gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('empresas')}
          className={`pb-2.5 transition-colors relative ${
            activeTab === 'empresas'
              ? 'text-[#20B8D5] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#20B8D5]'
              : 'text-[#718493] hover:text-[#243746]'
          }`}
        >
          Moderação de Empresas ({companies.length})
        </button>

        <button
          onClick={() => setActiveTab('atrasos')}
          className={`pb-2.5 transition-colors relative ${
            activeTab === 'atrasos'
              ? 'text-[#20B8D5] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#20B8D5]'
              : 'text-[#718493] hover:text-[#243746]'
          }`}
        >
          Casos sem Actualização ({staleOccurrences.length})
        </button>

        <button
          onClick={() => setActiveTab('auditoria')}
          className={`pb-2.5 transition-colors relative ${
            activeTab === 'auditoria'
              ? 'text-[#20B8D5] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#20B8D5]'
              : 'text-[#718493] hover:text-[#243746]'
          }`}
        >
          Registos de Auditoria ({auditLogs.length})
        </button>
      </div>

      {/* ABA 1: MODERAÇÃO DE EMPRESAS */}
      {activeTab === 'empresas' && (
        <div className="apple-card p-6 sm:p-8 space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#123B5D]">Revisão de Registos Institucionais</h2>
            <p className="text-xs text-[#718493]">
              Aprovação rigorosa de concessões de abastecimento para garantia de legitimidade pública.
            </p>
          </div>

          <div className="divide-y divide-[#E1EBF0]">
            {companies.map((comp) => (
              <div key={comp.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm text-[#123B5D]">{comp.officialName}</h3>
                    <Badge type="companyStatus" value={comp.status} size="sm" />
                  </div>
                  <p className="text-xs text-[#718493]">
                    {comp.city}, {comp.province} • NUIT: {comp.nuit || 'N/A'} • Contacto: {comp.phone}
                  </p>
                  <p className="text-[11px] text-[#243746] mt-1">
                    Representante: <span className="font-semibold">{comp.representativeName}</span> ({comp.email})
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-[10px] text-[#718493] self-center">Zonas:</span>
                    {comp.serviceAreas.map((area, i) => (
                      <span key={i} className="text-[10px] bg-[#F5FAFC] border border-[#E1EBF0] px-2 py-0.5 rounded">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  {comp.status === 'pendente' && (
                    <>
                      <button
                        onClick={() => handleModerateCompany(comp.id, 'verificada')}
                        disabled={moderatingId === comp.id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors shadow-2xs"
                      >
                        Aprovar e Verificar
                      </button>
                      <button
                        onClick={() => handleModerateCompany(comp.id, 'rejeitada')}
                        disabled={moderatingId === comp.id}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors shadow-2xs"
                      >
                        Rejeitar
                      </button>
                    </>
                  )}

                  {comp.status === 'verificada' && (
                    <button
                      onClick={() => handleModerateCompany(comp.id, 'suspensa')}
                      disabled={moderatingId === comp.id}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
                    >
                      Suspender
                    </button>
                  )}

                  {comp.status === 'suspensa' && (
                    <button
                      onClick={() => handleModerateCompany(comp.id, 'verificada')}
                      disabled={moderatingId === comp.id}
                      className="bg-[#20B8D5] hover:bg-[#19a1bb] text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                    >
                      Reativar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 2: CASOS SEM ACTUALIZAÇÃO */}
      {activeTab === 'atrasos' && (
        <div className="apple-card p-6 sm:p-8 space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#123B5D]">Ocorrências com Resposta em Atraso (&gt;48h)</h2>
            <p className="text-xs text-[#718493]">
              Casos abertos que não registaram qualquer intervenção técnica recente.
            </p>
          </div>

          {staleOccurrences.length === 0 ? (
            <div className="text-center py-8 text-xs text-emerald-700 font-semibold">
              Excelente: Todas as ocorrências têm actualizações dentro do prazo regulamentar.
            </div>
          ) : (
            <div className="divide-y divide-[#E1EBF0]">
              {staleOccurrences.map((occ) => (
                <div key={occ.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-[#123B5D]">{occ.code}</span>
                      <Badge type="priority" value={occ.priority} size="sm" />
                      <Badge type="status" value={occ.status} size="sm" />
                    </div>
                    <div className="font-semibold text-[#243746]">{occ.typeLabel}, {occ.location.neighborhood}</div>
                    <div className="text-[#718493] text-[11px]">
                      Entidade: {occ.assignedCompanyName || 'Não atribuída'}
                    </div>
                  </div>

                  <Link
                    href={`/ocorrencias/${occ.id}`}
                    className="bg-[#123B5D] text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                  >
                    Examinar
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 3: REGISTOS DE AUDITORIA */}
      {activeTab === 'auditoria' && (
        <div className="apple-card p-6 sm:p-8 space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#123B5D]">Livro de Auditoria de Operações</h2>
            <p className="text-xs text-[#718493]">
              Rastreio imutável de todas as acções administrativas e institucionais.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5FAFC] text-[#718493] uppercase text-[10px] font-bold border-y border-[#E1EBF0]">
                <tr>
                  <th className="py-2.5 px-3">Data e Hora</th>
                  <th className="py-2.5 px-3">Utilizador / Papel</th>
                  <th className="py-2.5 px-3">Acção</th>
                  <th className="py-2.5 px-3">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1EBF0]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-[#718493] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleDateString('pt-PT', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#123B5D]">
                      {log.userName}
                      <span className="block text-[10px] text-[#718493] font-normal uppercase">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-xs text-[#20B8D5]">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 text-[#243746] max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
