'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import InteractiveMap from '../../components/InteractiveMap';
import { OccurrenceType } from '../../types';

const COMMON_NEIGHBORHOODS = [
  'Polana Caniço B',
  'Polana Caniço A',
  'Maxaquene',
  'Bairro Central',
  'Zimpeto',
  'Sommerschield',
  'Chamanculo',
  'Machava',
  'Matola C',
];

export default function ComunicarPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Problema e Fotografia, 2: Localizacao, 3: Confirmacao e Contacto, 4: Sucesso

  // Dados do formulario
  const [type, setType] = useState<OccurrenceType>('tubagem_rompida');
  const [description, setDescription] = useState('');
  const [floodingRoad, setFloodingRoad] = useState(false);
  const [highVolume, setHighVolume] = useState(false);
  const [nearBusyRoad, setNearBusyRoad] = useState(false);
  const [infrastructureRisk, setInfrastructureRisk] = useState(false);

  // Localizacao
  const [province, setProvince] = useState('Maputo Cidade');
  const [city, setCity] = useState('Maputo');
  const [neighborhood, setNeighborhood] = useState('');
  const [street, setStreet] = useState('');
  const [referencePoint, setReferencePoint] = useState('');
  const [latitude, setLatitude] = useState(-25.9537);
  const [longitude, setLongitude] = useState(32.5887);
  const [isGpsAccurate, setIsGpsAccurate] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // Fotografias (comprimidas em base64)
  const [photos, setPhotos] = useState<string[]>([]);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Contacto do denunciante
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');

  // Estado da submissao
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdOccurrence, setCreatedOccurrence] = useState<any>(null);

  // Obter GPS do dispositivo
  const handleGetGps = () => {
    if (!navigator.geolocation) {
      setGpsError('O teu navegador nao suporta geolocalizacao.');
      return;
    }

    setGpsLoading(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setIsGpsAccurate(true);
        setGpsLoading(false);
      },
      (error) => {
        setGpsLoading(false);
        setGpsError('Nao foi possivel obter a tua posicao GPS. Podes tocar no mapa ou escrever o bairro.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Carregar e comprimir foto com Canvas para economizar dados moveis
  const handlePhotoFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setCompressing(true);
    const fileList = Array.from(files);
    const remainingSlots = 3 - photos.length;
    const filesToProcess = fileList.slice(0, remainingSlots);

    let processedCount = 0;

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 900;
          const scaleSize = Math.min(1, MAX_WIDTH / img.width);
          canvas.width = img.width * scaleSize;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.68);
            setPhotos((prev) => [...prev, compressedDataUrl]);
          }
          processedCount++;
          if (processedCount === filesToProcess.length) {
            setCompressing(false);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Submeter ocorrencia
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        type,
        description,
        floodingRoad,
        highVolume,
        nearBusyRoad,
        infrastructureRisk,
        location: {
          latitude,
          longitude,
          province,
          city,
          neighborhood,
          street,
          referencePoint,
          isGpsAccurate,
        },
        photos,
        reporterContact: reporterPhone ? { name: reporterName, phone: reporterPhone } : undefined,
      };

      const res = await fetch('/api/occurrences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ocorreu um erro ao registar a ocorrencia.');
      }

      setCreatedOccurrence(data.occurrence);
      setStep(4); // Ecra de sucesso
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const occurrenceTypes: { value: OccurrenceType; label: string; desc: string }[] = [
    {
      value: 'tubagem_rompida',
      label: 'Tubagem rompida',
      desc: 'Cano ou conduta principal com agua a jorrar com pressao.',
    },
    {
      value: 'fuga_visivel',
      label: 'Fuga visivel',
      desc: 'Agua a verter continuamente no passeio ou contador.',
    },
    {
      value: 'agua_alagar_via',
      label: 'Agua a alagar a via publica',
      desc: 'Acumulacao de agua na estrada ou no passeio urbano.',
    },
    {
      value: 'fuga_residencia',
      label: 'Fuga junto a residencia',
      desc: 'Fuga na ligacao predial ou junto a muro habitacional.',
    },
    {
      value: 'fuga_subterranea',
      label: 'Possivel fuga subterranea',
      desc: 'Solo afundado, calcada levantada ou piso permanentemente humido.',
    },
    {
      value: 'outro',
      label: 'Outro problema de agua',
      desc: 'Outra anomalia na rede publica de distribuicao de agua potavel.',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
      {/* Cabecalho do formulario */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-[#718493] hover:text-[#20B8D5] mb-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar ao inicio
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123B5D]">
          Comunicar uma fuga de água
        </h1>
        <p className="text-xs sm:text-sm text-[#718493] mt-1">
          Registo simples e rapido para mobilizar as equipas tecnicas no terreno.
        </p>

        {/* Indicador de passos */}
        {step < 4 && (
          <div className="flex items-center justify-between mt-6 max-w-sm mx-auto text-xs font-semibold">
            <div
              className={`flex items-center gap-1.5 ${
                step >= 1 ? 'text-[#20B8D5]' : 'text-slate-300'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                  step >= 1 ? 'bg-[#20B8D5] text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                1
              </span>
              <span>Problema & Foto</span>
            </div>
            <div className={`h-0.5 flex-1 mx-2 ${step >= 2 ? 'bg-[#20B8D5]' : 'bg-slate-200'}`} />
            <div
              className={`flex items-center gap-1.5 ${
                step >= 2 ? 'text-[#20B8D5]' : 'text-slate-300'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                  step >= 2 ? 'bg-[#20B8D5] text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                2
              </span>
              <span>Localização</span>
            </div>
            <div className={`h-0.5 flex-1 mx-2 ${step >= 3 ? 'bg-[#20B8D5]' : 'bg-slate-200'}`} />
            <div
              className={`flex items-center gap-1.5 ${
                step >= 3 ? 'text-[#20B8D5]' : 'text-slate-300'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                  step >= 3 ? 'bg-[#20B8D5] text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                3
              </span>
              <span>Confirmar</span>
            </div>
          </div>
        )}
      </div>

      {/* Inputs de ficheiro invisiveis controlados por botoes visiveis */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handlePhotoFiles(e.target.files)}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handlePhotoFiles(e.target.files)}
        className="hidden"
      />

      {/* PASSO 1: TIPO DE OCORRENCIA E FOTOGRAFIA DESTACADA */}
      {step === 1 && (
        <div className="apple-card p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#123B5D] mb-1">Que tipo de fuga estás a ver?</h2>
            <p className="text-xs text-[#718493]">
              Escolhe a opção correspondente ao problema observado.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {occurrenceTypes.map((item) => (
              <label
                key={item.value}
                onClick={() => setType(item.value)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  type === item.value
                    ? 'border-[#20B8D5] bg-[#F5FAFC] ring-1 ring-[#20B8D5]'
                    : 'border-[#E1EBF0] hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={item.value}
                  checked={type === item.value}
                  onChange={() => setType(item.value)}
                  className="mt-1 text-[#20B8D5] focus:ring-[#20B8D5]"
                />
                <div>
                  <div className="text-xs font-bold text-[#123B5D]">{item.label}</div>
                  <div className="text-[11px] text-[#718493] mt-0.5 leading-snug">{item.desc}</div>
                </div>
              </label>
            ))}
          </div>

          {/* SECCAO PROEMINENTE: FOTOGRAFIA DA OCORRENCIA */}
          <div className="pt-4 border-t border-[#E1EBF0] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#123B5D] uppercase tracking-wider flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#20B8D5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Fotografia da Fuga (Opcional ou Recomendado)
                </h3>
                <p className="text-[11px] text-[#718493] mt-0.5">
                  Anexa uma imagem para a equipa avaliar o calibre da conduta antes de sair.
                </p>
              </div>
              <span className="text-[11px] text-[#20B8D5] font-semibold bg-[#E8F6FA] px-2 py-0.5 rounded-full">
                {photos.length}/3 fotos
              </span>
            </div>

            {/* Botoes de Acao de Fotografia */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={photos.length >= 3 || compressing}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-[#20B8D5] bg-[#E8F6FA] text-[#123B5D] hover:bg-[#d5eff6] transition-colors font-bold text-xs shadow-2xs"
              >
                <svg className="w-4 h-4 text-[#20B8D5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Tirar Foto (Câmara)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photos.length >= 3 || compressing}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-[#E1EBF0] bg-white text-[#243746] hover:bg-slate-50 transition-colors font-bold text-xs shadow-2xs"
              >
                <svg className="w-4 h-4 text-[#718493]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Escolher da Galeria</span>
              </button>
            </div>

            {/* Zona de Arrastar ou Visualizar Fotos */}
            {photos.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-5 border-2 border-dashed border-[#20B8D5]/40 hover:border-[#20B8D5] rounded-2xl bg-[#F5FAFC] flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
              >
                <svg className="w-8 h-8 text-[#20B8D5]/70 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs font-bold text-[#123B5D]">
                  {compressing ? 'A comprimir fotografia...' : 'Carregar imagem da fuga'}
                </p>
                <p className="text-[11px] text-[#718493] mt-0.5">
                  Toca aqui ou num dos botões acima para juntar fotos à tua denúncia.
                </p>
                <span className="mt-2 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Compressão automática activa: poupa dados móveis da tua recarga
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2.5">
                  {photos.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative h-24 rounded-xl overflow-hidden border border-[#E1EBF0] shadow-2xs group"
                    >
                      <img src={src} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-xs"
                      >
                        ✕
                      </button>
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-sm">
                        Foto {idx + 1}
                      </span>
                    </div>
                  ))}

                  {photos.length < 3 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-24 rounded-xl border-2 border-dashed border-[#20B8D5]/50 hover:border-[#20B8D5] bg-[#F5FAFC] flex flex-col items-center justify-center text-center p-2 transition-colors"
                    >
                      <span className="text-lg text-[#20B8D5] font-bold">+</span>
                      <span className="text-[10px] font-semibold text-[#123B5D]">Mais foto</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#718493] pt-1">
                  <span>{photos.length} de 3 imagens adicionadas.</span>
                  <span className="text-emerald-600 font-medium">Imagens optimizadas com sucesso</span>
                </div>
              </div>
            )}
          </div>

          {/* Factores de gravidade para priorizacao automatica */}
          <div className="pt-4 border-t border-[#E1EBF0] space-y-2.5">
            <h3 className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">
              Factores de gravidade observados
            </h3>

            <label className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F5FAFC] cursor-pointer">
              <input
                type="checkbox"
                checked={floodingRoad}
                onChange={(e) => setFloodingRoad(e.target.checked)}
                className="w-4 h-4 rounded text-[#20B8D5]"
              />
              <span className="text-xs font-medium text-[#243746]">
                A água está a alagar ou a invadir a via pública
              </span>
            </label>

            <label className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F5FAFC] cursor-pointer">
              <input
                type="checkbox"
                checked={highVolume}
                onChange={(e) => setHighVolume(e.target.checked)}
                className="w-4 h-4 rounded text-[#20B8D5]"
              />
              <span className="text-xs font-medium text-[#243746]">
                Volume aparente muito elevado de água potável
              </span>
            </label>

            <label className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F5FAFC] cursor-pointer">
              <input
                type="checkbox"
                checked={nearBusyRoad}
                onChange={(e) => setNearBusyRoad(e.target.checked)}
                className="w-4 h-4 rounded text-[#20B8D5]"
              />
              <span className="text-xs font-medium text-[#243746]">
                Próximo de estrada movimentada ou paragem de chapa
              </span>
            </label>

            <label className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F5FAFC] cursor-pointer">
              <input
                type="checkbox"
                checked={infrastructureRisk}
                onChange={(e) => setInfrastructureRisk(e.target.checked)}
                className="w-4 h-4 rounded text-[#20B8D5]"
              />
              <span className="text-xs font-medium text-[#243746]">
                Risco de danificar muros, habitações ou postes
              </span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#123B5D] mb-1">
              Notas adicionais (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Exemplo: Fuga perto da bomba de combustivel, comecou nas primeiras horas da manha..."
              rows={2}
              className="w-full text-xs p-3 rounded-xl border border-[#E1EBF0] focus:outline-hidden focus:border-[#20B8D5]"
            />
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full bg-[#20B8D5] hover:bg-[#19a1bb] text-white font-bold py-3.5 rounded-full text-xs transition-colors shadow-xs"
          >
            Avançar para Localização
          </button>
        </div>
      )}

      {/* PASSO 2: LOCALIZACAO COM MAPA INTERACTIVO E SELECCAO DE BAIRRO */}
      {step === 2 && (
        <div className="apple-card p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#123B5D] mb-1">Onde está localizada a fuga?</h2>
            <p className="text-xs text-[#718493]">
              Podes obter a posição GPS do telemóvel, escolher no mapa ou indicar o bairro abaixo.
            </p>
          </div>

          {/* Botao de GPS do telemovel */}
          <button
            type="button"
            onClick={handleGetGps}
            disabled={gpsLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#E8F6FA] text-[#123B5D] font-bold text-xs border border-[#20B8D5]/30 hover:bg-[#d6f0f7] transition-colors"
          >
            <svg className="w-4 h-4 text-[#20B8D5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{gpsLoading ? 'A obter posição GPS...' : 'Usar a minha localização GPS actual'}</span>
          </button>

          {gpsError && (
            <p className="text-xs text-[#D94848] bg-red-50 p-2.5 rounded-xl border border-red-100">
              {gpsError}
            </p>
          )}

          {/* Mini-mapa selector com Leaflet */}
          <div>
            <label className="block text-xs font-semibold text-[#123B5D] mb-1.5">
              Toca no mapa ou arrasta o pino azul para afinar a posição
            </label>
            <InteractiveMap
              height="250px"
              isPicker
              center={[latitude, longitude]}
              onLocationPick={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
                setIsGpsAccurate(true);
              }}
            />
          </div>

          {/* Campos de morada e bairro */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#123B5D] mb-1">
                  Cidade / Município *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E1EBF0] bg-white focus:outline-hidden focus:border-[#20B8D5]"
                >
                  <option value="Maputo">Maputo</option>
                  <option value="Matola">Matola</option>
                  <option value="Beira">Beira</option>
                  <option value="Nampula">Nampula</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123B5D] mb-1">
                  Bairro *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Polana Caniço B, Maxaquene..."
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E1EBF0] focus:outline-hidden focus:border-[#20B8D5]"
                />
              </div>
            </div>

            {/* Bairros de escolha rapida */}
            <div>
              <span className="text-[11px] text-[#718493] font-medium block mb-1">
                Sugestões rápidas de bairro:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_NEIGHBORHOODS.slice(0, 6).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setNeighborhood(b)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                      neighborhood === b
                        ? 'bg-[#20B8D5] text-white border-[#20B8D5]'
                        : 'bg-slate-50 text-[#718493] border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#123B5D] mb-1">
                Rua ou Avenida
              </label>
              <input
                type="text"
                placeholder="Ex: Av. Vladimir Lenine, Rua 4..."
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#E1EBF0] focus:outline-hidden focus:border-[#20B8D5]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#123B5D] mb-1">
                Ponto de referência
              </label>
              <input
                type="text"
                placeholder="Ex: Perto da bomba de combustível, frente à escola..."
                value={referencePoint}
                onChange={(e) => setReferencePoint(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#E1EBF0] focus:outline-hidden focus:border-[#20B8D5]"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-3 rounded-full text-xs font-semibold border border-[#E1EBF0] text-[#718493] hover:bg-slate-50 transition-colors"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={() => {
                if (!neighborhood.trim()) {
                  alert('Por favor, indica pelo menos o bairro onde a fuga está localizada.');
                  return;
                }
                setStep(3);
              }}
              className="flex-2 bg-[#20B8D5] hover:bg-[#19a1bb] text-white font-bold py-3 rounded-full text-xs transition-colors shadow-xs"
            >
              Avançar para Confirmação
            </button>
          </div>
        </div>
      )}

      {/* PASSO 3: CONFIRMACAO, FOTOS ANEXADAS E CONTACTO */}
      {step === 3 && (
        <div className="apple-card p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#123B5D] mb-1">Confirmação dos Dados</h2>
            <p className="text-xs text-[#718493]">
              Revê as informações antes de submeter a ocorrência ao sistema.
            </p>
          </div>

          <div className="bg-[#F5FAFC] p-4 rounded-2xl border border-[#E1EBF0] space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-[#E1EBF0]">
              <span className="text-[#718493]">Tipo de fuga:</span>
              <span className="font-bold text-[#123B5D] capitalize">{type.replace(/_/g, ' ')}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#E1EBF0]">
              <span className="text-[#718493]">Bairro e Cidade:</span>
              <span className="font-bold text-[#123B5D]">{neighborhood}, {city}</span>
            </div>

            {street && (
              <div className="flex justify-between py-1 border-b border-[#E1EBF0]">
                <span className="text-[#718493]">Rua:</span>
                <span className="font-bold text-[#123B5D]">{street}</span>
              </div>
            )}

            {referencePoint && (
              <div className="flex justify-between py-1 border-b border-[#E1EBF0]">
                <span className="text-[#718493]">Ponto de referência:</span>
                <span className="font-bold text-[#123B5D]">{referencePoint}</span>
              </div>
            )}

            <div className="flex justify-between py-1 border-b border-[#E1EBF0]">
              <span className="text-[#718493]">Gravidade assinalada:</span>
              <span className="font-bold text-[#123B5D]">
                {floodingRoad || highVolume || nearBusyRoad || infrastructureRisk
                  ? 'Factores de gravidade indicados'
                  : 'Normal'}
              </span>
            </div>

            {/* Miniatura das Fotografias Carregadas */}
            <div className="py-1">
              <span className="text-[#718493] block mb-2">Fotografias anexadas ({photos.length}):</span>
              {photos.length > 0 ? (
                <div className="flex gap-2">
                  {photos.map((src, i) => (
                    <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-[#E1EBF0]">
                      <img src={src} alt="Miniatura" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[11px]">Nenhuma foto anexada.</span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[#20B8D5] font-bold text-[11px] underline"
                  >
                    Adicionar foto agora
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Contacto do denunciante (opcional) */}
          <div className="pt-2 space-y-3">
            <div>
              <h3 className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">
                Contacto para esclarecimentos (opcional)
              </h3>
              <p className="text-[11px] text-[#718493]">
                O teu número não será público no mapa. Serve apenas se a equipa precisar de orientação na rua.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#123B5D] mb-1">O teu nome</label>
                <input
                  type="text"
                  placeholder="Ex: Alberto Sitoe"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E1EBF0] focus:outline-hidden focus:border-[#20B8D5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123B5D] mb-1">Telemóvel</label>
                <input
                  type="tel"
                  placeholder="+258 84 000 0000"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E1EBF0] focus:outline-hidden focus:border-[#20B8D5]"
                />
              </div>
            </div>
          </div>

          {submitError && (
            <p className="text-xs text-[#D94848] bg-red-50 p-3 rounded-xl border border-red-100">
              {submitError}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={submitting}
              className="flex-1 py-3 rounded-full text-xs font-semibold border border-[#E1EBF0] text-[#718493] hover:bg-slate-50 transition-colors"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-2 bg-[#20B8D5] hover:bg-[#19a1bb] text-white font-bold py-3 rounded-full text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              {submitting ? 'A submeter ocorrência...' : 'Submeter Denúncia'}
            </button>
          </div>
        </div>
      )}

      {/* PASSO 4: SUCESSO E CODIGO DE RASTREIO */}
      {step === 4 && createdOccurrence && (
        <div className="apple-card p-6 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#123B5D]">
              A denúncia foi registada com sucesso.
            </h2>
            <p className="text-xs text-[#718493] mt-1 max-w-sm mx-auto">
              A ocorrência aguarda análise preliminar e foi encaminhada para a entidade da zona.
            </p>
          </div>

          <div className="bg-[#F5FAFC] p-4 rounded-2xl border border-[#E1EBF0] max-w-md mx-auto text-left space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#718493]">Código de rastreio:</span>
              <span className="font-mono font-bold text-[#123B5D] text-sm">
                {createdOccurrence.code}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#718493]">Localização:</span>
              <span className="font-semibold text-[#123B5D]">
                {createdOccurrence.location.neighborhood}, {createdOccurrence.location.city}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#718493]">Prioridade calculada:</span>
              <span className="font-semibold text-[#20B8D5] capitalize">
                {createdOccurrence.priority}
              </span>
            </div>
            {createdOccurrence.assignedCompanyName && (
              <div className="flex justify-between items-center">
                <span className="text-[#718493]">Entidade da zona:</span>
                <span className="font-semibold text-[#123B5D]">
                  {createdOccurrence.assignedCompanyName}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-[#718493]">Fotos enviadas:</span>
              <span className="font-semibold text-[#123B5D]">
                {createdOccurrence.photos?.length || 0} fotografia(s)
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href={`/ocorrencias/${createdOccurrence.id}`}
              className="bg-[#20B8D5] hover:bg-[#19a1bb] text-white font-bold px-6 py-3 rounded-full text-xs transition-colors shadow-xs"
            >
              Acompanhar esta Ocorrência
            </Link>
            <Link
              href="/mapa"
              className="bg-white hover:bg-slate-50 text-[#123B5D] border border-[#E1EBF0] font-semibold px-6 py-3 rounded-full text-xs transition-colors"
            >
              Ver no Mapa Geral
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
