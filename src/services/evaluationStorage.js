const STORAGE_KEYS = {
  VERSION: 'steam-storage-version',
  VISITOR_NAME: 'steam-visitor-name',
  VISITED: 'steam-visitados',
  RATINGS: 'steam-avaliacoes',
  COMMENTS: 'steam-comentarios',
  EVALUATIONS: 'steam-room-evaluations',
};

const STORAGE_VERSION = '2026-09-17-v1';

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

    localStorage.setItem(STORAGE_KEYS.VERSION, STORAGE_VERSION);
  }
}

export function getVisitorName() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEYS.VISITOR_NAME) || '';
}

export function setVisitorName(name) {
  if (typeof window === 'undefined') return '';
  const trimmed = (name || '').trim();
  localStorage.setItem(STORAGE_KEYS.VISITOR_NAME, trimmed);
  return trimmed;
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
  const evaluations = getAllEvaluations();
  const now = new Date().toISOString();

  const existingIndex = evaluations.findIndex((item) => item.roomId === roomId);
  const evaluationRecord = {
    id: roomId,
    roomId,
    roomTitle: roomTitle || roomId,
    visitorName: currentVisitor,
    rating: Number(rating),
    comment: (comment || '').trim(),
    updatedAt: now,
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

  syncEvaluationRemote(evaluationRecord).catch(() => {});

  return evaluationRecord;
}

export function getEvaluationSummary(totalRoomsCount = 9) {
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

  const headers = ['ID da Sala', 'Nome do Espaço', 'Visitante', 'Nota (1 a 5)', 'Comentário', 'Data e Hora'];
  const rows = evaluations.map((item) => [
    `"${item.roomId}"`,
    `"${(item.roomTitle || '').replace(/"/g, '""')}"`,
    `"${(item.visitorName || '').replace(/"/g, '""')}"`,
    item.rating,
    `"${(item.comment || '').replace(/"/g, '""')}"`,
    `"${new Date(item.updatedAt).toLocaleString('pt-BR')}"`,
  ]);

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

export async function syncEvaluationRemote(evaluation) {
  try {
    const apiUrl = import.meta.env.VITE_EVALUATIONS_API_URL || '/api/evaluations';
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evaluation),
    });
    if (response.ok) {
      return await response.json();
    }
  } catch {
    return null;
  }
}
