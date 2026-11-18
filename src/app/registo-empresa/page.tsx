'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import GotaLogo from '../../components/GotaLogo';

export default function RegistoEmpresaPage() {
  const [officialName, setOfficialName] = useState('');
  const [nuit, setNuit] = useState('');
  const [province, setProvince] = useState('Maputo Cidade');
  const [city, setCity] = useState('Maputo');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [serviceAreas, setServiceAreas] = useState('Polana Caniço, Maxaquene, Bairro Central, Zimpeto');
  const [servicesDescription, setServicesDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const areas = serviceAreas.split(',').map((a) => a.trim()).filter(Boolean);

      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officialName,
          nuit,
          province,
          city,
          address,
          phone,
          email,
          representativeName,
          serviceAreas: areas,
          servicesDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao submeter registo institucional.');

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <div className="apple-card p-6 sm:p-10 space-y-6">
        <div>
          <div className="inline-block mb-3">
            <GotaLogo size="sm" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#123B5D]">
            Registo Institucional de Entidade Fornecedora
          </h1>
          <p className="text-xs text-[#718493] mt-1">
            Formulário oficial para empresas concessionárias e operadores de rede de água potável em Moçambique.
          </p>
        </div>

        {/* Alerta de Verificação Administrativa */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <svg className="w-4 h-4 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Processo de Validação Obrigatório</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Todas as organizações ficam com o estado «Pendente de verificação». Apenas após a confirmação dos documentos pela administração da Gota a empresa será assinalada publicamente como verificada.
          </p>
        </div>

        {success ? (
          <div className="bg-[#E8F6FA] p-6 rounded-2xl border border-[#20B8D5]/30 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#20B8D5] text-white flex items-center justify-center mx-auto font-bold text-lg">
              ✓
            </div>
            <h3 className="font-bold text-base text-[#123B5D]">Candidatura submetida com sucesso</h3>
            <p className="text-xs text-[#243746] max-w-md mx-auto leading-relaxed">
              O registo da organização foi guardado. A administração da Gota irá validar a documentação institucional e as zonas de concessão antes de autorizar o acesso operacional.
            </p>
            <div className="pt-2">
              <Link
                href="/entrar"
                className="inline-block bg-[#123B5D] text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-xs"
              >
                Voltar à Página de Entrada
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-xs text-[#D94848] bg-red-50 p-3 rounded-xl border border-red-100">
                {error}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#123B5D] mb-1">
                  Nome Oficial da Organização *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: FIPAG, Águas da Matola..."
                  value={officialName}
                  onChange={(e) => setOfficialName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E1EBF0] focus:outline-hidden focus:border-[#20B8D5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123B5D] mb-1">
                  NUIT da Organização
                </label>
                <input
                  type="text"
                  placeholder="Ex: 400123987"
                  value={nuit}
                  onChange={(e) => setNuit(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E1EBF0] focus:outline-hidden focus:border-[#20B8D5]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#123B5D] mb-1">
                  Província *
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E1EBF0] bg-white text-[#243746]"
                >
                  <option value="Maputo Cidade">Maputo Cidade</option>
                  <option value="Maputo Província">Maputo Província</option>
                  <option value="Sofala">Sofala</option>
                  <option value="Nampula">Nampula</option>
                  <option value="Zambézia">Zambézia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123B5D] mb-1">
                  Cidade ou Município *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Maputo, Matola, Beira..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E1EBF0] focus:outline-hidden focus:border-[#20B8D5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#123B5D] mb-1">
                Endereço Físico Institucional
              </label>
              <input
                type="text"
                placeholder="Av. Eduardo Mondlane, n.º..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#E1EBF0] focus:outline-hidden focus:border-[#20B8D5]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#123B5D] mb-1">
                  Contacto Telefónico Institucional *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+258 21 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E1EBF0] focus:outline-hidden focus:border-[#20B8D5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123B5D] mb-1">
                  Correio Electrónico Oficial *
                </label>
                <input
                  type="email"
                  required
                  placeholder="operacoes@empresa.co.mz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E1EBF0] focus:outline-hidden focus:border-[#20B8D5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#123B5D] mb-1">
                Nome do Representante Autorizado *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Eng. Alberto Munguambe"
                value={representativeName}
                onChange={(e) => setRepresentativeName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#E1EBF0] focus:outline-hidden focus:border-[#20B8D5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#123B5D] mb-1">
                Zonas Geográficas de Atendimento (Bairros separados por vírgula) *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Polana Caniço, Maxaquene, Chamanculo, Zimpeto"
                value={serviceAreas}
                onChange={(e) => setServiceAreas(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#E1EBF0] focus:outline-hidden focus:border-[#20B8D5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#123B5D] mb-1">
                Descrição dos Serviços e Infra-estruturas Operadas
              </label>
              <textarea
                rows={3}
                placeholder="Distribuição de água, manutenção de adutoras, ramais prediais..."
                value={servicesDescription}
                onChange={(e) => setServicesDescription(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#E1EBF0] focus:outline-hidden focus:border-[#20B8D5]"
              />
            </div>

            <div className="p-3 bg-[#F5FAFC] rounded-xl border border-[#E1EBF0] text-[11px] text-[#718493]">
              Os documentos comprobatórios (alvará, credencial ministerial ou licença de concessão) deverão ser apresentados directamente à equipa de auditoria da Gota durante a fase de verificação.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#123B5D] hover:bg-[#0c273e] text-white font-bold py-3 rounded-full text-xs transition-colors shadow-xs"
            >
              {loading ? 'A submeter candidatura...' : 'Submeter Candidatura Institucional'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
