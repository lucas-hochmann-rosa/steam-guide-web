/**
 * GOOGLE APPS SCRIPT - MOSTRA STEAM 2026 (ESCOLA SESI CHAPECÓ)
 * Planilha: https://docs.google.com/spreadsheets/d/1GTVgZJZq-fdd0U_OWGEyCQCkBbSX60QDCbsqCy8-mHM/edit
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
  'Nota',
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

    if (!roomId || isNaN(rating) || rating < 1 || rating > 5) {
      return jsonResponse({ success: false, error: 'Dados inválidos: roomId e rating (1 a 5) são obrigatórios.' }, 400);
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
        rating,
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
        rating,
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
 * Função opcional para gerar a aba 'Resultados' com fórmulas prontas
 * Pode ser executada no menu do Apps Script a qualquer momento pela coordenação!
 */
function criarAbaResultados() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheetResultados = ss.getSheetByName('Resultados');
  if (!sheetResultados) {
    sheetResultados = ss.insertSheet('Resultados');
  } else {
    sheetResultados.clear();
  }

  const cabecalho = [['DASHBOARD DE RESULTADOS - MOSTRA STEAM 2026', '']];
  sheetResultados.getRange('A1:B1').setValues(cabecalho);
  sheetResultados.getRange('A1:B1').setFontWeight('bold').setBackground('#0754A6').setFontColor('#ffffff');

  const metricasGerais = [
    ['Métrica', 'Valor'],
    ['Total de Avaliações Recebidas', '=COUNTA(Avaliações!A2:A)'],
    ['Média Geral das Notas (1 a 5)', '=IFERROR(AVERAGE(Avaliações!G2:G); "0.0")'],
    ['Notas 5 (Excelente)', '=COUNTIF(Avaliações!G2:G; 5)'],
    ['Notas 4 (Muito boa)', '=COUNTIF(Avaliações!G2:G; 4)'],
    ['Notas 3 (Boa)', '=COUNTIF(Avaliações!G2:G; 3)'],
    ['Notas 2 (Regular)', '=COUNTIF(Avaliações!G2:G; 2)'],
    ['Notas 1 (Ruim)', '=COUNTIF(Avaliações!G2:G; 1)'],
  ];
  sheetResultados.getRange('A3:B10').setValues(metricasGerais);
  sheetResultados.getRange('A3:B3').setFontWeight('bold').setBackground('#e5eceb');

  // Médias por Sala
  const salas = [
    ['ID da Sala', 'Espaço', 'Qtd. Avaliações', 'Média da Sala'],
    ['f-01-f-02', 'Robótica FIRST LEGO League e F1 in Schools', '=COUNTIF(Avaliações!E2:E; "f-01-f-02")', '=IFERROR(AVERAGEIF(Avaliações!E2:E; "f-01-f-02"; Avaliações!G2:G); "-")'],
    ['f-05', 'Física e Eletromagnetismo', '=COUNTIF(Avaliações!E2:E; "f-05")', '=IFERROR(AVERAGEIF(Avaliações!E2:E; "f-05"; Avaliações!G2:G); "-")'],
    ['f-08', 'Galeria de Arte e Linguagens', '=COUNTIF(Avaliações!E2:E; "f-08")', '=IFERROR(AVERAGEIF(Avaliações!E2:E; "f-08"; Avaliações!G2:G); "-")'],
    ['f-09', 'West Sharks FTC #24823', '=COUNTIF(Avaliações!E2:E; "f-09")', '=IFERROR(AVERAGEIF(Avaliações!E2:E; "f-09"; Avaliações!G2:G); "-")'],
    ['f-13', 'Biologia e Meio Ambiente', '=COUNTIF(Avaliações!E2:E; "f-13")', '=IFERROR(AVERAGEIF(Avaliações!E2:E; "f-13"; Avaliações!G2:G); "-")'],
    ['f-20', 'Matemática e Modelagem 3D', '=COUNTIF(Avaliações!E2:E; "f-20")', '=IFERROR(AVERAGEIF(Avaliações!E2:E; "f-20"; Avaliações!G2:G); "-")'],
    ['b-05', 'Química e Transformações de Materiais', '=COUNTIF(Avaliações!E2:E; "b-05")', '=IFERROR(AVERAGEIF(Avaliações!E2:E; "b-05"; Avaliações!G2:G); "-")'],
    ['b-07', 'Mundo do Trabalho e Empreendedorismo', '=COUNTIF(Avaliações!E2:E; "b-07")', '=IFERROR(AVERAGEIF(Avaliações!E2:E; "b-07"; Avaliações!G2:G); "-")'],
    ['a-maker', 'Espaço Maker e Inovação', '=COUNTIF(Avaliações!E2:E; "a-maker")', '=IFERROR(AVERAGEIF(Avaliações!E2:E; "a-maker"; Avaliações!G2:G); "-")'],
  ];
  sheetResultados.getRange('A13:D22').setValues(salas);
  sheetResultados.getRange('A13:D13').setFontWeight('bold').setBackground('#e5eceb');

  sheetResultados.autoResizeColumns(1, 4);
}
