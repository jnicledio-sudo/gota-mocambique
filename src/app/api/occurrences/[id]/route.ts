import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase, logAudit } from '../../../../lib/db';
import { getCurrentUser } from '../../../../lib/auth';
import { OccurrenceStatus, StatusHistoryEntry } from '../../../../types';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDatabase();
    const occurrence = db.occurrences.find((o) => o.id === id || o.code === id);

    if (!occurrence) {
      return NextResponse.json({ error: 'Ocorrência não encontrada.' }, { status: 404 });
    }

    // Criar cópia pública sem dados sensíveis de contacto se quem consulta não for admin nem a empresa atribuída
    const currentUser = await getCurrentUser();
    const canViewPrivateContact =
      currentUser &&
      (currentUser.role === 'admin' ||
        (currentUser.role === 'empresa' && currentUser.companyId === occurrence.assignedCompanyId) ||
        (currentUser.role === 'cidadao' && occurrence.reporterContact?.userId === currentUser.id));

    const responseOcc = { ...occurrence };
    if (!canViewPrivateContact) {
      delete responseOcc.reporterContact;
    }

    return NextResponse.json({ occurrence: responseOcc });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao consultar ocorrência.' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Inicia sessão para actualizar esta ocorrência.' },
        { status: 401 }
      );
    }

    // Apenas empresas e administradores podem mudar o estado oficial
    if (currentUser.role === 'cidadao') {
      return NextResponse.json(
        { error: 'Apenas entidades autorizadas ou a administração podem alterar o estado oficial da ocorrência.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { newStatus, note, evidenceUrl, assignedTechnician, assignedCompanyId } = body;

    const db = getDatabase();
    const index = db.occurrences.findIndex((o) => o.id === id || o.code === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Ocorrência não encontrada.' }, { status: 404 });
    }

    const occ = db.occurrences[index];

    // Se for empresa, garantir que só gere ocorrências encaminhadas para ela
    if (currentUser.role === 'empresa' && occ.assignedCompanyId && occ.assignedCompanyId !== currentUser.companyId) {
      return NextResponse.json(
        { error: 'Esta ocorrência está sob gestão de outra empresa.' },
        { status: 403 }
      );
    }

    const previousStatus = occ.status;
    const now = new Date().toISOString();

    // Actualizar campos
    if (newStatus && newStatus !== previousStatus) {
      occ.status = newStatus as OccurrenceStatus;

      const historyEntry: StatusHistoryEntry = {
        id: `hist_${Date.now()}`,
        previousStatus,
        newStatus: newStatus as OccurrenceStatus,
        changedBy: currentUser.name,
        changedByRole: currentUser.role,
        note: note || `Estado actualizado para ${newStatus}.`,
        evidenceUrl: evidenceUrl || undefined,
        timestamp: now,
      };

      occ.history.unshift(historyEntry);

      if (newStatus === 'resolvida') {
        occ.resolvedAt = now;
      }
      if (!occ.firstResponseAt && (newStatus === 'em_resolucao' || newStatus === 'intervencao_programada')) {
        occ.firstResponseAt = now;
      }
    }

    if (assignedTechnician) {
      occ.assignedTechnician = assignedTechnician;
    }

    if (assignedCompanyId && currentUser.role === 'admin') {
      occ.assignedCompanyId = assignedCompanyId;
      const comp = db.companies.find((c) => c.id === assignedCompanyId);
      if (comp) occ.assignedCompanyName = comp.officialName;
    }

    db.occurrences[index] = occ;
    saveDatabase(db);

    // Auditoria
    logAudit(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'ACTUALIZAR_ESTADO',
      'ocorrencia',
      occ.id,
      `Estado da ocorrência ${occ.code} alterado de ${previousStatus} para ${occ.status}. Observação: ${note || 'N/A'}`
    );

    return NextResponse.json({ success: true, occurrence: occ });
  } catch (err: any) {
    console.error('Erro ao actualizar ocorrência:', err);
    return NextResponse.json({ error: 'Erro ao processar actualização.' }, { status: 500 });
  }
}
