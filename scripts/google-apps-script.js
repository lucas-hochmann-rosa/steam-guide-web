/**
 * GOOGLE APPS SCRIPT - MOSTRA STEAM 2026 (ESCOLA SESI CHAPECÓ)
 *
 * Este script atua como um Web App (Webhook) para receber avaliações das salas
 * enviadas pelo endpoint seguro da Vercel (/api/evaluations) e sincronizá-las
 * na aba 'Avaliações', atualizando registros existentes sem duplicar.
 */

const SHEET_NAME = 'Avaliações';
const HEADERS = [
  'ID da avaliação',
  'Data e hora',
  'ID do visitante',
  'Nome do visitante',
  'ID da sala',
  'Sala / Espaço',
  'Avaliação',
  'Comentário'
];

/**
 * Ponto de entrada para requisições POST enviadas pela Vercel
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // Evita concorrência entre envios simultâneos aguardando até 10s
    lock.waitLock(10000);

    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: 'Corpo da requisição vazio.' }, 400);
    }

    let payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse({ success: false, error: 'JSON inválido.' }, 400);
    }

    // 1. Validação do segredo compartilhado (se configurado nas Propriedades do Script)
    const scriptProperties = PropertiesService.getScriptProperties();
    const expectedSecret = scriptProperties.getProperty('EVALUATIONS_WEBHOOK_SECRET');
    if (expectedSecret) {
      const providedSecret = payload.secret;
      if (!providedSecret || providedSecret !== expectedSecret) {
        return jsonResponse({ success: false, error: 'Acesso não autorizado: segredo incorreto.' }, 401);
      }
    }

    // 2. Validação dos dados essenciais
    const roomId = String(payload.roomId || '').trim();
    const rating = Number(payload.rating);

    const RATING_LABELS = {
      1: 'Ruim',
      2: 'Regular',
      3: 'Boa',
      4: 'Muito boa',
      5: 'Excelente'
    };

    const displayRating = String(
      payload.ratingLabel || RATING_LABELS[rating] || payload.rating || ''
    ).trim();

    if (!roomId || !displayRating) {
      return jsonResponse({ success: false, error: 'Dados inválidos: roomId e avaliação são obrigatórios.' }, 400);
    }

    const visitorId = String(payload.visitorId || 'anonymous').trim();
    const evaluationId = String(payload.evaluationId || (visitorId + '_' + roomId)).trim();
    const visitorName = String(payload.visitorName || 'Visitante').trim();
    const roomTitle = String(payload.roomTitle || roomId).trim();
    const comment = String(payload.comment || '').trim();

    // Data e hora no fuso horário de Brasília
    const now = new Date();
    const formattedDate = Utilities.formatDate(now, 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm:ss');

    // 3. Localizar ou inicializar a aba 'Avaliações'
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      formatHeaderRow(sheet);
    } else if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      formatHeaderRow(sheet);
    }

    // 4. Verificar se a avaliação já existe (pelo evaluationId na Coluna A)
    const data = sheet.getDataRange().getValues();
    let existingRowIndex = -1;

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === evaluationId) {
        existingRowIndex = i + 1; // 1-indexed para SpreadsheetApp
        break;
      }
    }

    if (existingRowIndex > 0) {
      // 5. ATUALIZAÇÃO: Se o mesmo visitante reavaliar a sala, atualiza a linha existente
      sheet.getRange(existingRowIndex, 1, 1, HEADERS.length).setValues([[
        evaluationId,
        formattedDate,
        visitorId,
        visitorName,
        roomId,
        roomTitle,
        displayRating,
        comment
      ]]);

      return jsonResponse({
        success: true,
        action: 'updated',
        evaluationId: evaluationId,
        message: 'Avaliação atualizada com sucesso na planilha.'
      }, 200);
    } else {
      // 6. INSERÇÃO: Nova avaliação
      sheet.appendRow([
        evaluationId,
        formattedDate,
        visitorId,
        visitorName,
        roomId,
        roomTitle,
        displayRating,
        comment
      ]);

      return jsonResponse({
        success: true,
        action: 'inserted',
        evaluationId: evaluationId,
        message: 'Avaliação registrada com sucesso na planilha.'
      }, 200);
    }

  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() }, 500);
  } finally {
    try {
      lock.releaseLock();
    } catch (e) {}
  }
}

/**
 * Endpoint de teste simples via GET no navegador
 */
function doGet(e) {
  return jsonResponse({
    status: 'online',
    service: 'Mostra STEAM 2026 - Endpoint de Avaliações',
    sheet: SHEET_NAME,
    timestamp: new Date().toISOString()
  }, 200);
}

/**
 * Função utilitária para resposta em formato JSON
 */
function jsonResponse(obj, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Estiliza a linha de cabeçalho na planilha
 */
function formatHeaderRow(sheet) {
  const range = sheet.getRange(1, 1, 1, HEADERS.length);
  range.setFontWeight('bold');
  range.setBackground('#102A43');
  range.setFontColor('#ffffff');
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, HEADERS.length);
}

/**
 * Adiciona menu no topo da planilha do Google ao abrir o arquivo
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Mostra STEAM 2026')
    .addItem('Gerar / Atualizar Aba de Resultados e Gráficos', 'criarAbaResultados')
    .addToUi();
}

/**
 * Cria a aba 'Resultados' com tabelas sumarizadas, fórmulas dinâmicas e gráficos
 */
