import React from 'react';
import headerBadge from '../assets/icons/header_badge_sailboat.svg';
import practiceModeIcon from '../assets/icons/practice_mode_logbook.svg';
import examModeIcon from '../assets/icons/fragebogen_scroll_check.svg';
import statsModeIcon from '../assets/icons/stats_gauge_waves.svg';
import { DEFAULT_CATEGORY, getExamModeMeta, getExamFormNumbers } from '../utils/examForms.js';
import ExamStatsPanel from './ExamStatsPanel.jsx';

export default function MenuPopover({
  isOpen,
  view,
  onClose,
  onChangeView,
  sessionMode,
  totalQuestions,
  questionCounterDisplay,
  examModeMeta,
  selectedForm,
  examMode,
  examStats,
  examModeKeys,
  onStartPractice,
  onStartExam,
  onOpenAbout,
  onStartSpecificMode,
}) {
  return (
    <div className={`menu-popover ${isOpen ? 'open' : ''}`}>
      <div className="menu-card">
        <button
          type="button"
          className="menu-close"
          aria-label="Menü schließen"
          onClick={onClose}
        >
          ×
        </button>

        {view === 'mode' && (
          <>
            <div className="welcome-header">
              <span className="logo badge-logo">
                <img src={headerBadge} alt="SBF Binnen Trainer" />
              </span>
              <h2>Willkommen an Bord!</h2>
              <p>Wähle deinen Modus oder setze dein Training fort.</p>
            </div>
            {sessionMode && (
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
                  <button className="primary-button" onClick={onClose}>
                    Weiter
                  </button>
                </div>
              </div>
            )}
            <div className="welcome-actions">
              <button className="mode-card" onClick={onStartPractice}>
                <span className="mode-icon">
                  <img src={practiceModeIcon} alt="Übungsmodus" />
                </span>
                <h3>Übungsmodus</h3>
                <p>Alle Fragen oder gezielt falsch beantwortete wiederholen.</p>
              </button>
              <button className="mode-card" onClick={onStartExam}>
                <span className="mode-icon">
                  <img src={examModeIcon} alt="Fragebogen" />
                </span>
                <h3>Fragebogen</h3>
                <p>Original Prüfungsbögen (Motor & Segeln) simulieren.</p>
              </button>
              <button className="mode-card" onClick={() => onChangeView('stats')}>
                <span className="mode-icon">
                  <img src={statsModeIcon} alt="Statistiken" />
                </span>
                <h3>Statistiken</h3>
                <p>Überblick über deine Ergebnisse in allen Fragebögen.</p>
              </button>
            </div>
            <div className="welcome-footer">
              <button className="link-button" onClick={onOpenAbout}>
                Über die App
              </button>
            </div>
          </>
        )}

        {view === 'stats' && (
          <div className="menu-stats-page">
            <div className="menu-stats-header">
              <div>
                <span className="menu-resume-label">Statistiken</span>
                <h3>Deine Fragebogen-Ergebnisse</h3>
              </div>
            </div>
            {examModeKeys.map(modeKey => {
              const meta = getExamModeMeta(modeKey);
              const category = meta?.composite?.primaryCategory ?? meta?.formCategory ?? DEFAULT_CATEGORY;
              const forms = getExamFormNumbers(category);
              if (!forms.length) return null;
              return (
                <section className="menu-stats-section" key={`stats-${modeKey}`}>
                  <header>
                    <h4>{meta?.label ?? modeKey}</h4>
                    {meta?.description && <p>{meta.description}</p>}
                  </header>
                  <ExamStatsPanel
                    examMode={modeKey}
                    stats={examStats}
                    formOptions={forms}
                    selectedForm={modeKey === examMode ? selectedForm : null}
                  />
                  <div className="menu-stats-section-actions">
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => onStartSpecificMode(modeKey, String(forms[0]))}
                    >
                      Diesen Modus starten
                    </button>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

