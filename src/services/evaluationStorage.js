const STORAGE_KEYS = {
  VERSION: 'steam-storage-version',
  VISITOR_NAME: 'steam-visitor-name',
  VISITOR_ID: 'steam-visitor-id',
  VISITED: 'steam-visitados',
  RATINGS: 'steam-avaliacoes',
  COMMENTS: 'steam-comentarios',
  EVALUATIONS: 'steam-room-evaluations',
};

const STORAGE_VERSION = '2026-09-17-v2';

export const RATING_OPTIONS = [
  { value: 1, emoji: '🙁', label: 'Ruim' },
  { value: 2, emoji: '😐', label: 'Regular' },
  { value: 3, emoji: '🙂', label: 'Boa' },
  { value: 4, emoji: '😄', label: 'Muito boa' },
  { value: 5, emoji: '🤩', label: 'Excelente' },
];

export function getRatingInfo(rating) {
  const num = Math.round(Number(rating) || 0);
  return RATING_OPTIONS.find((opt) => opt.value === num) || null;
}

export function initializeStorage() {
  if (typeof window === 'undefined') return;

  const currentVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
  if (currentVersion !== STORAGE_VERSION) {
    const oldRatings = JSON.parse(localStorage.getItem(STORAGE_KEYS.RATINGS) || '{}');
    const oldComments = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS) || '{}');
    const visitor = localStorage.getItem(STORAGE_KEYS.VISITOR_NAME) || 'Visitante';

    if (Object.keys(oldRatings).length > 0 && !localStorage.getItem(STORAGE_KEYS.EVALUATIONS)) {
      const migrated = Object.entries(oldRatings).map(([roomId, rating]) => ({
        id: roomId,
        roomId,
        roomTitle: roomId,
        visitorName: visitor,
        rating: Number(rating),
        comment: oldComments[roomId] || '',
        updatedAt: new Date().toISOString(),
      }));
      localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(migrated));
    }

    // Migração de avaliações antigas onde F-20 era 'O Caminho dos Direitos' -> agora A-19
    const rawEvals = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
    if (rawEvals) {
      try {
        const evals = JSON.parse(rawEvals);
        let changed = false;
        const updated = evals.map((ev) => {
          if (ev.roomId === 'f-20' && ev.roomTitle && /caminho|direito/i.test(ev.roomTitle)) {
            changed = true;
            return {
              ...ev,
              roomId: 'a-19',
              roomTitle: 'O Caminho dos Direitos',
              evaluationId: ev.evaluationId ? ev.evaluationId.replace('_f-20', '_a-19') : `${ev.visitorId || 'v'}_a-19`,
              id: 'a-19',
            };
          }
          return ev;
        });
        if (changed) {
          localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(updated));
        }
      } catch {
        // Ignora erros de parse caso o storage esteja corrompido
      }
    }

    localStorage.setItem(STORAGE_KEYS.VERSION, STORAGE_VERSION);
  }
}

export function getVisitorName() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEYS.VISITOR_NAME) || '';
}

export function generateCleanVisitorId(name) {
  const cleanName = (name || 'visitante')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'visitante';

  const suffix = Math.random().toString(36).substring(2, 6);
  return `${cleanName}_${suffix}`;
}

export function setVisitorProfile(name) {
  if (typeof window === 'undefined') return { name: '', id: '' };
  const trimmedName = (name || '').trim();

  localStorage.setItem(STORAGE_KEYS.VISITOR_NAME, trimmedName);
  const cleanId = generateCleanVisitorId(trimmedName);
  localStorage.setItem(STORAGE_KEYS.VISITOR_ID, cleanId);

  return { name: trimmedName, id: cleanId };
}

export function setVisitorName(name) {
  return setVisitorProfile(name).name;
}

export function getVisitorId() {
  if (typeof window === 'undefined') return 'visitante_server';
  try {
    let id = localStorage.getItem(STORAGE_KEYS.VISITOR_ID);
    const name = getVisitorName();

    if (!id || id.startsWith('v_')) {
      id = generateCleanVisitorId(name);
      localStorage.setItem(STORAGE_KEYS.VISITOR_ID, id);
    }
    return id;
  } catch {
    return 'visitante_' + Date.now().toString(36);
  }
}

export function getVisitedRooms() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.VISITED) || '[]');
  } catch {
    return [];
  }
}

export function setVisitedRooms(visited) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.VISITED, JSON.stringify(visited));
}

