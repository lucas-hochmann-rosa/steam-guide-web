import React, { useState } from 'react';
import { assetPath } from '../utils/assetPath';

export default function WelcomeModal({ onSaveName }) {
  const [draft, setDraft] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = draft.trim();
    if (!name) return;
    onSaveName(name);
  };

  return (
    <div className="welcome-screen" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <section className="welcome-card">
        <div className="welcome-brands">
          <img
            className="welcome-steam-logo"
            src={assetPath('/assets/steam-logo-completa.png')}
            alt="STEAM - Science, Technology, Engineering, Arts and Mathematics"
          />
          <img
            className="welcome-sesi-logo"
            src={assetPath('/assets/logo-escola-sesi.png')}
            alt="Escola SESI"
          />
        </div>
        <span className="eyebrow dark">GUIA OFICIAL · SESI</span>
        <h1 id="welcome-title">
          Bem-vindo à <strong>Mostra STEAM</strong>
        </h1>
        <p>Explore ideias, experiências e projetos que conectam Ciência, Tecnologia, Engenharia, Artes e Matemática.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="visitor-name">Como podemos chamar você?</label>
          <input
            id="visitor-name"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Digite seu nome ou apelido"
            autoComplete="nickname"
            autoFocus
          />
          <button type="submit" disabled={!draft.trim()}>
            Entrar na Mostra
          </button>
        </form>
      </section>
    </div>
  );
}
