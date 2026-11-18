import { getDatabase, calculatePriority, detectDuplicates, logAudit } from '../src/lib/db.js';

// Verificação 1: Cálculo de Prioridade
console.log('--- Teste 1: Cálculo de Prioridade ---');
const crit = calculatePriority({
  type: 'tubagem_rompida',
  floodingRoad: true,
  highVolume: true,
  nearBusyRoad: true,
  infrastructureRisk: true,
});
console.log('Resultado prioridade extrema:', crit);
if (crit.priority !== 'critica') throw new Error('Falha no cálculo de prioridade crítica');

const media = calculatePriority({
  type: 'fuga_visivel',
  floodingRoad: false,
  highVolume: false,
  nearBusyRoad: false,
  infrastructureRisk: false,
});
console.log('Resultado fuga visível simples:', media);

// Verificação 2: Detecção de Duplicados
console.log('\n--- Teste 2: Deteção de Duplicados ---');
const dups = detectDuplicates('Polana Caniço B', 'tubagem_rompida', -25.9381, 32.5852);
console.log(`Encontrados ${dups.length} duplicados potenciais em Polana Caniço B.`);
if (dups.length === 0) throw new Error('Deveria ter encontrado a ocorrência já existente');

// Verificação 3: Base de Dados e Sementes
console.log('\n--- Teste 3: Base de Dados e Sementes ---');
const db = getDatabase();
console.log(`Utilizadores: ${db.users.length}`);
console.log(`Empresas: ${db.companies.length}`);
console.log(`Ocorrências: ${db.occurrences.length}`);
console.log(`Registos de Auditoria: ${db.auditLogs.length}`);

console.log('\n✓ Todos os testes de regras de negócio passaram com sucesso!');
