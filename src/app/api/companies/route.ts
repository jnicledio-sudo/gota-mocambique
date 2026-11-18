import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase, logAudit } from '../../../lib/db';
import { getCurrentUser } from '../../../lib/auth';
import { Company } from '../../../types';

export async function GET() {
  try {
    const db = getDatabase();
    const currentUser = await getCurrentUser();

    // Administradores podem ver todas; visitantes e cidadãos apenas vêem verificadas
    if (currentUser?.role === 'admin') {
      return NextResponse.json({ companies: db.companies });
    }

    const publicCompanies = db.companies.filter((c) => c.status === 'verificada');
    return NextResponse.json({ companies: publicCompanies });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao listar empresas.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      officialName,
      nuit,
      address,
      province,
      city,
      phone,
      email,
      representativeName,
      serviceAreas = [],
      servicesDescription,
    } = body;

    if (!officialName || !email || !phone || !representativeName) {
      return NextResponse.json(
        { error: 'Por favor, preenche todos os campos obrigatórios da empresa.' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const currentUser = await getCurrentUser();

    const companyId = `comp_${Date.now()}`;
    const newCompany: Company = {
      id: companyId,
      officialName,
      nuit: nuit || '',
      address: address || '',
      province: province || 'Maputo Cidade',
      city: city || 'Maputo',
      phone,
      email,
      representativeName,
      serviceAreas: Array.isArray(serviceAreas) ? serviceAreas : [serviceAreas],
      servicesDescription: servicesDescription || '',
      status: 'pendente', // Obrigatoriamente pendente até revisão da administração
      createdAt: new Date().toISOString(),
    };

    db.companies.push(newCompany);

    // Se houver utilizador logado e for papel empresa, associar ao ID desta empresa
    if (currentUser) {
      const uIndex = db.users.findIndex((u) => u.id === currentUser.id);
      if (uIndex !== -1) {
        db.users[uIndex].companyId = companyId;
        db.users[uIndex].role = 'empresa';
      }
    }

    saveDatabase(db);

    logAudit(
      currentUser?.id || 'anon_org',
      representativeName,
      'empresa',
      'REGISTO_INSTITUCIONAL',
      'empresa',
      companyId,
      `Nova empresa institucional registada: ${officialName} (${city}). Aguarda validação administrativa.`
    );

    return NextResponse.json({ success: true, company: newCompany });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao registar a empresa.' }, { status: 500 });
  }
}
