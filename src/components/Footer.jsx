import React from 'react';
import { assetPath } from '../utils/assetPath';

export default function Footer() {
  return (
    <footer>
      <div className="footer-lockup">
        <img
          src={assetPath('/assets/logotipo-escola-sesi-branco.png')}
          alt="Escola SESI"
        />
      </div>
      <p>Guia Digital · Mostra STEAM 2026</p>
    </footer>
  );
}
