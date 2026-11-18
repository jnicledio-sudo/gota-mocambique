'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import GotaLogo from '../components/GotaLogo';
import Badge from '../components/Badge';
import InteractiveMap from '../components/InteractiveMap';
import { Occurrence, Company } from '../types';

export default function HomePage() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [occRes, compRes] = await Promise.all([
          fetch('/api/occurrences'),
          fetch('/api/companies'),
        ]);

        if (occRes.ok) {
          const occData = await occRes.json();
          setOccurrences(occData.occurrences || []);
        }

        if (compRes.ok) {
          const compData = await compRes.json();
          setCompanies(compData.companies || []);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-14 sm:gap-24 apple-bg-ambient">
      {/* 1. SECÇÃO HERO ESTILO APPLE */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
          {/* Animação real da gota a cair com ondulações */}
          <div className="mb-6 p-4 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_12px_40px_rgba(32,184,213,0.15)] flex flex-col items-center">
            <GotaLogo size="xl" animated={true} showText={false} />
            <span className="text-xs font-semibold tracking-wider text-[#123B5D] uppercase mt-2">
              Gota
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#20B8D5]/25 text-[#123B5D] text-xs font-semibold mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#62D6BE] shadow-[0_0_8px_#62D6BE]" />
            <span>Cada gota conta. Cada ocorrência importa.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-[#123B5D] tracking-tight max-w-2xl leading-[1.1]">
            Viste uma fuga de água? Comunica-a.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-[#667085] max-w-xl leading-relaxed font-normal">
            Ajuda a identificar problemas na tua zona e acompanha a resposta da entidade responsável com transparência total.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
            <Link
              href="/comunicar"
              className="apple-btn-primary w-full sm:w-auto px-8 py-3.5 flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>Comunicar uma fuga</span>
            </Link>

            <Link
              href="/mapa"
              className="apple-btn-secondary w-full sm:w-auto px-7 py-3.5 flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-4 h-4 text-[#20B8D5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span>Explorar o mapa</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. PRÉ-VISUALIZAÇÃO DO MAPA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <div className="apple-card p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#123B5D]">Mapa de Ocorrências</h2>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Dados de demonstração
                </span>
              </div>
              <p className="text-xs text-[#667085] mt-1">
                Consulta denúncias registadas em Maputo e arredores. Seleciona um ponto para ver a informação.
              </p>
            </div>

            <Link
              href="/mapa"
              className="text-xs font-semibold text-[#20B8D5] hover:text-[#17a0bb] flex items-center gap-1 self-start sm:self-auto transition-colors"
            >
              <span>Ver mapa em ecrã inteiro</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <InteractiveMap
            occurrences={occurrences}
            height="380px"
          />
        </div>
      </section>

      {/* 3. COMO FUNCIONA A GOTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[11px] font-bold text-[#20B8D5] uppercase tracking-wider block mb-1">
            Simples e Direto
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#123B5D]">Como funciona a Gota</h2>
          <p className="mt-2 text-xs sm:text-sm text-[#667085]">
            Três passos para ligar quem identifica uma fuga à entidade responsável pela sua reparação.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="apple-card p-6 flex flex-col items-start">
            <div className="w-11 h-11 rounded-2xl bg-[#20B8D5]/15 text-[#20B8D5] flex items-center justify-center font-black text-base mb-4 shadow-xs">
              1
            </div>
            <h3 className="font-bold text-base text-[#123B5D] mb-1.5">Comunica a fuga</h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              Indica o bairro, tira uma fotografia no telemóvel e assinala o local exacto em menos de um minuto.
            </p>
          </div>

          <div className="apple-card p-6 flex flex-col items-start">
            <div className="w-11 h-11 rounded-2xl bg-[#123B5D]/10 text-[#123B5D] flex items-center justify-center font-black text-base mb-4 shadow-xs">
              2
            </div>
            <h3 className="font-bold text-base text-[#123B5D] mb-1.5">Encaminhamento directo</h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              A ocorrência é verificada e associada à empresa responsável pela rede de abastecimento daquela zona.
            </p>
          </div>

          <div className="apple-card p-6 flex flex-col items-start">
            <div className="w-11 h-11 rounded-2xl bg-[#62D6BE]/25 text-[#123B5D] flex items-center justify-center font-black text-base mb-4 shadow-xs">
              3
            </div>
            <h3 className="font-bold text-base text-[#123B5D] mb-1.5">Acompanha a resposta</h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              Recebe actualizações reais na cronologia até à conclusão da reparação com comprovativo técnico.
            </p>
          </div>
        </div>
      </section>

      {/* 4. OCORRÊNCIAS RECENTES */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-[#123B5D]">Ocorrências Recentes</h2>
            <p className="text-xs text-[#667085] mt-0.5">Registos comunicados recentemente na plataforma</p>
          </div>
          <Link
            href="/ocorrencias"
            className="text-xs font-semibold text-[#20B8D5] hover:text-[#17a0bb]"
          >
            Ver todas ({occurrences.length})
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {occurrences.slice(0, 3).map((occ) => (
            <Link
              key={occ.id}
              href={`/ocorrencias/${occ.id}`}
              className="apple-card p-5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-mono font-bold text-[#123B5D] bg-black/[0.03] px-2 py-0.5 rounded-md">
                    {occ.code}
                  </span>
                  <Badge type="status" value={occ.status} size="sm" />
                </div>

                <h3 className="font-bold text-sm text-[#123B5D] group-hover:text-[#20B8D5] transition-colors mb-1">
                  {occ.typeLabel}
                </h3>

                <p className="text-xs text-[#667085] flex items-center gap-1 mb-3">
                  <svg className="w-3.5 h-3.5 text-[#20B8D5] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>{occ.location.neighborhood}, {occ.location.city}</span>
                </p>

                {occ.description && (
                  <p className="text-xs text-[#1D2939] line-clamp-2 mb-4 leading-relaxed font-normal">
                    {occ.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-black/[0.05] flex items-center justify-between text-[11px] text-[#667085]">
                <Badge type="priority" value={occ.priority} size="sm" />
                <span>
                  {new Date(occ.reportedAt).toLocaleDateString('pt-PT', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. EMPRESAS FORNECEDORAS REGISTADAS */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <div className="apple-card p-6 sm:p-8">
          <div className="max-w-xl mb-6">
            <h2 className="text-xl font-bold text-[#123B5D]">Entidades Fornecedoras Verificadas</h2>
            <p className="text-xs text-[#667085] mt-1">
              Organizações com documentação validada pela administração da Gota para atendimento das redes de água.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companies.map((comp) => (
              <div
                key={comp.id}
                className="p-4 rounded-2xl bg-white border border-[#E4E7EC] shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-sm text-[#123B5D]">{comp.officialName}</h3>
                    <Badge type="companyStatus" value={comp.status} size="sm" />
                  </div>

                  <p className="text-xs text-[#667085] mb-3 leading-relaxed">
                    {comp.servicesDescription}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {comp.serviceAreas.slice(0, 4).map((area, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-[#F8FAFC] px-2 py-0.5 rounded-md border border-[#E4E7EC] text-[#1D2939] font-medium"
                      >
                        {area}
                      </span>
                    ))}
                    {comp.serviceAreas.length > 4 && (
                      <span className="text-[10px] text-[#667085] px-1 self-center">
                        +{comp.serviceAreas.length - 4} bairros
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-[#667085] flex items-center justify-between border-t border-[#E4E7EC] mt-2">
                  <span>{comp.city}, {comp.province}</span>
                  <span className="font-semibold text-[#123B5D]">{comp.phone}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Chamada para empresas fornecedoras */}
          <div className="mt-8 pt-6 border-t border-black/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-[#123B5D]">Representas uma entidade de abastecimento?</h4>
              <p className="text-xs text-[#667085]">
                Submete o registo da tua organização para receber ocorrências directas na tua área de cobertura.
              </p>
            </div>
            <Link
              href="/registo-empresa"
              className="apple-btn-secondary text-xs px-5 py-2.5 shrink-0"
            >
              Registar organização
            </Link>
          </div>
        </div>
      </section>

      {/* 6. PERGUNTAS FREQUENTES (FAQ) */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#123B5D]">Perguntas Frequentes</h2>
          <p className="text-xs text-[#667085] mt-1">
            Respostas directas às dúvidas mais comuns sobre a utilização da Gota.
          </p>
        </div>

        <div className="space-y-3">
          <div className="apple-card p-5">
            <h3 className="font-bold text-sm text-[#123B5D] mb-1">
              É obrigatório criar uma conta para comunicar uma fuga?
            </h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              Não. Qualquer cidadão pode comunicar uma fuga sem autenticação. Criar conta permite acompanhar todas as tuas ocorrências no teu painel pessoal.
            </p>
          </div>

          <div className="apple-card p-5">
            <h3 className="font-bold text-sm text-[#123B5D] mb-1">
              O meu número de telefone fica visível para o público?
            </h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              Não. Se optares por indicar o teu contacto, este apenas é visível para a entidade responsável e para a administração, para efeitos de esclarecimento da localização no terreno.
            </p>
          </div>

          <div className="apple-card p-5">
            <h3 className="font-bold text-sm text-[#123B5D] mb-1">
              Como sei que a fuga foi realmente reparada?
            </h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              A Gota não marca uma fuga como resolvida sem actualização técnica da entidade no local, incluindo notas da intervenção e comprovativo fotográfico quando aplicável.
            </p>
          </div>
        </div>
      </section>

      {/* 7. RODAPÉ */}
      <footer className="bg-white border-t border-[#E4E7EC] py-12 mt-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#667085]">
          <div className="flex items-center gap-3">
            <GotaLogo size="sm" animated={false} />
            <span className="font-medium">Cada gota conta. Cada ocorrência importa.</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/mapa" className="hover:text-[#20B8D5] transition-colors">Mapa</Link>
            <Link href="/ocorrencias" className="hover:text-[#20B8D5] transition-colors">Ocorrências</Link>
            <Link href="/registo-empresa" className="hover:text-[#20B8D5] transition-colors">Empresas</Link>
            <Link href="/entrar" className="hover:text-[#20B8D5] transition-colors">Acesso Restrito</Link>
          </div>

          <div className="text-center md:text-right">
            <p>Plataforma de utilidade pública para zonas urbanas de Moçambique.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
