import React from 'react';

export default function CompletionModal({ onClose, onGoSurvey }) {
  return (
    <div
      className="completion-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-title"
      onClick={onClose}
    >
      <section onClick={(event) => event.stopPropagation()}>
        <button
          className="completion-close"
          onClick={onClose}
          aria-label="Fechar aviso"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <span>100% DO PERCURSO</span>
        <h2 id="completion-title">Você concluiu sua visita!</h2>
        <p>Compartilhe sua experiência e ajude a construir as próximas edições da Mostra STEAM.</p>
        <button
          className="completion-action"
          onClick={() => {
            onClose();
            onGoSurvey();
          }}
        >
          Responder questionário
        </button>
      </section>
    </div>
  );
}
