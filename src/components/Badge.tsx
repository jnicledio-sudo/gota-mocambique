import React from 'react';
import { OccurrenceStatus, OccurrencePriority, CompanyStatus } from '../types';

interface BadgeProps {
  type: 'status' | 'priority' | 'companyStatus';
  value: OccurrenceStatus | OccurrencePriority | CompanyStatus;
  size?: 'sm' | 'md';
}

export default function Badge({ type, value, size = 'md' }: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs font-semibold';

  if (type === 'priority') {
    switch (value) {
      case 'critica':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-red-50 text-[#D94848] border border-red-200/70 shadow-2xs ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D94848] shadow-[0_0_6px_#D94848]" />
            Crítica
          </span>
        );
      case 'alta':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-orange-50 text-[#E5A23C] border border-orange-200/70 shadow-2xs ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5A23C]" />
            Alta
          </span>
        );
      case 'media':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-sky-50 text-[#20B8D5] border border-sky-200/70 shadow-2xs ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#20B8D5]" />
            Média
          </span>
        );
      case 'baixa':
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-50 text-[#667085] border border-slate-200/70 shadow-2xs ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" />
            Baixa
          </span>
        );
    }
  }

  if (type === 'companyStatus') {
    switch (value) {
      case 'verificada':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 shadow-2xs ${sizeClasses}`}>
            <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verificada
          </span>
        );
      case 'pendente':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70 shadow-2xs ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pendente de revisão
          </span>
        );
      case 'rejeitada':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-red-50 text-red-700 border border-red-200/70 shadow-2xs ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Rejeitada
          </span>
        );
      case 'suspensa':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300/70 shadow-2xs ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Suspensa
          </span>
        );
    }
  }

  // OccurrenceStatus
  switch (value) {
    case 'recebida':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-[#123B5D] border border-blue-200/70 shadow-2xs ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#123B5D]" />
          Recebida
        </span>
      );
    case 'em_analise':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-cyan-50 text-[#189bb5] border border-cyan-200/70 shadow-2xs ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#20B8D5]" />
          Em análise
        </span>
      );
    case 'encaminhada':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70 shadow-2xs ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          Encaminhada
        </span>
      );
    case 'intervencao_programada':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-[#E5A23C] border border-amber-200/70 shadow-2xs ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#E5A23C]" />
          Programada
        </span>
      );
    case 'em_resolucao':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/70 shadow-2xs ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
          Em resolução
        </span>
      );
    case 'resolvida':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 shadow-2xs ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#62D6BE]" />
          Resolvida
        </span>
      );
    case 'encerrada':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-[#1D2939] border border-slate-300/70 shadow-2xs ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
          Encerrada
        </span>
      );
    case 'rejeitada':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-red-50 text-[#D94848] border border-red-200/70 shadow-2xs ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D94848]" />
          Rejeitada
        </span>
      );
    default:
      return null;
  }
}
