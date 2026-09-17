import React from 'react';
import { roomLocation } from '../data/rooms';

export default function RoomDetailModal({
  room,
  done,
  rating,
  comment,
  galleryIndex,
  setGalleryIndex,
  onClose,
  onRatingChange,
  onCommentChange,
  onFinishVisit,
  onSelectTeacher,
  onGoRobotics,
  team = [],
}) {
  if (!room) return null;

  const place = roomLocation(room);

  const teachersFor = (r) =>
    r.teachers
      .map((name) => team.find((member) => member.name === name))
      .filter(Boolean);

  const roomTeachers = teachersFor(room);

  return (
    <section
      className="active-visit room-detail"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalhes de ${room.room}: ${room.title}`}
      style={{
        '--accent': room.accent,
        '--soft': room.soft,
      }}
    >
      <button
        className="back-journey room-modal-close"
        onClick={onClose}
        aria-label="Fechar detalhes da sala"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div className="room-detail-head">
        <div>
          <div className="room-place-pills">
            <span className="area-pill">{room.room}</span>
            {place.floor && <span className="floor-pill">{place.floor}</span>}
          </div>
          <h2>{room.title}</h2>
          <p className="room-area">{room.area}</p>
          {!room.teamLogo && <p className="room-responsible">{room.responsible}</p>}

          {room.teamLogo && (
            <button className="room-team-badge" onClick={onGoRobotics}>
              <img src={room.teamLogo} alt="Logo da West Sharks FTC" />
              <span>
                <strong>{room.responsible}</strong>
                <small>Conheça a equipe de robótica</small>
              </span>
            </button>
          )}

          {roomTeachers.length > 0 && (
            <div className="room-teachers" aria-label="Professores responsáveis">
              {roomTeachers.map((teacher) => (
                <button
                  key={teacher.name}
                  onClick={() => onSelectTeacher(teacher)}
                  aria-label={`Conhecer ${teacher.name}`}
                >
                  <img src={teacher.image} alt="" />
                  <span>
                    <strong>{teacher.name}</strong>
                    <small>{teacher.role}</small>
                  </span>
                </button>
              ))}
            </div>
          )}

          {room.provisional && (
            <span className="provisional-pill">DETALHAMENTO PROVISÓRIO</span>
          )}
        </div>
      </div>

      <div className="room-gallery" aria-label={`Fotos de ${room.room}`}>
        {room.images && room.images.length > 0 ? (
          <>
            <img
              src={room.images[galleryIndex] || room.images[0]}
              alt={`${room.room} - imagem ${galleryIndex + 1} de ${room.images.length}`}
            />
            {room.images.length > 1 && (
              <div className="gallery-controls">
                <button
                  onClick={() =>
                    setGalleryIndex(
                      (index) => (index - 1 + room.images.length) % room.images.length
                    )
                  }
                  aria-label="Foto anterior"
                >
                  ←
                </button>
                <span>
                  {galleryIndex + 1} / {room.images.length}
                </span>
                <button
                  onClick={() =>
                    setGalleryIndex((index) => (index + 1) % room.images.length)
                  }
                  aria-label="Próxima foto"
                >
                  →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="gallery-empty">
            <img src={room.icon} alt="" />
            <strong>Foto da sala em breve</strong>
            <span>A atividade já está confirmada na organização da Mostra.</span>
          </div>
        )}
      </div>

      <div className="visit-detail-grid">
        <article className="activity-description">
          <span className="detail-label">SOBRE A ATIVIDADE</span>
          <h3>O que você vai encontrar</h3>
          <p>{room.description}</p>
        </article>

        <article className="finish-card">
          <h3>{done ? 'Visita concluída' : 'Como foi a experiência?'}</h3>
          <p>
            {done
              ? 'Sua avaliação está salva neste dispositivo.'
              : 'Antes de concluir, dê uma nota para esta sala.'}
          </p>

          <div className="rating big">
            <div>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => onRatingChange(star)}
                  aria-label={`${star} estrelas`}
                >
                  {star <= (rating || 0) ? '★' : '☆'}
                </button>
              ))}
            </div>
          </div>

          <label>
            Comentário opcional
            <textarea
              value={comment || ''}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="Conte o que mais chamou sua atenção..."
            />
          </label>

          <button
            className="finish-button"
            disabled={!rating}
            onClick={onFinishVisit}
          >
            {done ? '✓ Atualizar e voltar ao percurso' : 'Concluir visita'}
          </button>
        </article>
      </div>
    </section>
  );
}
