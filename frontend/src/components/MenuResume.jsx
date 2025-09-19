import React from 'react';

export default function MenuResume({ sessionMode, totalQuestions, questionCounterDisplay, examModeMeta, selectedForm, onContinue }) {
  if (!sessionMode) return null;
  return (
    <div className="menu-resume">
      <div className="menu-resume-text">
        <span className="menu-resume-label">Aktueller Modus</span>
        <strong>
          {sessionMode === 'practice' ? 'Übungsmodus' : examModeMeta?.label || 'Fragebogen'}
        </strong>
        {sessionMode === 'practice' && totalQuestions > 0 && (
          <span>
            Fortschritt: {questionCounterDisplay} / {totalQuestions}
          </span>
        )}
        {sessionMode === 'exam' && examModeMeta && selectedForm && (
          <span>
            Bogen {selectedForm} · {examModeMeta.questionCount} Fragen
          </span>
        )}
      </div>
      <div className="menu-resume-actions">
        <button className="primary-button" onClick={onContinue}>
          Weiter
        </button>
      </div>
    </div>
  );
}

