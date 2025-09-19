import React from 'react';
import practiceModeIcon from '../assets/icons/practice_mode_logbook.svg';
import examModeIcon from '../assets/icons/fragebogen_scroll_check.svg';
import statsModeIcon from '../assets/icons/stats_gauge_waves.svg';

export default function MenuModeCards({ onPractice, onExam, onStats }) {
  return (
    <div className="welcome-actions">
      <button className="mode-card" onClick={onPractice}>
        <span className="mode-icon">
          <img src={practiceModeIcon} alt="Übungsmodus" />
        </span>
        <h3>Übungsmodus</h3>
        <p>Alle Fragen oder gezielt falsch beantwortete wiederholen.</p>
      </button>
      <button className="mode-card" onClick={onExam}>
        <span className="mode-icon">
          <img src={examModeIcon} alt="Fragebogen" />
        </span>
        <h3>Fragebogen</h3>
        <p>Original Prüfungsbögen (Motor & Segeln) simulieren.</p>
      </button>
      <button className="mode-card" onClick={onStats}>
        <span className="mode-icon">
          <img src={statsModeIcon} alt="Statistiken" />
        </span>
        <h3>Statistiken</h3>
        <p>Überblick über deine Ergebnisse in allen Fragebögen.</p>
      </button>
    </div>
  );
}

