import React, { useState, useMemo } from "react";
import shuffleOptions from "./utils/shuffleOptions";

function Question({ data, onAnswer, qNum, total }) {
  // Shuffle answers only once per question (memoized)
  const { shuffled, newCorrectIdx } = useMemo(() => 
    shuffleOptions(data.options, data.answer), [data]);

  const [selected, setSelected] = useState(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [isTipOverlayOpen, setIsTipOverlayOpen] = useState(false);
  const hasSupplemental = !!(data.tip || data.explanation);

  function handleClick(optionIdx) {
    const isCorrect = optionIdx === newCorrectIdx;
    setSelected(optionIdx);
    setShowCorrect(true);
    setIsTipOverlayOpen(false);
  }

  function handleContinue() {
    if (selected == null) return;
    const isCorrect = selected === newCorrectIdx;
    onAnswer(isCorrect);
    setSelected(null);
    setShowCorrect(false);
    setIsTipOverlayOpen(false);
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
      {showCorrect && (
        <div className={`feedback ${selected === newCorrectIdx ? 'correct' : 'wrong'}`}>
          {selected === newCorrectIdx
            ? "✅ Richtig!"
            : `❌ Falsch! Korrekt: "${shuffled[newCorrectIdx]}"`}
        </div>
      )}
      {showCorrect && (
        <div className="question-actions">
          {selected !== newCorrectIdx && hasSupplemental && (
            <button
              type="button"
              className="secondary-button"
              onClick={() => setIsTipOverlayOpen(true)}
            >
              Tipps & Hintergrund
            </button>
          )}
          <button className="primary-button" onClick={handleContinue}>Weiter</button>
        </div>
      )}
      {isTipOverlayOpen && hasSupplemental && (
        <div className="tip-overlay" role="dialog" aria-modal="true">
          <div className="tip-modal">
            <div className="tip-modal-content">
              {data.tip && (
                <div className="tip-card" style={{ marginBottom: 12 }}>
                  <strong>Skipper‑Tipp:</strong>
                  <div style={{ marginTop: 6 }}>{data.tip}</div>
                </div>
              )}
              {data.explanation && (
                <div className="exp-card">
                  <strong>Hintergrund:</strong>
                  <div style={{ marginTop: 6 }}>{data.explanation}</div>
                </div>
              )}
            </div>
            <div className="tip-modal-actions">
              <button className="primary-button" onClick={handleContinue}>Weiter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Question;