function criarAbaResultados() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheetResultados = ss.getSheetByName('Resultados');
  if (!sheetResultados) {
    sheetResultados = ss.insertSheet('Resultados');
  } else {
    sheetResultados.clear();
  }

  // Título do Dashboard
  sheetResultados.getRange('A1:C1').merge();
  sheetResultados.getRange('A1').setValue('DASHBOARD DE RESULTADOS - MOSTRA STEAM 2026')
    .setFontWeight('bold')
    .setFontSize(13)
    .setBackground('#0754A6')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center');

  // Tabela 1: Distribuição de Satisfação (Geral)
  const satisfacao = [
    ['Avaliação', 'Total de Votos'],
    ['Excelente', '=COUNTIF(Avaliações!G2:G, "Excelente") + COUNTIF(Avaliações!G2:G, 5)'],
    ['Muito boa', '=COUNTIF(Avaliações!G2:G, "Muito boa") + COUNTIF(Avaliações!G2:G, 4)'],
    ['Boa', '=COUNTIF(Avaliações!G2:G, "Boa") + COUNTIF(Avaliações!G2:G, 3)'],
    ['Regular', '=COUNTIF(Avaliações!G2:G, "Regular") + COUNTIF(Avaliações!G2:G, 2)'],
    ['Ruim', '=COUNTIF(Avaliações!G2:G, "Ruim") + COUNTIF(Avaliações!G2:G, 1)'],
    ['Total Geral', '=SUM(B4:B8)']
  ];
  sheetResultados.getRange('A3:B9').setValues(satisfacao);
  sheetResultados.getRange('A3:B3').setFontWeight('bold').setBackground('#102A43').setFontColor('#ffffff');
  sheetResultados.getRange('A9:B9').setFontWeight('bold').setBackground('#e9f3f9');

  // Tabela 2: Resumo de Avaliações por Sala / Espaço Oficial da Mostra
  const salas = [
    ['ID da Sala', 'Espaço / Sala', 'Total de Avaliações'],
    ['f-08', 'Galeria de arte', '=COUNTIF(Avaliações!E2:E, "f-08")'],
    ['f-13', 'Globalização em Arte: Arte, Geografia e Inglês', '=COUNTIF(Avaliações!E2:E, "f-13")'],
    ['f-01-f-02', 'Jogos, desafios, charadas e enigmas matemáticos', '=COUNTIF(Avaliações!E2:E, "f-01-f-02")'],
    ['f-05', 'Engenheiro por um dia', '=COUNTIF(Avaliações!E2:E, "f-05")'],
    ['a-19', 'O Caminho dos Direitos', '=COUNTIF(Avaliações!E2:E, "a-19")'],
    ['f-20', 'Atividades De física', '=COUNTIF(Avaliações!E2:E, "f-20")'],
    ['b-03-b-04', 'Experimentos no laboratório', '=COUNTIF(Avaliações!E2:E, "b-03-b-04")'],
    ['corredor-f', 'Oficina de fotografia e audiovisual', '=COUNTIF(Avaliações!E2:E, "corredor-f")'],
    ['f-09', 'West Sharks FTC: robô da temporada BIOBUZZ', '=COUNTIF(Avaliações!E2:E, "f-09")'],
    ['quadra', 'Prática de movimento e integração', '=COUNTIF(Avaliações!E2:E, "quadra")']
  ];
  sheetResultados.getRange('A12:C22').setValues(salas);
  sheetResultados.getRange('A12:C12').setFontWeight('bold').setBackground('#227C47').setFontColor('#ffffff');

  // Remove gráficos antigos se já existirem na aba
  const existingCharts = sheetResultados.getCharts();
  for (let i = 0; i < existingCharts.length; i++) {
    sheetResultados.removeChart(existingCharts[i]);
  }

  // Gráfico 1: Distribuição de Satisfação (Gráfico de Colunas)
  const chartRangeSatisfacao = sheetResultados.getRange('A3:B8');
  const chartSatisfacao = sheetResultados.newChart()
    .asColumnChart()
    .addRange(chartRangeSatisfacao)
    .setPosition(3, 5, 0, 0)
    .setOption('title', 'Distribuição de Satisfação dos Visitantes')
    .setOption('colors', ['#0754A6'])
    .setOption('legend', { position: 'none' })
    .setOption('hAxis', { title: 'Avaliação' })
    .setOption('vAxis', { title: 'Total de Votos', minValue: 0 })
    .build();

  sheetResultados.insertChart(chartSatisfacao);

  // Gráfico 2: Participação por Espaço (Gráfico de Barras Horizontais)
  const chartRangeSalas = sheetResultados.getRange('B12:C22');
  const chartSalas = sheetResultados.newChart()
    .asBarChart()
    .addRange(chartRangeSalas)
    .setPosition(20, 5, 0, 0)
    .setOption('title', 'Avaliações Registradas por Espaço')
    .setOption('colors', ['#227C47'])
    .setOption('legend', { position: 'none' })
    .setOption('hAxis', { title: 'Quantidade de Avaliações', minValue: 0 })
    .build();

  sheetResultados.insertChart(chartSalas);

  sheetResultados.autoResizeColumns(1, 3);
}
