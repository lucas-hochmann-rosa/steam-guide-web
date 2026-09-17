import React from 'react';

export default function TeacherModal({ teacher, onClose }) {
  if (!teacher) return null;

  return (
    <div
      className="teacher-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="teacher-name"
      onClick={onClose}
    >
      <article onClick={(event) => event.stopPropagation()}>
        <button
          className="teacher-close"
          onClick={onClose}
          aria-label="Fechar biografia"
        >
          ×
        </button>
        <div className="teacher-profile">
          <img
            src={teacher.image}
            alt={`Foto de ${teacher.name}`}
            referrerPolicy="no-referrer"
          />
          <div>
            <span>EQUIPE 2026</span>
            <h2 id="teacher-name">{teacher.name}</h2>
            <strong>{teacher.role}</strong>
          </div>
        </div>
        <p>{teacher.biography}</p>
        {teacher.portfolio && (
          <a
            href={teacher.portfolio}
            target="_blank"
            rel="noreferrer"
          >
            Acessar portfólio
          </a>
        )}
      </article>
    </div>
  );
}
