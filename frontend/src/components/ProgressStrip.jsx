import React from 'react';

export default function ProgressStrip({ progressPercent, questionCounterDisplay, totalQuestions, progressBoat }) {
  return (
    <div className="progress-section">
      <div className="progress-meta">
        <span>Fortschritt</span>
        <span>
          {progressPercent}% · Frage {questionCounterDisplay} / {totalQuestions}
        </span>
      </div>
      <div className="progress">
        <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
        <div className="ship-marker" style={{ left: `${progressPercent}%` }}>
          <img src={progressBoat} alt="" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

