import React, { useState, useMemo } from "react";
import shuffleOptions from "./utils/shuffleOptions";

function Question({ data, onAnswer, qNum, total }) {
  // Shuffle answers only once per question (memoized)
  const { shuffled, newCorrectIdx } = useMemo(() => 
    shuffleOptions(data.options, data.answer), [data]);

  const [selected, setSelected] = useState(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [isTipOverlayOpen, setIsTipOverlayOpen] = useState(false);
  const [tipOverlayMode, setTipOverlayMode] = useState(null);
  const hasTip = Boolean(data.tip);
  const hasExplanation = Boolean(data.explanation);
  const hasSupplemental = hasTip || hasExplanation;

  function handleClick(optionIdx) {
    const isCorrect = optionIdx === newCorrectIdx;
    setSelected(optionIdx);
    setShowCorrect(true);
    closeTipOverlay();
  }

  function handleContinue() {
    if (selected == null) return;
    const isCorrect = selected === newCorrectIdx;
    onAnswer(isCorrect);
    setSelected(null);
    setShowCorrect(false);
    closeTipOverlay();
  }

  function openTipOverlay(mode) {
    if (!hasSupplemental) return;
    setTipOverlayMode(mode);
    setIsTipOverlayOpen(true);
  }

  function closeTipOverlay() {
    setIsTipOverlayOpen(false);
    setTipOverlayMode(null);
  }

  return (
    <div>
      <div className="question-meta">
        <span className="question-index">Frage {qNum}<span className="question-total">/{total}</span></span>
        <span className="question-id">Katalog-ID {data.id}</span>
      </div>
      <h3 className="question-title">{data.question}</h3>
      <ul className="option-list">
        {shuffled.map((opt, i) => {
          let className = "option-button";
          if (selected != null) {
            if (i === selected) {
              className += selected === newCorrectIdx ? " option-correct" : " option-wrong";
            }
            if (showCorrect && selected !== newCorrectIdx && i === newCorrectIdx) {
              // Reveal the correct answer in green when the user was wrong
              className += " option-revealed";
            }
          }
          return (
            <li key={i}>
              <button
                className={className}
                onClick={() => handleClick(i)}
                disabled={selected != null}
              >
                <span className="badge">{String.fromCharCode(65 + i)}</span>
                <span>{opt}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {hasTip && (
        <div className="question-tools">
          <button
            type="button"
            className="link-button tip-link"
            onClick={() => openTipOverlay('tip')}
          >
            Tipp anzeigen
          </button>
        </div>
      )}
      {showCorrect && (
        <div className={`feedback ${selected === newCorrectIdx ? 'correct' : 'wrong'}`}>
          {selected === newCorrectIdx
            ? "✅ Richtig!"
            : `❌ Falsch! Korrekt: "${shuffled[newCorrectIdx]}"`}
        </div>
      )}
      {showCorrect && (
        <div className="question-actions">
          {selected !== newCorrectIdx && hasExplanation && (
            <button
              type="button"
              className="secondary-button"
              onClick={() => openTipOverlay('full')}
            >
              Hintergrund anzeigen
            </button>
          )}
          <button className="primary-button" onClick={handleContinue}>Weiter</button>
        </div>
      )}
      {isTipOverlayOpen && hasSupplemental && (
        <div className="tip-overlay" role="dialog" aria-modal="true">
          <div className="tip-modal">
            <div className="tip-modal-content">
              {tipOverlayMode === 'tip' && hasTip && (
                <div className="tip-card" style={{ marginBottom: 12 }}>
                  <strong>Skipper‑Tipp:</strong>
                  <div style={{ marginTop: 6 }}>{data.tip}</div>
                </div>
              )}
              {tipOverlayMode === 'full' && hasExplanation && (
                <div className="exp-card">
                  <strong>Hintergrund:</strong>
                  <div style={{ marginTop: 6 }}>{data.explanation}</div>
                </div>
              )}
            </div>
            <div className="tip-modal-actions">
              <button className="secondary-button" onClick={closeTipOverlay}>Schließen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Question;
