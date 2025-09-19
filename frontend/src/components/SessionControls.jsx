import React from 'react';
import hintBadge from '../assets/icons/hint_badge_lighthouse.svg';

export default function SessionControls({
  isExamSession,
  examModeMeta,
  selectedForm,
  selectedSupplement,
  isExamSelectorVisible,
  onOpenExamSelector,
  practiceMode,
  onSetPracticeMode,
  onClearProgress,
  canClear,
  onOpenAbout,
  showResult
}) {
  return (
    <div className="session-controls">
      <div className="controls">
        {isExamSession ? (
          <>
            <span className="controls-hint">
              <img src={hintBadge} alt="" aria-hidden="true" />
              <span>
                {examModeMeta?.label ?? 'Fragebogen'}
                {': '}
                {selectedForm || '–'}
                {examModeMeta?.id === 'AMS' && ` + ${selectedSupplement || '–'}`}
              </span>
            </span>
            <button
              type="button"
              className="secondary-button swap-button"
              onClick={onOpenExamSelector}
              disabled={isExamSelectorVisible}
            >
              Fragebogen wechseln
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onSetPracticeMode('all')}
              data-active={practiceMode === 'all' ? 'true' : undefined}
            >
              Alle Fragen
            </button>
            <button
              onClick={() => onSetPracticeMode('wrong')}
              data-active={practiceMode === 'wrong' ? 'true' : undefined}
            >
              Nur falsche (mind. 1x)
            </button>
            <button
              onClick={() => onSetPracticeMode('wrong-twice')}
              data-active={practiceMode === 'wrong-twice' ? 'true' : undefined}
            >
              Nur falsche (mind. 2x)
            </button>
          </>
        )}
        <button
          className="secondary-button reset-button"
          onClick={onClearProgress}
          disabled={!canClear}
        >
          Fortschritt löschen
        </button>
        <button className="link-button" onClick={onOpenAbout}>
          Über die App
        </button>
      </div>
    </div>
  );
}

