import React from 'react';

function formatFormLabel(mode, key) {
  const numericPart = key.replace(/[^0-9]/g, "");
  switch (mode) {
    case "AM":
      return `Bogen ${numericPart || key}`;
    case "S":
      return `Segel ${numericPart || key}`;
    case "AMS":
      return `Kombi ${numericPart || key} + E${numericPart || key}`;
    case "Supplement":
      return `Zusatz ${numericPart || key}`;
    default:
      return `Bogen ${key}`;
  }
}

export default function ExamStatsPanel({ examMode, stats, formOptions, selectedForm }) {
  const keys = (formOptions || []).map(option => String(option));
  if (!keys.length) return null;

  const modeStats = (stats && stats[examMode]) || {};

  return (
    <div className="exam-stats">
      {keys.map(key => {
        const record = modeStats[key];
        const bestPercentValue = record && typeof record.bestPercent === "number" && record.bestPercent >= 0
          ? Math.round(Math.min(Math.max(record.bestPercent * 100, 0), 100))
          : null;
        const lastPercentValue = record && record.lastTotal
          ? Math.round(Math.min(Math.max((record.lastCorrect / record.lastTotal) * 100, 0), 100))
          : null;
        const barWidth = bestPercentValue != null ? Math.min(Math.max(bestPercentValue, 4), 100) : 0;
        const isSelected = String(selectedForm || "") === key;

        return (
          <div className={`exam-stat-card${isSelected ? " selected" : ""}`} key={`${examMode}-${key}`}>
            <div className="exam-stat-header">
              <span>{formatFormLabel(examMode, key)}</span>
              <span>{bestPercentValue != null ? `${bestPercentValue}%` : "–"}</span>
            </div>
            <div className="exam-stat-progress">
              <span style={{ width: `${barWidth}%` }} />
            </div>
            <div className="exam-stat-meta">
              {record ? (
                <>
                  <span>Beste Runde: {record.bestCorrect}/{record.bestTotal}</span>
                  <span>
                    Letzte Runde: {record.lastCorrect}/{record.lastTotal}
                    {lastPercentValue != null ? ` (${lastPercentValue}%)` : ""}
                  </span>
                  <span>Versuche: {record.attempts}</span>
                </>
              ) : (
                <span>Noch keine Versuche</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

