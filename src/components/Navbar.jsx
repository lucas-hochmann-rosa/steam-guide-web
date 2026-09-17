import React from 'react';
import { assetPath } from '../utils/assetPath';

export default function Navbar({
  currentView,
  onNavigate,
  mobileMenuOpen,
  setMobileMenuOpen,
}) {
  const navItems = [
    { id: 'inicio', label: 'Início' },
    { id: 'programacao', label: 'Seu percurso' },
    { id: 'mapa', label: 'Mapa' },
    { id: 'mais', label: 'O que é STEAM?' },
    { id: 'questionario', label: 'Questionário' },
    { id: 'equipe', label: 'Equipe pedagógica' },
    { id: 'robotica', label: 'Equipe de robótica' },
    { id: 'autores', label: 'Sobre' },
  ];

  return (
    <header className="topbar">
      <a
        className="brand"
        href="https://www.escolasesisc.com.br/"
        target="_blank"
        rel="noreferrer"
        aria-label="Abrir o site oficial da Escola SESI Santa Catarina"
      >
        <img src={assetPath('/assets/logo-escola-sesi.png')} alt="Escola SESI" />
      </a>

      <nav className="desktop-nav" aria-label="Navegação principal">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={currentView === item.id ? 'active' : ''}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}

      </nav>

      <button
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen((open) => !open)}
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-page-menu"
        aria-label="Abrir menu de páginas"
      >
        <span />
        <span />
        <span />
      </button>

      {mobileMenuOpen && (
        <nav id="mobile-page-menu" className="mobile-page-menu" aria-label="Todas as páginas">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={currentView === item.id ? 'active' : ''}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
