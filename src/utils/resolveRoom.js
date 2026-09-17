/**
 * Identifica e normaliza o ID da sala a partir de qualquer entrada (URL completa, parâmetro ou texto lido).
 */
export function resolveRoomId(rawInput, roomsList = []) {
  if (!rawInput || typeof rawInput !== 'string') return null;
  const text = rawInput.trim();

  // 1. Se for uma URL completa ou query string (?local=... ou ?sala=...)
  try {
    let urlObj = null;
    if (text.startsWith('http://') || text.startsWith('https://')) {
      urlObj = new URL(text);
    } else if (text.includes('?') || text.startsWith('/?')) {
      urlObj = new URL(text, 'https://dummy.local');
    }

    if (urlObj) {
      const param =
        urlObj.searchParams.get('local') ||
        urlObj.searchParams.get('sala') ||
        urlObj.searchParams.get('room') ||
        urlObj.searchParams.get('id');
      if (param) {
        const matchFromParam = resolveRoomId(param, roomsList);
        if (matchFromParam) return matchFromParam;
      }

      if (urlObj.hash) {
        const hashVal = urlObj.hash.replace('#', '');
        const matchFromHash = resolveRoomId(hashVal, roomsList);
        if (matchFromHash) return matchFromHash;
      }

      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      for (const part of pathParts) {
        const matchFromPath = resolveRoomId(part, roomsList);
        if (matchFromPath) return matchFromPath;
      }
    }
  } catch {}

  // 2. Normalização de texto
  const clean = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  // Correspondência exata por ID
  const direct = roomsList.find((r) => r.id.toLowerCase() === clean);
  if (direct) return direct.id;

  // Sem hífens/espaços (ex: "f20" -> "f-20", "a19" -> "a-19", "f08" -> "f-08")
  const alphanumericOnly = clean.replace(/[^a-z0-9]/g, '');
  const unhyphen = roomsList.find((r) => r.id.replace(/[^a-z0-9]/g, '') === alphanumericOnly);
  if (unhyphen) return unhyphen.id;

  // Por nome da sala ("Sala A-19", "Sala F-20", "Sala F08", "Quadra")
  const byRoomName = roomsList.find((r) => {
    const rName = r.room.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return rName === clean || clean.includes(rName) || rName.includes(clean);
  });
  if (byRoomName) return byRoomName.id;

  // Por título ("Atividades De física", "O Caminho dos Direitos", "Engenheiro por um dia")
  const byTitle = roomsList.find((r) => {
    const rTitle = r.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return clean.includes(rTitle) || (clean.length >= 5 && rTitle.includes(clean));
  });
  if (byTitle) return byTitle.id;

  // Palavras-chave específicas
  if (clean.includes('fisica')) return 'f-20';
  if (clean.includes('direito') || clean.includes('caminho')) return 'a-19';
  if (clean.includes('matematica') || clean.includes('enigma') || clean.includes('charada')) return 'f-01-f-02';
  if (clean.includes('engenheiro')) return 'f-05';
  if (clean.includes('galeria') || (clean.includes('arte') && !clean.includes('globalizacao'))) return 'f-08';
  if (clean.includes('globalizacao')) return 'f-13';
  if (clean.includes('experimento') || clean.includes('laboratorio')) return 'b-03-b-04';
  if (clean.includes('fotografia') || clean.includes('audiovisual')) return 'corredor-f';
  if (clean.includes('shark') || clean.includes('biobuzz') || clean.includes('ftc')) return 'f-09';
  if (clean.includes('quadra') || clean.includes('movimento')) return 'quadra';

  return null;
}
