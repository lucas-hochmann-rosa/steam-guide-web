import React from 'react';

export default function BottomNav({ currentView, onNavigate, onOpenScanner }) {
  return (
    <nav className="bottom-nav" aria-label="Navegação mobile">
      <button
        className={currentView === 'inicio' ? 'active' : ''}
        onClick={() => onNavigate('inicio')}
      >
        <span>⌂</span>Início
      </button>

      <button
        className={currentView === 'programacao' ? 'active' : ''}
        onClick={() => onNavigate('programacao')}
      >
        <span>✓</span>Percurso
      </button>

      <button className="qr-nav" onClick={onOpenScanner} aria-label="Abrir leitor de QR Code">
        <span>▦</span>
        <b>Ler QR Code</b>
      </button>

      <button
        className={currentView === 'mapa' ? 'active' : ''}
        onClick={() => onNavigate('mapa')}
      >
        <span>⌖</span>Mapa
      </button>

      <button
        className={currentView === 'mais' ? 'active' : ''}
        onClick={() => onNavigate('mais')}
      >
        <span>✦</span>STEAM
      </button>
    </nav>
  );
}
