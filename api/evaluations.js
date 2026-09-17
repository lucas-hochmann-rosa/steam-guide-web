/**
 * Vercel Serverless Function para recebimento e sincronização de avaliações das salas.
 * Endpoint: POST /api/evaluations
 */
export default async function handler(req, res) {
  // Configuração CORS para permitir requisições de origens autorizadas
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { roomId, roomTitle, visitorName, rating, comment, updatedAt } = req.body || {};

      if (!roomId || !rating) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes: roomId e rating são necessários.' });
      }

      const evaluationRecord = {
        roomId,
        roomTitle: roomTitle || roomId,
        visitorName: visitorName || 'Visitante anônimo',
        rating: Number(rating),
        comment: comment || '',
        receivedAt: new Date().toISOString(),
        clientUpdatedAt: updatedAt || new Date().toISOString(),
      };

      // Se houver um WEBHOOK_URL configurado (ex: Google Sheets via Google Apps Script ou Supabase/Discord)
      if (process.env.WEBHOOK_URL) {
        try {
          await fetch(process.env.WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(evaluationRecord),
          });
        } catch (webhookErr) {
          console.error('Falha ao encaminhar avaliação para o webhook:', webhookErr);
        }
      }

      console.log('Avaliação recebida:', evaluationRecord);

      return res.status(200).json({
        success: true,
        message: 'Avaliação registrada com sucesso.',
        data: evaluationRecord,
      });
    } catch (err) {
      console.error('Erro ao processar avaliação:', err);
      return res.status(500).json({ error: 'Erro interno ao registrar avaliação.' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
