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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST.' });
  }

  try {
    const RATING_LABELS = {
      1: 'Ruim',
      2: 'Regular',
      3: 'Boa',
      4: 'Muito boa',
      5: 'Excelente',
    };

    const body = req.body || {};
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
      rating: numRating,
      ratingLabel: cleanRatingLabel,
      comment: cleanComment,
      clientUpdatedAt: cleanClientUpdatedAt,
      receivedAt: new Date().toISOString(),
    };

    // 4. Encaminhamento para o Google Apps Script (se WEBHOOK_URL configurado na Vercel)
    const webhookUrl = process.env.WEBHOOK_URL;
    const webhookSecret = process.env.EVALUATIONS_WEBHOOK_SECRET || '';

    if (webhookUrl) {
      const webhookPayload = {
        ...evaluationRecord,
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
          return res.status(502).json({
            error: 'Falha ao sincronizar com a planilha central.',
            status: webhookResponse.status,
            details: errorText,
          });
        }
      } catch (webhookErr) {
        console.error('Falha de conexão com o webhook do Google Apps Script:', webhookErr);
        return res.status(502).json({
          error: 'Erro de conexão ao contatar a planilha central.',
          details: webhookErr.message,
        });
      }
    } else {
      console.warn('Variável de ambiente WEBHOOK_URL não configurada.');
    }

    return res.status(200).json({
      success: true,
      message: 'Avaliação processada com sucesso.',
      data: evaluationRecord,
    });
  } catch (err) {
    console.error('Erro interno no processamento da avaliação:', err);
    return res.status(500).json({ error: 'Erro interno ao registrar avaliação.' });
  }
}
