import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase, logAudit } from '../../../lib/db';
import { getCurrentUser } from '../../../lib/auth';
import { CompanyStatus } from '../../../types';

export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso restrito à administração.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'stats';
    const db = getDatabase();

    if (action === 'export') {
      // Exportação em formato CSV
      const headers = [
        'Código',
        'Tipo',
        'Estado',
        'Prioridade',
        'Bairro',
        'Cidade',
        'Empresa Atribuída',
        'Data Comunicação',
        'Data Resolução',
      ];

      const rows = db.occurrences.map((o) => [
        o.code,
        `"${o.typeLabel}"`,
        o.status,
        o.priority,
        `"${o.location.neighborhood}"`,
        `"${o.location.city}"`,
        `"${o.assignedCompanyName || 'Não atribuída'}"`,
        o.reportedAt,
        o.resolvedAt || 'Pendente',
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="ocorrencias_gota.csv"',
        },
      });
    }

    if (action === 'audit') {
      return NextResponse.json({ auditLogs: db.auditLogs });
    }

    // Estatísticas da plataforma
    const totalOccurrences = db.occurrences.length;
    const resolvedCount = db.occurrences.filter((o) => o.status === 'resolvida' || o.status === 'encerrada').length;
    const criticalCount = db.occurrences.filter((o) => o.priority === 'critica').length;
    const pendingCompanies = db.companies.filter((c) => c.status === 'pendente').length;
    const totalCompanies = db.companies.length;

    // Calcular tempo médio de primeira resposta (em horas) com dados reais
    let totalResponseHours = 0;
    let responseCount = 0;
    db.occurrences.forEach((o) => {
      if (o.firstResponseAt && o.reportedAt) {
        const diffMs = new Date(o.firstResponseAt).getTime() - new Date(o.reportedAt).getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours >= 0) {
          totalResponseHours += diffHours;
          responseCount++;
        }
      }
    });

    const avgResponseTimeHours = responseCount > 0 ? (totalResponseHours / responseCount).toFixed(1) : null;

    // Detecção de denúncias sem actualização há mais de 48h
    const now = Date.now();
    const staleOccurrences = db.occurrences.filter((o) => {
      if (o.status === 'resolvida' || o.status === 'encerrada' || o.status === 'rejeitada') {
        return false;
      }
      const reportedTime = new Date(o.reportedAt).getTime();
      return (now - reportedTime) > 48 * 60 * 60 * 1000;
    });

    return NextResponse.json({
      stats: {
        totalOccurrences,
        resolvedCount,
        criticalCount,
        pendingCompanies,
        totalCompanies,
        avgResponseTimeHours,
        staleOccurrencesCount: staleOccurrences.length,
      },
      staleOccurrences,
      companies: db.companies,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao carregar dados administrativos.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso restrito à administração.' }, { status: 403 });
    }

    const body = await req.json();
    const { companyId, status, rejectionReason } = body;

    if (!companyId || !status) {
      return NextResponse.json({ error: 'Dados da empresa incompletos.' }, { status: 400 });
    }

    const db = getDatabase();
    const cIndex = db.companies.findIndex((c) => c.id === companyId);

    if (cIndex === -1) {
      return NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 404 });
    }

    const prevStatus = db.companies[cIndex].status;
    db.companies[cIndex].status = status as CompanyStatus;

    if (status === 'verificada') {
      db.companies[cIndex].verifiedAt = new Date().toISOString();
      db.companies[cIndex].verifiedBy = `${currentUser.name} (Administração)`;
    } else if (status === 'rejeitada') {
      db.companies[cIndex].rejectionReason = rejectionReason || 'Documentação incompleta ou não confirmada.';
    }

    saveDatabase(db);

    logAudit(
      currentUser.id,
      currentUser.name,
      'admin',
      'MODERAR_EMPRESA',
      'empresa',
      companyId,
      `Estado da empresa ${db.companies[cIndex].officialName} alterado de ${prevStatus} para ${status}.`
    );

    return NextResponse.json({ success: true, company: db.companies[cIndex] });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao actualizar empresa.' }, { status: 500 });
  }
}