export function getAllEvaluations() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
    if (raw) return JSON.parse(raw);

    const ratings = JSON.parse(localStorage.getItem(STORAGE_KEYS.RATINGS) || '{}');
    const comments = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS) || '{}');
    const visitor = getVisitorName() || 'Visitante';

    return Object.entries(ratings).map(([roomId, rating]) => ({
      id: roomId,
      roomId,
      roomTitle: roomId,
      visitorName: visitor,
      rating: Number(rating),
      comment: comments[roomId] || '',
      updatedAt: new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export function saveRoomEvaluation({ roomId, roomTitle, rating, comment, visitorName }) {
  if (typeof window === 'undefined') return null;

  const currentVisitor = visitorName || getVisitorName() || 'Visitante';
  const visitorId = getVisitorId();
  const evaluationId = `${visitorId}_${roomId}`;
  const evaluations = getAllEvaluations();
  const now = new Date().toISOString();
  const ratingInfo = getRatingInfo(rating);
  const ratingLabel = ratingInfo ? ratingInfo.label : String(rating);

  const existingIndex = evaluations.findIndex(
    (item) => item.evaluationId === evaluationId || item.roomId === roomId
  );

  const evaluationRecord = {
    id: evaluationId,
    evaluationId,
    visitorId,
    roomId,
    roomTitle: roomTitle || roomId,
    visitorName: currentVisitor,
    rating: Number(rating),
    ratingLabel,
    comment: (comment || '').trim(),
    clientUpdatedAt: now,
    updatedAt: now,
    syncStatus: 'pending',
  };

  if (existingIndex >= 0) {
    evaluations[existingIndex] = evaluationRecord;
  } else {
    evaluations.push(evaluationRecord);
  }

  localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations));

  try {
    const ratings = JSON.parse(localStorage.getItem(STORAGE_KEYS.RATINGS) || '{}');
    ratings[roomId] = Number(rating);
    localStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(ratings));

    const comments = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS) || '{}');
    if (comment) {
      comments[roomId] = comment.trim();
    }
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));

    const visited = getVisitedRooms();
    if (!visited.includes(roomId)) {
      visited.push(roomId);
      setVisitedRooms(visited);
    }
  } catch (err) {
    console.warn('Erro ao atualizar chaves legadas:', err);
  }

  // Tenta sincronizar imediatamente
  syncEvaluationRemote(evaluationRecord).catch(() => {});

  return evaluationRecord;
}

export function getEvaluationSummary(totalRoomsCount = 10) {
  const evaluations = getAllEvaluations();
  const totalEvaluated = evaluations.length;
  const averageRating = totalEvaluated > 0
    ? (evaluations.reduce((acc, curr) => acc + (curr.rating || 0), 0) / totalEvaluated).toFixed(1)
    : '0.0';

  return {
    totalEvaluated,
    totalRoomsCount,
    averageRating,
    completionPercentage: Math.round((totalEvaluated / totalRoomsCount) * 100),
  };
}

export function exportEvaluationsAsCsv() {
  const evaluations = getAllEvaluations();
  if (evaluations.length === 0) {
    alert('Nenhuma avaliação registrada ainda para exportar.');
    return;
  }

  const headers = ['ID da Sala', 'Nome do Espaço', 'Visitante', 'Avaliação', 'Nota (1 a 5)', 'Comentário', 'Data e Hora'];
  const rows = evaluations.map((item) => {
    const info = getRatingInfo(item.rating);
    const label = info ? `${info.emoji} ${info.label}` : '';
    return [
      `"${item.roomId}"`,
      `"${(item.roomTitle || '').replace(/"/g, '""')}"`,
      `"${(item.visitorName || '').replace(/"/g, '""')}"`,
      `"${label}"`,
      item.rating,
      `"${(item.comment || '').replace(/"/g, '""')}"`,
      `"${new Date(item.updatedAt).toLocaleString('pt-BR')}"`,
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `avaliacoes_mostra_steam_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportEvaluationsAsJson() {
  const evaluations = getAllEvaluations();
  if (evaluations.length === 0) {
    alert('Nenhuma avaliação registrada ainda para exportar.');
    return;
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    event: 'Mostra STEAM 2026 - Escola SESI Chapecó',
    totalEvaluations: evaluations.length,
    evaluations,
  };

  const jsonContent = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `avaliacoes_mostra_steam_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function markEvaluationSynced(evaluationId) {
  if (typeof window === 'undefined' || !evaluationId) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
    if (!raw) return;
    const evaluations = JSON.parse(raw);
    const item = evaluations.find(
      (ev) => ev.evaluationId === evaluationId || ev.id === evaluationId
    );
    if (item && item.syncStatus !== 'synced') {
      item.syncStatus = 'synced';
      localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations));
    }
  } catch (err) {
    console.warn('Erro ao marcar avaliação como sincronizada:', err);
  }
}

export async function syncEvaluationRemote(evaluation) {
  try {
    const apiUrl = import.meta.env.VITE_EVALUATIONS_API_URL || '/api/evaluations';
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evaluation),
    });

    if (response.ok) {
      const data = await response.json().catch(() => ({ success: true }));
      if (data && data.syncedToGoogleSheets !== false) {
        const targetId = evaluation.evaluationId || evaluation.id || `${evaluation.visitorId}_${evaluation.roomId}`;
        markEvaluationSynced(targetId);
      } else if (data && data.warning) {
        console.warn('Sincronização remota com a planilha pendente:', data.warning);
      }
      return data;
    }
  } catch (err) {
    console.warn('Falha na sincronização remota, registro mantido como pendente:', err);
  }
  return null;
}

let isSyncing = false;

export async function syncPendingEvaluations() {
  if (typeof window === 'undefined' || isSyncing) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;

  const evaluations = getAllEvaluations();
  const pending = evaluations.filter((ev) => ev.syncStatus !== 'synced');
  if (pending.length === 0) return;

  isSyncing = true;
  try {
    for (const item of pending) {
      await syncEvaluationRemote(item);
    }
  } finally {
    isSyncing = false;
  }
}
