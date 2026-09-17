import React from 'react';
import { assetPath } from '../utils/assetPath';

export default function Footer({ onOpenEvaluations }) {
  return (
    <footer>
      <div className="footer-lockup">
        <img
          src={assetPath('/assets/logotipo-escola-sesi-branco.png')}
          alt="Escola SESI"
        />
      </div>
      <p>Guia Digital Â· Mostra STEAM 2026</p>
      {onOpenEvaluations && (
        <button
          onClick={onOpenEvaluations}
          style={{
            background: 'none',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            color: '#dceaf3',
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          Exportar AvaliaÃ§Ãµes â†-
        </button>
      )}
    </footer>
  );
}

