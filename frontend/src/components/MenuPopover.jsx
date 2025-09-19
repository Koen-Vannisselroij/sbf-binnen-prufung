import React from 'react';
import headerBadge from '../assets/icons/header_badge_sailboat.svg';
import { DEFAULT_CATEGORY, getExamModeMeta, getExamFormNumbers } from '../utils/examForms.js';
import ExamStatsPanel from './ExamStatsPanel.jsx';
import MenuResume from './MenuResume.jsx';
import MenuModeCards from './MenuModeCards.jsx';

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
            <MenuResume
              sessionMode={sessionMode}
              totalQuestions={totalQuestions}
              questionCounterDisplay={questionCounterDisplay}
              examModeMeta={examModeMeta}
              selectedForm={selectedForm}
              onContinue={onClose}
            />
            <MenuModeCards
              onPractice={onStartPractice}
              onExam={onStartExam}
              onStats={() => onChangeView('stats')}
            />
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
