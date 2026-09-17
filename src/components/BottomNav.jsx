import React from 'react';

export default function BottomNav({ currentView, onNavigate, onOpenScanner }) {
  return (
    <nav className="bottom-nav" aria-label="NavegaÃ§Ã£o mobile">
      <button
        className={currentView === 'inicio' ? 'active' : ''}
        onClick={() => onNavigate('inicio')}
      >
        <span>âŒ‚</span>InÃ­cio
      </button>

      <button
        className={currentView === 'programacao' ? 'active' : ''}
        onClick={() => onNavigate('programacao')}
      >
        <span>âœ“</span>Percurso
      </button>

      <button className="qr-nav" onClick={onOpenScanner} aria-label="Abrir leitor de QR Code">
        <span>â-¦</span>
        <b>Ler QR Code</b>
      </button>

      <button
        className={currentView === 'mapa' ? 'active' : ''}
        onClick={() => onNavigate('mapa')}
      >
        <span>âŒ-</span>Mapa
      </button>

      <button
        className={currentView === 'mais' ? 'active' : ''}
        onClick={() => onNavigate('mais')}
      >
        <span>âœ¦</span>STEAM
      </button>
    </nav>
  );
}

