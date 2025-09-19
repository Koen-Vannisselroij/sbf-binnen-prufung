import React from 'react';

export default function ProgressStrip({ progressPercent, questionCounterDisplay, totalQuestions, progressBoat, className = 'progress-section' }) {
  return (
    <div className={className}>
      <div className="progress-meta">
        <span></span>
        <span>
          Frage {questionCounterDisplay} / {totalQuestions}
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
