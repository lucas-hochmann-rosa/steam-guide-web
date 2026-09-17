import React from 'react';
import { exportEvaluationsAsCsv, exportEvaluationsAsJson } from '../services/evaluationStorage';

export default function EvaluationsModal({ isOpen, onClose, evaluations = [], rooms = [] }) {
  if (!isOpen) return null;

  const totalCount = rooms.length;
  const evaluatedCount = evaluations.length;
  const avgRating = evaluatedCount > 0
    ? (evaluations.reduce((acc, curr) => acc + (curr.rating || 0), 0) / evaluatedCount).toFixed(1)
    : '0.0';

  return (
    <div
      className="evaluations-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evaluations-title"
      onClick={onClose}
    >
      <div className="evaluations-card" onClick={(e) => e.stopPropagation()}>
        <div className="evaluations-head">
          <div>
            <span className="eyebrow dark">REGISTRO DE VISITAÃ‡ÃƒO</span>
            <h2 id="evaluations-title">AvaliaÃ§Ãµes das Salas</h2>
          </div>
          <button className="evaluations-close" onClick={onClose} aria-label="Fechar painel">
            Ã-
          </button>
        </div>

        <div className="evaluations-body">
          <div className="evaluations-summary-bar">
            <div>
              <strong>{evaluatedCount} / {totalCount}</strong>
              <small>Salas avaliadas</small>
            </div>
            <div>
              <strong>â˜… {avgRating}</strong>
              <small>MÃ©dia das notas</small>
            </div>
            <div>
              <strong>{Math.round((evaluatedCount / totalCount) * 100)}%</strong>
              <small>Progresso do percurso</small>
            </div>
          </div>

          {evaluations.length === 0 ? (
            <div className="evaluations-empty">
              <p>Nenhuma sala foi avaliada ainda neste dispositivo.</p>
              <small>Conforme vocÃª visitar os espaÃ§os e atribuir estrelas, as avaliaÃ§Ãµes serÃ£o salvas aqui.</small>
            </div>
          ) : (
            <div className="evaluations-list">
              {evaluations.map((ev) => (
                <div key={ev.roomId} className="eval-item">
                  <div className="eval-item-head">
                    <h4>{ev.roomTitle || ev.roomId}</h4>
                    <span className="eval-stars">
                      {'â˜…'.repeat(ev.rating || 0)}{'â˜†'.repeat(5 - (ev.rating || 0))}
                    </span>
                  </div>
                  {ev.comment && (
                    <p className="eval-comment">"{ev.comment}"</p>
                  )}
                  <div className="eval-meta">
                    Registrado por <strong>{ev.visitorName || 'Visitante'}</strong> em{' '}
                    {new Date(ev.updatedAt).toLocaleString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="evaluations-footer">
          <div className="evaluations-export-group">
            <button
              className="eval-btn-export"
              onClick={exportEvaluationsAsCsv}
              disabled={evaluations.length === 0}
              title="Baixar planilha CSV para Excel / Google Sheets"
            >
              ðŸ“¥ Exportar CSV
            </button>
            <button
              className="eval-btn-export"
              onClick={exportEvaluationsAsJson}
              disabled={evaluations.length === 0}
              title="Baixar arquivo JSON com todos os dados"
            >
              ðŸ“„ Exportar JSON
            </button>
          </div>

          <button className="eval-btn-primary" onClick={onClose}>
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}

