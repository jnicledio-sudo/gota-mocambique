# Gota — Plataforma de Comunicação e Monitorização de Fugas de Água

> "Cada gota conta. Cada ocorrência importa."

A **Gota** é uma aplicação web mobile-first dedicada à comunicação, localização geográfica, gestão e acompanhamento da reparação de fugas de água em zonas urbanas de Moçambique.

---

## Principais Funcionalidades

1. **Identidade Visual e Experiência Mobile-First:**
   - Paleta cristalina baseada em Azul profundo (`#123B5D`), Azul cristalino (`#20B8D5`) e Verde-água (`#62D6BE`).
   - Símbolo SVG original com animação fluida de flutuação e ondulação, compatível com preferência por movimento reduzido (`prefers-reduced-motion`).
   - Barra de navegação inferior permanente em dispositivos móveis (`Início`, `Mapa`, `Comunicar`, `Ocorrências`, `Perfil`).

2. **Comunicação Guiada de Fugas (`/comunicar`):**
   - Registo em passos simples: Selecção de tipo de fuga, factores de gravidade, geolocalização com botão GPS, selecção interactiva de ponto no mapa e introdução manual (bairro, rua e ponto de referência).
   - Carregamento de fotografias com compressão automática em Canvas para poupar dados móveis.
   - Contacto opcional do comunicante mantido privado (nunca exposto no mapa público).
   - Cálculo automático e explicável de prioridade (Baixa, Média, Alta, Crítica).
   - Geração de código único de rastreio (ex.: `GOTA-2026-1042`).

3. **Mapa Interactivo e Directório (`/mapa` e `/ocorrencias`):**
   - Mapa Leaflet com OpenStreetMap (sem dependência de APIs pagas).
   - Marcadores com cores acessíveis (Vermelho: crítica/urgente, Azul: registada, Laranja: intervenção em curso, Verde: resolvida) e etiquetas textuais.
   - Alternância rápida entre vista de mapa e vista de lista.
   - Filtros por estado, tipo de fuga e bairro.

4. **Acompanhamento e Cronologia Pública (`/ocorrencias/[id]`):**
   - Histórico oficial de cada ocorrência com data, hora, entidade responsável, notas técnicas e comprovativo fotográfico de reparação.
   - Distinção clara entre «Marcada como resolvida» e «Resolução verificada».

5. **Três Tipos de Utilizadores:**
   - **Cidadão (`/cidadao`):** Painel pessoal com denúncias comunicadas, ocorrências em acompanhamento, resolvidas e mapa de ocorrências próximas.
   - **Empresa Fornecedora (`/empresa`):** Painel técnico com indicadores de fila de trabalho, métricas de tempo de resposta real, alertas de atraso (>48h) e atribuição de brigadas.
   - **Administrador (`/admin`):** Moderação institucional de concessionárias (aprovar, rejeitar, suspender), registos de auditoria imutáveis, acompanhamento de atrasos e exportação de relatórios em CSV.

6. **Barra de Teste Rápido do Protótipo:**
   - No topo de todas as páginas, permite alternar com um clique entre as contas de demonstração: Joaquim Sitoe (Cidadão), Eng. Alberto Munguambe (FIPAG) e Carla Mondlane (Admin).

---

## Tecnologias Utilizadas

- **Framework Web:** Next.js 16 (App Router com Turbopack)
- **Linguagem:** TypeScript
- **Interface:** React 19 + Tailwind CSS
- **Mapas:** Leaflet + OpenStreetMap
- **Persistência de Dados:** Motor local JSON (`data/gota-db.json`) leve, atómico e sem necessidade de servidores externos ou bases de dados pagas.

---

## Como Executar o Projecto

1. **Instalar dependências (caso necessário):**
   ```bash
   npm install
   ```

2. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Abrir no navegador:**
   - Acede a: `http://localhost:3000`

4. **Compilar para produção:**
   ```bash
   npm run build
   npm run start
   ```

---

## Contas de Demonstração Pré-Configuradas

- **Cidadão:** Joaquim Sitoe (`joaquim.sitoe@exemplo.mz`)
- **Empresa (FIPAG):** Eng. Alberto Munguambe (`operacoes@fipag-maputo.co.mz`)
- **Administrador:** Carla Mondlane (`admin@gota.org.mz`)
