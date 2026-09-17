/**
 * Vercel Serverless Function para recebimento e sincronização de avaliações das salas.
 * Endpoint: POST /api/evaluations
 */
export default async function handler(req, res) {
  // Configuração CORS para permitir requisições de origens autorizadas
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Diagnóstico e teste de conexão acessível pelo navegador via GET
  if (req.method === 'GET') {
    const webhookUrl = process.env.WEBHOOK_URL;
    const webhookSecretConfigured = Boolean(process.env.EVALUATIONS_WEBHOOK_SECRET);

    if (!webhookUrl) {
      return res.status(200).json({
        status: 'warning',
        webhookConfigured: false,
        message: 'A variável WEBHOOK_URL não está configurada na Vercel (Project Settings > Environment Variables).',
        instruction: '1. No painel da Vercel, acesse Project Settings > Environment Variables. 2. Crie a chave WEBHOOK_URL com a URL da sua implantação do Apps Script (/exec). 3. Realize um Redeploy da aplicação na Vercel.'
      });
    }

    try {
      const pingRes = await fetch(webhookUrl, {
        method: 'GET',
        redirect: 'follow',
      });
      const pingText = await pingRes.text().catch(() => '');
      let parsedJson = null;
      try {
        parsedJson = JSON.parse(pingText);
      } catch {
        // Resposta em texto/HTML
      }

      return res.status(200).json({
        status: pingRes.ok ? 'connected' : 'google_error',
        webhookConfigured: true,
        webhookUrlMasked: webhookUrl.replace(/\/s\/[^/]+/, '/s/AKfy...'),
        webhookSecretConfigured,
        googleHttpStatus: pingRes.status,
        googleResponseBody: parsedJson || pingText.substring(0, 300),
        message: pingRes.ok
          ? 'Conexão com o Google Apps Script está ativa e respondendo com sucesso!'
          : 'O Google Apps Script foi contatado, mas retornou status não-OK. Verifique se a implantação está configurada com: Quem tem acesso = Qualquer pessoa.'
      });
    } catch (pingErr) {
      return res.status(200).json({
        status: 'connection_failed',
        webhookConfigured: true,
        webhookUrlMasked: webhookUrl.replace(/\/s\/[^/]+/, '/s/AKfy...'),
        error: pingErr.message,
        message: 'Não foi possível conectar ao Google Apps Script. Verifique se a URL da implantação está correta.'
      });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST ou GET (diagnóstico).' });
  }

  try {
    const RATING_LABELS = {
      1: 'Ruim',
      2: 'Regular',
      3: 'Boa',
      4: 'Muito boa',
      5: 'Excelente',
    };

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    } else if (!body) {
      body = {};
    }

    const {
      roomId,
      roomTitle,
      visitorName,
      visitorEmail,
      visitorId,
      evaluationId,
      rating,
      ratingLabel,
      comment,
      clientUpdatedAt,
    } = body;

    // 1. Validação de roomId
    if (!roomId || typeof roomId !== 'string' || roomId.trim().length === 0 || roomId.length > 50) {
      return res.status(400).json({ error: 'Campo roomId inválido ou ausente (máximo 50 caracteres).' });
    }

    // 2. Validação de rating (nota inteira de 1 a 5 ou rótulo textual)
    let numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      const matchKey = Object.keys(RATING_LABELS).find(
        (key) => RATING_LABELS[key].toLowerCase() === String(rating || ratingLabel || '').toLowerCase()
      );
      if (matchKey) {
        numRating = Number(matchKey);
      } else {
        return res.status(400).json({ error: 'Campo rating inválido: informe um número inteiro de 1 a 5.' });
      }
    }

    // 3. Sanitização e limites razoáveis de texto
    const cleanRoomId = roomId.trim();
    const cleanVisitorId = typeof visitorId === 'string' && visitorId.trim()
      ? visitorId.trim().substring(0, 100)
      : 'anonymous';
    const cleanEvaluationId = typeof evaluationId === 'string' && evaluationId.trim()
      ? evaluationId.trim().substring(0, 150)
      : `${cleanVisitorId}_${cleanRoomId}`;
    const cleanVisitorName = typeof visitorName === 'string' && visitorName.trim()
      ? visitorName.trim().substring(0, 100)
      : 'Visitante';
    const cleanVisitorEmail = typeof visitorEmail === 'string' && visitorEmail.trim()
      ? visitorEmail.trim().substring(0, 100)
      : '';
    const cleanRoomTitle = typeof roomTitle === 'string' && roomTitle.trim()
      ? roomTitle.trim().substring(0, 150)
      : cleanRoomId;
    const cleanRatingLabel = typeof ratingLabel === 'string' && ratingLabel.trim()
      ? ratingLabel.trim().substring(0, 50)
      : (RATING_LABELS[numRating] || String(numRating));
    const cleanComment = typeof comment === 'string'
      ? comment.trim().substring(0, 1000)
      : '';
    const cleanClientUpdatedAt = typeof clientUpdatedAt === 'string' && clientUpdatedAt.trim()
      ? clientUpdatedAt.trim()
      : new Date().toISOString();

    const evaluationRecord = {
      evaluationId: cleanEvaluationId,
      visitorId: cleanVisitorId,
      visitorName: cleanVisitorName,
      visitorEmail: cleanVisitorEmail,
      roomId: cleanRoomId,
      roomTitle: cleanRoomTitle,
      rating: cleanRatingLabel,
      ratingNumber: numRating,
      ratingLabel: cleanRatingLabel,
      comment: cleanComment,
      clientUpdatedAt: cleanClientUpdatedAt,
      receivedAt: new Date().toISOString(),
    };

    // 4. Encaminhamento para o Google Apps Script (se WEBHOOK_URL configurado na Vercel)
    const webhookUrl = process.env.WEBHOOK_URL;
    const webhookSecret = process.env.EVALUATIONS_WEBHOOK_SECRET || '';
    let syncedToGoogleSheets = false;
    let syncWarning = null;

    if (webhookUrl) {
      const webhookPayload = {
        ...evaluationRecord,
        rating: cleanRatingLabel,
        ratingLabel: cleanRatingLabel,
        ratingNumber: numRating,
        secret: webhookSecret,
      };

      const webhookHeaders = {
        'Content-Type': 'application/json',
      };
      if (webhookSecret) {
        webhookHeaders['x-webhook-secret'] = webhookSecret;
      }

      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: webhookHeaders,
          body: JSON.stringify(webhookPayload),
          redirect: 'follow',
        });

        if (!webhookResponse.ok) {
          const errorText = await webhookResponse.text().catch(() => '');
          console.error(`Erro retornado pelo Google Apps Script (HTTP ${webhookResponse.status}):`, errorText);
          syncWarning = `Google Apps Script retornou HTTP ${webhookResponse.status}: ${errorText.substring(0, 150)}`;
        } else {
          syncedToGoogleSheets = true;
        }
      } catch (webhookErr) {
        console.error('Falha de conexão com o webhook do Google Apps Script:', webhookErr);
        syncWarning = `Falha de conexão com o Apps Script: ${webhookErr.message}`;
      }
    } else {
      syncWarning = 'A variável de ambiente WEBHOOK_URL não está configurada no painel da Vercel (Project Settings > Environment Variables).';
      console.warn(syncWarning);
    }

    return res.status(200).json({
      success: true,
      syncedToGoogleSheets,
      warning: syncWarning || undefined,
      message: syncedToGoogleSheets
        ? 'Avaliação registrada e sincronizada com a planilha com sucesso.'
        : 'Avaliação recebida pelo servidor, mas pendente de envio para a planilha: ' + syncWarning,
      data: evaluationRecord,
    });
  } catch (err) {
    console.error('Erro interno no processamento da avaliação:', err);
    return res.status(500).json({ error: 'Erro interno ao registrar avaliação.' });
  }
}
