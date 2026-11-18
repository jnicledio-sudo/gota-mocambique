'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Occurrence } from '../types';
import 'leaflet/dist/leaflet.css';

interface InteractiveMapProps {
  occurrences?: Occurrence[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  isPicker?: boolean;
  selectedOccurrenceId?: string | null;
  onLocationPick?: (lat: number, lng: number) => void;
  onOccurrenceSelect?: (occ: Occurrence) => void;
}

export default function InteractiveMap({
  occurrences = [],
  center = [-25.9537, 32.5887], // Centro de Maputo
  zoom = 13,
  height = '440px',
  isPicker = false,
  selectedOccurrenceId = null,
  onLocationPick,
  onOccurrenceSelect,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const pickerMarkerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  // 1. Inicializar o mapa apenas uma vez na montagem
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;
      if (!isMounted || !mapContainerRef.current) return;

      leafletRef.current = L;

      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Camada base OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors, Gota',
        maxZoom: 19,
      }).addTo(map);

      // Grupo de camadas para os marcadores de ocorrencias
      const markersGroup = L.featureGroup().addTo(map);
      markersLayerRef.current = markersGroup;

      setMapReady(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        pickerMarkerRef.current = null;
      }
    };
  }, []);

  // 2. Modo Selector de Localizacao (Picker)
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !leafletRef.current || !isPicker) return;

    const L = leafletRef.current;
    const map = mapInstanceRef.current;

    if (!pickerMarkerRef.current) {
      const pickerIcon = L.divIcon({
        className: 'custom-picker-pin',
        html: `
          <div style="background-color: #20B8D5; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; cursor: grab;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const picker = L.marker(center, {
        icon: pickerIcon,
        draggable: true,
      }).addTo(map);

      picker.on('dragend', () => {
        const pos = picker.getLatLng();
        if (onLocationPick) onLocationPick(pos.lat, pos.lng);
      });

      map.on('click', (e: any) => {
        picker.setLatLng(e.latlng);
        if (onLocationPick) onLocationPick(e.latlng.lat, e.latlng.lng);
      });

      pickerMarkerRef.current = picker;
    } else {
      pickerMarkerRef.current.setLatLng(center);
      map.panTo(center);
    }
  }, [mapReady, isPicker, center]);

  // 3. Atualizar e sincronizar marcadores quando a lista de ocorrencias mudar
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !leafletRef.current || isPicker) return;

    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;

    if (!markersGroup) return;

    // Limpar marcadores anteriores para permitir filtro dinamico
    markersGroup.clearLayers();

    if (occurrences.length === 0) {
      return;
    }

    occurrences.forEach((occ) => {
      let pinColor = '#20B8D5'; // Azul (registada ou em analise)
      let statusText = 'Registada';

      if (occ.priority === 'critica' || occ.status === 'rejeitada') {
        pinColor = '#D94848'; // Vermelho
        statusText = 'Urgente';
      } else if (occ.status === 'em_resolucao' || occ.status === 'intervencao_programada') {
        pinColor = '#E5A23C'; // Laranja
        statusText = 'Em curso';
      } else if (occ.status === 'resolvida' || occ.status === 'encerrada') {
        pinColor = '#62D6BE'; // Verde
        statusText = 'Resolvida';
      }

      const isSelected = selectedOccurrenceId === occ.id;
      const markerSize = isSelected ? 34 : 28;
      const borderSize = isSelected ? 3 : 2.5;

      const icon = L.divIcon({
        className: 'custom-occ-marker',
        html: `
          <div style="background-color: ${pinColor}; width: ${markerSize}px; height: ${markerSize}px; border-radius: 50%; border: ${borderSize}px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; cursor: pointer; transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'}; transition: transform 0.2s ease;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: white;"></div>
          </div>
        `,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize],
      });

      const marker = L.marker([occ.location.latitude, occ.location.longitude], {
        icon,
        title: `${occ.typeLabel}, ${occ.location.neighborhood}`,
      });

      const popupHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; max-width: 230px; padding: 3px;">
          <div style="font-weight: 700; color: #123B5D; margin-bottom: 2px;">${occ.typeLabel}</div>
          <div style="color: #718493; font-size: 11px; margin-bottom: 6px;">${occ.location.neighborhood}, ${occ.location.city}</div>
          <div style="margin-bottom: 6px;">
            <span style="background: ${pinColor}20; color: ${pinColor}; border: 1px solid ${pinColor}40; padding: 2px 7px; border-radius: 999px; font-size: 10px; font-weight: 600;">
              ${statusText}
            </span>
          </div>
          <div style="color: #243746; font-size: 11px; line-height: 1.35; margin-bottom: 8px;">
            ${occ.description ? (occ.description.length > 75 ? occ.description.substring(0, 75) + '...' : occ.description) : 'Sem notas adicionais'}
          </div>
          <a href="/ocorrencias/${occ.id}" style="display: block; text-align: center; background: #123B5D; color: white; text-decoration: none; padding: 5px 10px; border-radius: 8px; font-size: 11px; font-weight: 600;">
            Ver detalhes da ocorrencia
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onOccurrenceSelect) {
          onOccurrenceSelect(occ);
        }
      });

      markersGroup.addLayer(marker);

      if (isSelected) {
        marker.openPopup();
      }
    });

    // Ajustar o zoom da camara para enquadrar perfeitamente as ocorrencias filtradas
    if (occurrences.length === 1) {
      map.flyTo([occurrences[0].location.latitude, occurrences[0].location.longitude], 15, {
        duration: 0.8,
      });
    } else if (occurrences.length > 1) {
      const bounds = markersGroup.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
      }
    }
  }, [mapReady, occurrences, isPicker, selectedOccurrenceId]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#E1EBF0] shadow-xs">
      <div ref={mapContainerRef} style={{ width: '100%', height }} className="z-0" />

      {/* Legenda de cores sobre o mapa */}
      <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-xl border border-[#E1EBF0] shadow-sm text-[11px] flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 font-medium text-[#243746]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D94848]" />
          <span>Urgente / Critica</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-[#243746]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#20B8D5]" />
          <span>Registada / Em analise</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-[#243746]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E5A23C]" />
          <span>Intervencao em curso</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-[#243746]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#62D6BE]" />
          <span>Resolvida</span>
        </div>
      </div>
    </div>
  );
}
