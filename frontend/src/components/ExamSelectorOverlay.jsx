import React from 'react';
import { getExamModeMeta } from '../utils/examForms.js';

export default function ExamSelectorOverlay({
  examMode,
  examModeKeys,
  formOptions,
  selectedForm,
  examModeMeta,
  onModeChange,
  onFormChange,
  onReset,
  onClose,
  canClose
}) {
  const modeLabel = examMode === 'S'
    ? 'Segel-Fragebogen'
    : examMode === 'Supplement'
      ? 'Segel-Zusatzbogen'
      : examMode === 'AMS'
        ? 'Kombi-Fragebogen'
        : 'Motor-Fragebogen';

  return (
    <div className="exam-selector-overlay" role="dialog" aria-modal="true">
      <div className="exam-selector-card">
        <div className="exam-selector-header">
          <h2>Fragebogen auswählen</h2>
          {canClose && (
            <button type="button" className="link-button" onClick={onClose}>
              Schließen
            </button>
          )}
        </div>
        <div className="exam-selector-body">
          <div className="toolbar-group">
            <label>Version</label>
            <select value={examMode} onChange={event => onModeChange(event.target.value)}>
              {examModeKeys.map(modeKey => {
                const meta = getExamModeMeta(modeKey);
                return (
                  <option key={modeKey} value={modeKey}>
                    {meta?.label ?? modeKey}
                  </option>
                );
              })}
            </select>
          </div>
          {formOptions && formOptions.length > 0 ? (
            <div className="toolbar-group">
              <label>{modeLabel}</label>
              <select value={selectedForm} onChange={event => onFormChange(event.target.value)}>
                <option value="">Bitte wählen</option>
                {formOptions.map(option => (
                  <option key={String(option)} value={String(option)}>
                    {String(option)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="exam-selector-empty">Für diese Version sind keine Fragebögen hinterlegt.</p>
          )}
          {examModeMeta && (
            <div className="exam-selector-meta">
              <span>
                {examModeMeta.questionCount} Fragen · {examModeMeta.timeMinutes} Min
                {examModeMeta.maxWrong != null && ` · max. ${examModeMeta.maxWrong} Fehler`}
              </span>
              <div className="exam-selector-actions">
                <button
                  type="button"
                  className="link-button"
                  onClick={onReset}
                  disabled={!selectedForm}
                >
                  Fortschritt zurücksetzen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

