import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import WelcomeModal from './components/WelcomeModal';
import TeacherModal from './components/TeacherModal';
import CompletionModal from './components/CompletionModal';
import QRScannerModal from './components/QRScannerModal';
import EvaluationsModal from './components/EvaluationsModal';
import RoomDetailModal from './components/RoomDetailModal';
import { rooms, schoolBlocks, blockHotspots, guideTeam, roomLocation } from './data/rooms';
import { team } from './data/team';
import {
  initializeStorage,
  getVisitorName,
  setVisitorName,
  getVisitedRooms,
  setVisitedRooms,
  getAllEvaluations,
  saveRoomEvaluation,
} from './services/evaluationStorage';
import { assetPath } from './utils/assetPath';

const InfoIcon = ({ type }) => {
  const paths = {
    date: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18" />
      </>
    ),
    team: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6M15 15c3.5 0 5.5 1.7 6 5" />
      </>
    ),
    phone: (
      <path d="M7 3h4l2 5-3 2c1.5 3 3.5 5 6 6l2-3 5 2v4c0 2-2 3-4 3C10 20 4 14 2 5c0-2 1-4 3-4z" />
    ),
    location: (
      <>
        <path d="M12 22s7-6.2 7-13a7 7 0 1 0-14 0c0 6.8 7 13 7 13z" />
        <circle cx="12" cy="9" r="2.5" />
      </>
    ),
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" />
      </>
    ),
  };
  return (
    <span className={`info-icon icon-${type}`} aria-hidden>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths[type]}
      </svg>
    </span>
  );
};

