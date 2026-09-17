import React, { useState } from 'react';
import { assetPath } from '../utils/assetPath';

export default function WelcomeModal({ onSaveName }) {
  const [nameDraft, setNameDraft] = useState('');
  const [emailDraft, setEmailDraft] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = nameDraft.trim();
    if (!name) return;
    onSaveName({ name, email: emailDraft.trim() });
  };

  return (
    <div
      className="welcome-screen"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      onClick={() => onSaveName({ name: nameDraft.trim() || 'Visitante', email: emailDraft.trim() })}
    >
      <section className="welcome-card" onClick={(e) => e.stopPropagation()}>
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
            value={nameDraft}
            onChange={(event) => setNameDraft(event.target.value)}
            placeholder="Digite seu nome ou apelido *"
            autoComplete="nickname"
            autoFocus
          />

          <label htmlFor="visitor-email" style={{ marginTop: '12px' }}>
            Seu e-mail <small style={{ fontWeight: 'normal', color: '#68787a' }}>(opcional, para identificação)</small>
          </label>
          <input
            id="visitor-email"
            type="email"
            value={emailDraft}
            onChange={(event) => setEmailDraft(event.target.value)}
            placeholder="seuemail@exemplo.com"
            autoComplete="email"
          />

          <button type="submit" disabled={!nameDraft.trim()}>
            Entrar na Mostra
          </button>
        </form>
      </section>
    </div>
  );
}
