import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase, calculatePriority, detectDuplicates, logAudit } from '../../../lib/db';
import { getCurrentUser } from '../../../lib/auth';
import { Occurrence, OccurrenceType, StatusHistoryEntry } from '../../../types';

const typeLabelMap: Record<OccurrenceType, string> = {
  tubagem_rompida: 'Tubagem rompida',
  fuga_visivel: 'Fuga visível',
  agua_alagar_via: 'Água a alagar a via pública',
  fuga_residencia: 'Fuga junto a residência',
  fuga_subterranea: 'Possível fuga subterrânea',
  outro: 'Outro problema de água',
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase();
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const neighborhood = searchParams.get('neighborhood')?.toLowerCase();
    const companyId = searchParams.get('companyId');

    const db = getDatabase();
    let results = [...db.occurrences];

    if (status && status !== 'todos') {
      results = results.filter((o) => o.status === status);
    }

    if (type && type !== 'todos') {
      results = results.filter((o) => o.type === type);
    }

    const normalize = (val: string) =>
      val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

    if (neighborhood && neighborhood !== 'todos') {
      const normN = normalize(neighborhood);
      results = results.filter((o) => normalize(o.location.neighborhood).includes(normN));
    }

    if (companyId) {
      results = results.filter((o) => o.assignedCompanyId === companyId);
    }

    if (search && search.trim()) {
      const normS = normalize(search);
      results = results.filter(
        (o) =>
          normalize(o.code).includes(normS) ||
          normalize(o.location.neighborhood).includes(normS) ||
          normalize(o.location.city).includes(normS) ||
          normalize(o.typeLabel).includes(normS) ||
          (o.description && normalize(o.description).includes(normS))
      );
    }

    // Ordenar pelas mais recentes
    results.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());

    return NextResponse.json({ occurrences: results });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao carregar ocorrências.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      type,
      description,
      location,
      photos = [],
      reporterContact,
      floodingRoad = false,
      highVolume = false,
      nearBusyRoad = false,
      infrastructureRisk = false,
    } = body;

    if (!type || !location || !location.neighborhood) {
      return NextResponse.json(
        { error: 'Por favor, indica o tipo de problema e a localização (bairro obrigatório).' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const currentUser = await getCurrentUser();

    // 1. Cálculo da prioridade transparente e explicável
    const priorityCalc = calculatePriority({
      type: type as OccurrenceType,
      floodingRoad: Boolean(floodingRoad),
      highVolume: Boolean(highVolume),
      nearBusyRoad: Boolean(nearBusyRoad),
      infrastructureRisk: Boolean(infrastructureRisk),
    });

    // 2. Deteção de denúncias duplicadas na proximidade
    const duplicates = detectDuplicates(
      location.neighborhood,
      type as OccurrenceType,
      location.latitude,
      location.longitude
    );

    // 3. Atribuição à empresa responsável pela zona
    let assignedCompanyId: string | undefined;
    let assignedCompanyName: string | undefined;

    const matchedCompany = db.companies.find(
      (c) =>
        c.status === 'verificada' &&
        c.serviceAreas.some(
          (area) =>
            area.toLowerCase().includes(location.neighborhood.toLowerCase()) ||
            location.neighborhood.toLowerCase().includes(area.toLowerCase())
        )
    );

    if (matchedCompany) {
      assignedCompanyId = matchedCompany.id;
      assignedCompanyName = matchedCompany.officialName;
    }

    // 4. Criação do registo da ocorrência
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `GOTA-2026-${randomSuffix}`;
    const occId = `occ_${Date.now()}`;
    const now = new Date().toISOString();

    const reporterName = reporterContact?.name || currentUser?.name || 'Cidadão';
    const reporterRole = currentUser?.role || 'cidadao';

    const initialHistoryEntry: StatusHistoryEntry = {
      id: `hist_${Date.now()}`,
      previousStatus: null,
      newStatus: 'recebida',
      changedBy: `${reporterName} (${reporterRole === 'cidadao' ? 'Cidadão' : 'Utilizador'})`,
      changedByRole: reporterRole,
      note: 'Ocorrência comunicada através da plataforma Gota.',
      timestamp: now,
    };

    const newOccurrence: Occurrence = {
      id: occId,
      code,
      type: type as OccurrenceType,
      typeLabel: typeLabelMap[type as OccurrenceType] || 'Problema de água',
      description: description || '',
      status: 'recebida',
      priority: priorityCalc.priority,
      priorityNeedsConfirmation: priorityCalc.needsConfirmation,
      priorityReason: priorityCalc.reason,
      location: {
        latitude: location.latitude || -25.9537,
        longitude: location.longitude || 32.5887,
        province: location.province || 'Maputo Cidade',
        city: location.city || 'Maputo',
        neighborhood: location.neighborhood,
        street: location.street || '',
        referencePoint: location.referencePoint || '',
        isGpsAccurate: Boolean(location.isGpsAccurate),
      },
      photos: Array.isArray(photos) ? photos : [],
      reporterContact: {
        name: reporterContact?.name || currentUser?.name,
        phone: reporterContact?.phone || currentUser?.phone,
        userId: currentUser?.id,
      },
      assignedCompanyId,
      assignedCompanyName,
      reportedAt: now,
      history: [initialHistoryEntry],
    };

    db.occurrences.unshift(newOccurrence);
    saveDatabase(db);

    // Registar acção na auditoria
    logAudit(
      currentUser?.id || 'anon',
      reporterName,
      reporterRole,
      'CRIAR_OCORRENCIA',
      'ocorrencia',
      newOccurrence.id,
      `Nova ocorrência ${newOccurrence.code} registada no bairro ${newOccurrence.location.neighborhood}.`
    );

    return NextResponse.json({
      success: true,
      occurrence: newOccurrence,
      possibleDuplicatesCount: duplicates.length,
    });
  } catch (err: any) {
    console.error('Erro ao submeter ocorrência:', err);
    return NextResponse.json({ error: 'Não foi possível registar a ocorrência.' }, { status: 500 });
  }
}