export default function App() {
  const [view, setView] = useState('inicio');
  const [visited, setVisited] = useState([]);
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [evaluations, setEvaluations] = useState([]);
  const [currentVisit, setCurrentVisit] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [visitorName, setVisitorNameState] = useState('');
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [evaluationsOpen, setEvaluationsOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);

  // InicializaÃ§Ã£o e recuperaÃ§Ã£o de dados persistidos
  useEffect(() => {
    initializeStorage();

    const storedName = getVisitorName();
    setVisitorNameState(storedName);

    const storedVisited = getVisitedRooms();
    setVisited(storedVisited);

    const storedEvaluations = getAllEvaluations();
    setEvaluations(storedEvaluations);

    const loadedRatings = {};
    const loadedComments = {};
    storedEvaluations.forEach((item) => {
      if (item.rating) loadedRatings[item.roomId] = item.rating;
      if (item.comment) loadedComments[item.roomId] = item.comment;
    });
    setRatings(loadedRatings);
    setComments(loadedComments);

    // ParÃ¢metro de QR Code na URL
    const params = new URLSearchParams(window.location.search);
    const qrLocation = params.get('local');
    if (qrLocation && rooms.some((r) => r.id === qrLocation.toLowerCase())) {
      const match = qrLocation.toLowerCase();
      setCurrentVisit(match);
      setView('programacao');
    } else if (!storedName) {
      setWelcomeOpen(true);
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(assetPath('/sw.js')).catch(() => {});
    }
  }, []);

  const handleNavigate = (nextView) => {
    setView(nextView);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveVisitorName = (name) => {
    setVisitorName(name);
    setVisitorNameState(name);
    setWelcomeOpen(false);
  };

  const handleOpenRoom = (roomId) => {
    if (!rooms.some((r) => r.id === roomId)) return;
    setGalleryIndex(0);
    setCurrentVisit(roomId);
    setView('programacao');
    window.history.replaceState({}, '', `?local=${roomId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseRoom = () => {
    setCurrentVisit(null);
    window.history.replaceState({}, '', window.location.pathname);
  };

  const handleRatingChange = (star) => {
    if (!currentVisit) return;
    setRatings((prev) => ({ ...prev, [currentVisit]: star }));
  };

  const handleCommentChange = (text) => {
    if (!currentVisit) return;
    setComments((prev) => ({ ...prev, [currentVisit]: text }));
  };

  const handleFinishVisit = () => {
    if (!currentVisit) return;

    const currentRoom = rooms.find((r) => r.id === currentVisit);
    const star = ratings[currentVisit] || 5;
    const comment = comments[currentVisit] || '';

    // Salva via camada de serviÃ§o estruturada
    saveRoomEvaluation({
      roomId: currentVisit,
      roomTitle: currentRoom ? currentRoom.title : currentVisit,
      rating: star,
      comment,
      visitorName,
    });

    // Atualiza estado local de salas visitadas
    const isAlreadyVisited = visited.includes(currentVisit);
    const updatedVisited = isAlreadyVisited ? visited : [...visited, currentVisit];
    if (!isAlreadyVisited) {
      setVisited(updatedVisited);
      setVisitedRooms(updatedVisited);
    }

    // Atualiza lista de avaliaÃ§Ãµes salvas
    const updatedEvaluations = getAllEvaluations();
    setEvaluations(updatedEvaluations);

    // Fecha o modal
    handleCloseRoom();

    // Se completou 100% das salas pela primeira vez
    if (!isAlreadyVisited && updatedVisited.length === rooms.length) {
      setCompletionOpen(true);
    }
  };

  const activeRoom = currentVisit ? rooms.find((r) => r.id === currentVisit) : null;

  return (
    <div className="app-shell">
      <Navbar
        currentView={view}
        onNavigate={handleNavigate}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onOpenEvaluations={() => setEvaluationsOpen(true)}
        evaluationsCount={evaluations.length}
      />

      <main>
        {view === 'inicio' && (
          <>
            <section className="hero">
              <img
                className="hero-graph graph-a"
                src={assetPath('/assets/grafismo-natureza.svg')}
                alt=""
              />
              <img
                className="hero-graph graph-b"
                src={assetPath('/assets/grafismo-linguagens.svg')}
                alt=""
              />

              <div className="hero-copy">
                <span className="eyebrow">18 e 19 de setembro de 2026 Â· Escola SESI</span>
                {visitorName && <p className="visitor-greeting">OlÃ¡, {visitorName}!</p>}
                <h1>
                  Mostra{' '}
                  <span className="steam-word">
                    <i>S</i>
                    <i>T</i>
                    <i>E</i>
                    <i>A</i>
                    <i>M</i>
                  </span>
                </h1>
                <p>
                  Um guia para descobrir ideias, experiÃªncias e projetos que conectam
                  conhecimento, criatividade e transformaÃ§Ã£o.
                </p>

                <div className="hero-actions">
                  <button className="primary" onClick={() => handleNavigate('programacao')}>
                    ComeÃ§ar meu percurso <span>â†’</span>
                  </button>
                  <button className="secondary" onClick={() => handleNavigate('mapa')}>
                    Ver mapa da mostra
                  </button>
                </div>
              </div>

              <div className="event-card">
                <img
                  className="event-logo"
                  src={assetPath('/assets/logo-escola-sesi.png')}
                  alt="Escola SESI"
                />
                <span className="mini-label">MOSTRA STEAM 2026</span>
                <strong>Guia de visitaÃ§Ã£o</strong>
                <div className="event-meta event-meta-new">
                  <span>
                    <b>18 e 19</b>
                    <small>DE SETEMBRO</small>
                  </span>
                  <span>
                    <small>INÃCIO</small>
                    <b>08h</b>
                  </span>
                  <span>
                    <small>TÃ‰RMINO</small>
                    <b>12h</b>
                  </span>
                </div>
              </div>
            </section>

            <section className="home-progress content-width" aria-label="Progresso da visita">
              <div className="home-progress-copy">
                <span className="eyebrow dark">SEU PROGRESSO</span>
                <h2>
                  {visited.length} de {rooms.length} salas visitadas
                </h2>
                <p>
                  {visited.length
                    ? 'Continue explorando os espaÃ§os da Mostra.'
                    : 'Seu percurso comeÃ§a na primeira sala que vocÃª visitar.'}
                </p>
              </div>

              <div className="home-progress-meter">
                <strong>{Math.round((visited.length / rooms.length) * 100)}%</strong>
                <span>da Mostra explorada</span>
                <div className="progress-track">
                  <i style={{ width: `${(visited.length / rooms.length) * 100}%` }} />
                </div>
              </div>

              <button onClick={() => handleNavigate('programacao')}>Ver meu percurso</button>
            </section>

            <section className="quick-section content-width">
              <div className="section-heading">
                <div>
                  <span className="eyebrow dark">ACESSO RÃPIDO</span>
                  <h2>O que vocÃª quer descobrir?</h2>
                </div>
              </div>

              <div className="quick-grid">
                <button onClick={() => handleNavigate('programacao')}>
                  <span className="quick-icon blue">âœ“</span>
                  <strong>Seu percurso</strong>
                  <small>Acompanhe espaÃ§os visitados</small>
                  <b>â†’</b>
                </button>
                <button onClick={() => handleNavigate('mapa')}>
                  <span className="quick-icon green">âŒ-</span>
                  <strong>Mapa da mostra</strong>
                  <small>Encontre cada espaÃ§o</small>
                  <b>â†’</b>
                </button>
                <button onClick={() => handleNavigate('equipe')}>
                  <span className="quick-icon teal">â-</span>
                  <strong>Equipe pedagÃ³gica</strong>
                  <small>ConheÃ§a educadores e gestÃ£o</small>
                  <b>â†’</b>
                </button>
                <button onClick={() => handleNavigate('mais')}>
                  <span className="quick-icon yellow">âœ¦</span>
                  <strong>O que Ã© STEAM?</strong>
                  <small>ConheÃ§a a metodologia</small>
                  <b>â†’</b>
                </button>
              </div>
            </section>

            <section className="survey-invite content-width">
              <div>
                <span className="eyebrow dark">SUA OPINIÃƒO IMPORTA</span>
                <h2>Como foi sua experiÃªncia?</h2>
                <p>
                  Conte o que mais gostou e ajude a construir as prÃ³ximas ediÃ§Ãµes da Mostra.
                </p>
              </div>
              <button className="primary" onClick={() => handleNavigate('questionario')}>
                Responder questionÃ¡rio
              </button>
            </section>
          </>
        )}

        {view === 'programacao' && (
          <Page
            title="Seu percurso"
            subtitle="ConheÃ§a as atividades de cada sala e acompanhe sua visita pela Mostra."
            kicker=""
            theme="checklist"
            graph={assetPath('/assets/grafismo-robotica.svg')}
          >
            {activeRoom ? (
              <RoomDetailModal
                room={activeRoom}
                done={visited.includes(activeRoom.id)}
                rating={ratings[activeRoom.id] || 0}
                comment={comments[activeRoom.id] || ''}
                galleryIndex={galleryIndex}
                setGalleryIndex={setGalleryIndex}
                onClose={handleCloseRoom}
                onRatingChange={handleRatingChange}
                onCommentChange={handleCommentChange}
                onFinishVisit={handleFinishVisit}
                onSelectTeacher={(t) => setSelectedTeacher(t)}
                onGoRobotics={() => handleNavigate('robotica')}
                team={team}
              />
            ) : (
              <>
                <div className="progress-card">
                  <div>
                    <span>Seu progresso</span>
                    <strong>
                      {visited.length} de {rooms.length} salas visitadas
                    </strong>
                  </div>
                  <div className="progress-track">
                    <i style={{ width: `${(visited.length / rooms.length) * 100}%` }} />
                  </div>
                </div>

                <div className="visit-grid journey-grid room-grid">
                  {rooms.map((room) => {
                    const done = visited.includes(room.id);
                    const place = roomLocation(room);
                    const roomRating = ratings[room.id];

                    const teachersForRoom = room.teachers
                      .map((name) => team.find((member) => member.name === name))
                      .filter(Boolean);

                    return (
                      <article
                        key={room.id}
                        className={done ? 'visited' : ''}
                        style={{
                          '--accent': room.accent,
                          '--soft': room.soft,
                        }}
                      >
                        <button
                          className="room-open-visual"
                          onClick={() => handleOpenRoom(room.id)}
                          aria-label={`Conhecer ${room.room}: ${room.title}`}
                        >
                          {room.images[0] ? (
                            <img
                              className="room-thumb"
                              src={room.images[0]}
                              alt=""
                              loading="lazy"
                            />
                          ) : (
                            <span className="room-thumb room-thumb-empty">
                              <img src={room.icon} alt="" />
                            </span>
                          )}
                        </button>

                        <div className="room-card-body">
                          <div className="visit-head">
                            <div className="room-place-pills">
                              <span className="area-pill">{room.room}</span>
                              {place.floor && (
                                <span className="floor-pill">{place.floor}</span>
                              )}
                            </div>
                            <span className="visit-status">
                              {done ? (
                                <span style={{ color: 'var(--green)' }}>
                                  âœ“ Visitada {roomRating ? `(â˜… ${roomRating})` : ''}
                                </span>
                              ) : (
                                'NÃ£o visitada'
                              )}
                            </span>
                          </div>

                          <h3>
                            <button onClick={() => handleOpenRoom(room.id)}>
                              {room.title}
                            </button>
                          </h3>
                          <p>{room.area}</p>

                          {!room.teamLogo && <small>{room.responsible}</small>}

                          {room.teamLogo && (
                            <button
                              className="room-team-badge card-badge"
                              onClick={() => handleNavigate('robotica')}
                            >
                              <img src={room.teamLogo} alt="" />
                              <span>
                                <strong>{room.responsible}</strong>
                                <small>ConheÃ§a a equipe</small>
                              </span>
                            </button>
                          )}

                          {teachersForRoom.length > 0 && (
                            <div
                              className="room-teachers compact"
                              aria-label="ConheÃ§a os professores responsÃ¡veis"
                            >
                              {teachersForRoom.map((teacher) => (
                                <button
                                  key={teacher.name}
                                  onClick={() => setSelectedTeacher(teacher)}
                                  aria-label={`Ver biografia de ${teacher.name}`}
                                >
                                  <img src={teacher.image} alt="" />
                                </button>
                              ))}
                            </div>
                          )}

                          {room.provisional && (
                            <span className="provisional-card">
                              Detalhamento provisÃ³rio
                            </span>
                          )}

                          <button
                            className="open-space"
                            onClick={() => handleOpenRoom(room.id)}
                          >
                            {done ? 'Ver novamente' : 'Conhecer a sala'} â†’
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </Page>
        )}

        {view === 'mapa' && (
          <Page
            title="Mapa da mostra"
            subtitle="Consulte os blocos e encontre os espaÃ§os da Escola SESI SENAI ChapecÃ³."
            kicker=""
            theme="map"
            graph={assetPath('/assets/grafismo-humanas.svg')}
          >
            <div className="school-map-layout">
              <div className="map-column">
                <figure className="school-map-card">
                  <div className="map-interactive" onClick={() => setSelectedBlock(null)}>
                    <img
                      src={assetPath('/assets/mapa-escola-sesi-senai-chapeco.png')}
                      alt="Mapa 2D da Escola SESI SENAI ChapecÃ³ com os blocos A a H"
                    />
                    {schoolBlocks.map((block) => (
                      <button
                        key={block.id}
                        className="map-hotspot"
                        style={blockHotspots[block.id]}
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedBlock(block.id);
                        }}
                        aria-label={`Ver informaÃ§Ãµes do ${block.name}`}
                      >
                        <span>{block.id}</span>
                      </button>
                    ))}
                    {selectedBlock && (() => {
                      const block = schoolBlocks.find((item) => item.id === selectedBlock);
                      if (!block) return null;
                      return (
                        <div
                          className="map-block-popup"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button onClick={() => setSelectedBlock(null)} aria-label="Fechar informaÃ§Ãµes">
                            Ã-
                          </button>
                          <b>{block.id}</b>
                          <div>
                            <strong>{block.name}</strong>
                            <p>{block.description}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <figcaption>
                    Toque nas letras para conhecer os blocos Â·{' '}
                    <a
                      href={assetPath('/assets/mapa-escola-sesi-senai-chapeco.png')}
                      target="_blank"
                      rel="noreferrer"
                    >
                      abrir mapa completo â†-
                    </a>
                  </figcaption>
                </figure>

                <section className="block-f-map" aria-labelledby="block-f-title">
                  <div>
                    <span>DETALHAMENTO DOS ESPAÃ‡OS</span>
                    <h2 id="block-f-title">Mapa detalhado do Bloco F</h2>
                    <p>
                      Localize as salas F-01, F-02, F-03, F-05, F-08, F-13, F-18, F-20 e o Corredor F.
                    </p>
                  </div>
                  <a
                    href={assetPath('/assets/mapa-detalhado-bloco-f.jpg')}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Abrir mapa detalhado do Bloco F em tamanho completo"
                  >
                    <img
                      src={assetPath('/assets/mapa-detalhado-bloco-f.jpg')}
                      alt="Mapa detalhado do Bloco F indicando as salas e o Corredor F"
                    />
                  </a>
                </section>
              </div>

              <section className="block-legend" aria-labelledby="legend-title">
                <div className="legend-heading">
                  <span>LEGENDA</span>
                  <h2 id="legend-title">Blocos da escola</h2>
                </div>
                <div className="legend-grid">
                  {schoolBlocks.map((block) => (
                    <article key={block.id}>
                      <b>{block.id}</b>
                      <div>
                        <strong>{block.name}</strong>
                        <p>{block.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
                <a
                  className="school-location-link"
                  href="https://maps.app.goo.gl/afNi9tttCGPfRSGf6"
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir localizaÃ§Ã£o da escola â†-
                </a>
              </section>
            </div>
          </Page>
        )}

        {view === 'equipe' && (
          <Page
            title="Equipe pedagÃ³gica 2026"
            subtitle="Educadores e profissionais que constroem as experiÃªncias de aprendizagem da Escola SESI."
            kicker="ESCOLA SESI CHAPECÃ“"
            theme="team"
            graph={assetPath('/assets/grafismo-humanas.svg')}
          >
            <section className="team-intro">
              <div>
                <h2>Quem faz parte desta histÃ³ria</h2>
              </div>
              <img src={assetPath('/assets/icon-natureza.svg')} alt="" />
            </section>

            <section className="teacher-grid">
              {team.map((member) => (
                <article className="teacher-card" key={member.name}>
                  <button
                    className="teacher-open"
                    onClick={() => setSelectedTeacher(member)}
                    aria-label={`Conhecer ${member.name}`}
                  >
                    <img
                      src={member.image}
                      alt={`Foto de ${member.name}`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <span>
                      <strong>{member.name}</strong>
                      <small>{member.role}</small>
                    </span>
                  </button>
                </article>
              ))}
            </section>
          </Page>
        )}

        {view === 'autores' && (
          <Page
            title="Sobre o guia"
            subtitle=""
            kicker="MOSTRA STEAM 2026"
            theme="authors"
            graph={assetPath('/assets/grafismo-linguagens.svg')}
          >
            <section className="authors-intro">
              <h2>Quem criou esta experiÃªncia</h2>
              <p>
                ConheÃ§a os estudantes responsÃ¡veis pelo desenvolvimento do guia de
                visitaÃ§Ã£o da Mostra STEAM 2026 e acesse seus portfÃ³lios.
              </p>
            </section>

            <section className="authors-grid">
              {guideTeam.map((member) => (
                <a
                  key={member.name}
                  href={member.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Acessar o portfÃ³lio de ${member.name}`}
                >
                  <img
                    src={member.image}
                    alt={`Foto de ${member.name}`}
                    loading="lazy"
                  />
                  <span>
                    <strong>{member.name}</strong>
                  </span>
                </a>
              ))}
            </section>
          </Page>
        )}

        {view === 'mais' && (
          <Page
            title="O que Ã© STEAM?"
            subtitle="Uma metodologia que conecta saberes para transformar ideias em soluÃ§Ãµes."
            kicker=""
            theme="steam"
            graph={assetPath('/assets/grafismo-matematica.svg')}
          >
            <section className="steam-intro">
              <div className="steam-letters">
                <span>
                  <b>S</b>Science
                </span>
                <span>
                  <b>T</b>Technology
                </span>
                <span>
                  <b>E</b>Engineering
                </span>
                <span>
                  <b>A</b>Arts
                </span>
                <span>
                  <b>M</b>Mathematics
                </span>
              </div>
              <div>
                <p>
                  A Mostra STEAM Ã© uma experiÃªncia de aprendizagem que conecta CiÃªncia,
                  Tecnologia, Engenharia, Artes e MatemÃ¡tica em projetos, desafios e
                  investigaÃ§Ãµes com sentido para os estudantes.
                </p>
                <div className="steam-actions">
                  <button className="team-cta" onClick={() => handleNavigate('equipe')}>
                    ConheÃ§a nossa equipe 2026
                  </button>
                </div>
              </div>
            </section>

            <section className="steam-principles" aria-label="PrincÃ­pios da Mostra STEAM">
              <article>
                <span>01</span>
                <h3>Aprender fazendo</h3>
                <p>
                  Os estudantes investigam problemas, testam hipÃ³teses, constroem soluÃ§Ãµes
                  e aprendem a partir da experiÃªncia â€” nÃ£o apenas da teoria.
                </p>
              </article>
              <article>
                <span>02</span>
                <h3>IntegraÃ§Ã£o de saberes</h3>
                <p>
                  Uma mesma situaÃ§Ã£o pode envolver FÃ­sica, QuÃ­mica, Biologia, MatemÃ¡tica,
                  Artes, Linguagens e Tecnologia, mostrando que o conhecimento se conecta.
                </p>
              </article>
              <article>
                <span>03</span>
                <h3>Valor para a Escola SESI</h3>
                <p>
                  A Mostra torna visÃ­vel a proposta educacional do SESI: formar estudantes
                  criativos, colaborativos, crÃ­ticos e preparados para transformar desafios
                  reais.
                </p>
              </article>
            </section>

            <section className="steam-impact">
              <span>POR QUE ISSO IMPORTA?</span>
              <h2>Uma escola que transforma curiosidade em protagonismo.</h2>
              <div>
                <p>
                  Ao criar espaÃ§os para experimentar, comunicar ideias e trabalhar em equipe,
                  a Mostra fortalece a autonomia dos alunos e aproxima a aprendizagem da vida,
                  da comunidade e do futuro do trabalho.
                </p>
                <p>
                  Para as famÃ­lias e para a comunidade escolar, ela tambÃ©m revela processos:
                  mostra como os estudantes pensam, criam e colaboram, valorizando o percurso
                  tanto quanto o resultado.
                </p>
              </div>
            </section>

            <section className="info-grid">
              <article>
                <InfoIcon type="date" />
                <div>
                  <b>Data</b>
                  <p>18 e 19 de setembro de 2026</p>
                </div>
              </article>
              <article>
                <InfoIcon type="team" />
                <div>
                  <b>RealizaÃ§Ã£o</b>
                  <p>Turma 302 Â· Escola SESI</p>
                </div>
              </article>
              <article>
                <InfoIcon type="phone" />
                <div>
                  <b>Contato</b>
                  <p>(49) 3321-7300</p>
                </div>
              </article>
              <article>
                <InfoIcon type="location" />
                <div>
                  <b>LocalizaÃ§Ã£o</b>
                  <p>
                    <a
                      href="https://maps.app.goo.gl/afNi9tttCGPfRSGf6"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Abrir no Google Maps â†-
                    </a>
                  </p>
                </div>
              </article>
              <article>
                <InfoIcon type="instagram" />
                <div>
                  <b>Instagram</b>
                  <p>
                    <a
                      href="https://www.instagram.com/escolasesi.chapeco/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      @escolasesi.chapeco â†-
                    </a>
                  </p>
                </div>
              </article>
            </section>
          </Page>
        )}

        {view === 'robotica' && (
          <Page
            title="WEST SHARKS FTC"
            subtitle=""
            kicker="EQUIPE DE ROBÃ“TICA"
            theme="robotics-team"
            graph={assetPath('/assets/westsharks/logo-westsharks.png')}
          >
            <section className="robotics-hero">
              <div className="robotics-copy">
                <img
                  className="robotics-logo"
                  src={assetPath('/assets/westsharks/logo-westsharks.png')}
                  alt="West Sharks FTC"
                />
                <span>FIRST TECH CHALLENGE Â· #24823</span>
                <h2>Engenharia, estratÃ©gia e colaboraÃ§Ã£o dentro e fora da arena.</h2>
                <p>
                  A West Sharks representa a Escola SESI ChapecÃ³ em desafios da FIRST Tech
                  Challenge. Os estudantes projetam, constroem, programam e testam robÃ´s
                  enquanto desenvolvem comunicaÃ§Ã£o, lideranÃ§a e trabalho em equipe.
                </p>
                <div className="robotics-links">
                  <a href="https://www.westsharksftc.com/" target="_blank" rel="noreferrer">
                    Site da equipe â†-
                  </a>
                  <a
                    href="https://www.instagram.com/west.sharks.robotica/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Instagram â†-
                  </a>
                </div>
              </div>
              <img
                className="robotics-photo"
                src={assetPath('/assets/westsharks/westsharksftc.jpg')}
                alt="RobÃ´ da equipe West Sharks FTC"
              />
            </section>
            <section className="robotics-cards">
              <article>
                <b>01</b>
                <h3>Quem somos</h3>
                <p>
                  Uma equipe de estudantes que transforma problemas em soluÃ§Ãµes por meio de
                  pesquisa, prototipagem e cooperaÃ§Ã£o.
                </p>
              </article>
              <article>
                <b>02</b>
                <h3>Temporada BIOBUZZ</h3>
                <p>
                  Na temporada 2026â€“2027, o desafio BIOBUZZ mobiliza a equipe na criaÃ§Ã£o de
                  soluÃ§Ãµes de engenharia para uma nova arena competitiva.
                </p>
              </article>
              <article>
                <b>03</b>
                <h3>ProtÃ³tipo RI30H</h3>
                <p>
                  Na sala F-09, a equipe apresenta o protÃ³tipo construÃ­do em 30 horas,
                  explica suas escolhas mecÃ¢nicas e de programaÃ§Ã£o e demonstra o robÃ´ em uma
                  arena de testes.
                </p>
              </article>
            </section>
          </Page>
        )}

        {view === 'questionario' && (
          <Page
            title="QuestionÃ¡rio"
            subtitle="Conte como foi sua experiÃªncia e ajude a tornar a prÃ³xima Mostra ainda melhor."
            kicker="SUA OPINIÃƒO IMPORTA"
            theme="survey"
            graph={assetPath('/assets/grafismo-linguagens.svg')}
          >
            <section className="survey-page">
              <div className="survey-heading">
                <h2>{visitorName ? `${visitorName}, queremos ouvir vocÃª.` : 'Queremos ouvir vocÃª.'}</h2>
                <p>
                  Responda Ã s perguntas abaixo. As respostas sÃ£o registradas diretamente no Google
                  FormulÃ¡rios.
                </p>
              </div>
              <div className="survey-frame">
                <iframe
                  title="AvaliaÃ§Ã£o da Mostra STEAM 2026"
                  src="https://docs.google.com/forms/d/e/1FAIpQLSetraOoQiO27VmVA1IGBD7IkLbPiy4Qqs_SLjq2UQToh_1CFQ/viewform?embedded=true"
                  loading="lazy"
                >
                  Carregandoâ€¦
                </iframe>
              </div>
              <div className="survey-actions">
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSetraOoQiO27VmVA1IGBD7IkLbPiy4Qqs_SLjq2UQToh_1CFQ/viewform"
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir formulÃ¡rio em nova guia â†-
                </a>
              </div>
            </section>
          </Page>
        )}
      </main>

      <Footer onOpenEvaluations={() => setEvaluationsOpen(true)} />

      <BottomNav
        currentView={view}
        onNavigate={handleNavigate}
        onOpenScanner={() => setScannerOpen(true)}
      />

      {welcomeOpen && (
        <WelcomeModal onSaveName={handleSaveVisitorName} />
      )}

      {selectedTeacher && (
        <TeacherModal
          teacher={selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
        />
      )}

      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={(scannedId) => {
          setScannerOpen(false);
          handleOpenRoom(scannedId);
        }}
      />

      {completionOpen && (
        <CompletionModal
          onClose={() => setCompletionOpen(false)}
          onGoSurvey={() => handleNavigate('questionario')}
        />
      )}

      <EvaluationsModal
        isOpen={evaluationsOpen}
        onClose={() => setEvaluationsOpen(false)}
        evaluations={evaluations}
        rooms={rooms}
      />
    </div>
  );
}

function Page({
  title,
  subtitle,
  kicker,
  theme = 'default',
  graph,
  children,
}) {
  return (
    <div className={`inner-page theme-${theme}`}>
      <section className="page-head">
        {kicker && <span className="eyebrow">{kicker}</span>}
        <h1>
          {theme === 'steam' ? (
            <>
              O que Ã©{' '}
              <span className="steam-word">
                <i>S</i>
                <i>T</i>
                <i>E</i>
                <i>A</i>
                <i>M</i>
              </span>
              ?
            </>
          ) : (
            title
          )}
        </h1>
        {subtitle && <p>{subtitle}</p>}
        {graph && <img src={graph} alt="" />}
      </section>
      <div className="page-content content-width">{children}</div>
    </div>
  );
}

