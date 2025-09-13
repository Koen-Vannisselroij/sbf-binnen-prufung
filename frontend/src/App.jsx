import React, { useState, useEffect } from "react";
import questions from "./questions_with_tips_and_explanations.json";
import Question from "./Question";
import "./App.css";

const MISTAKES_KEY = "sbf-mistakes";
const PRACTICE_MODE_KEY = "sbf-mode";
const PROGRESS_IDX_KEY = "sbf-idx";

function App() {
  // Load from localStorage or fallback to default
  const [mistakes, setMistakes] = useState(() => {
    const val = localStorage.getItem(MISTAKES_KEY);
    return val ? JSON.parse(val) : {};
  });
  const [practiceMode, setPracticeMode] = useState(() => {
    return localStorage.getItem(PRACTICE_MODE_KEY) || "all";
  });
  const [idx, setIdx] = useState(() => {
    const val = localStorage.getItem(PROGRESS_IDX_KEY);
    return val ? parseInt(val, 10) : 0;
  });
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);

  // Save to localStorage whenever these states change
  useEffect(() => {
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(mistakes));
  }, [mistakes]);
  useEffect(() => {
    localStorage.setItem(PRACTICE_MODE_KEY, practiceMode);
  }, [practiceMode]);
  useEffect(() => {
    localStorage.setItem(PROGRESS_IDX_KEY, idx);
  }, [idx]);

  // Filter for practice modes
  let filteredQuestions = questions;
  if (practiceMode === "wrong") {
    filteredQuestions = questions.filter(q => mistakes[q.id] >= 1);
  } else if (practiceMode === "wrong-twice") {
    filteredQuestions = questions.filter(q => mistakes[q.id] >= 2);
  }

  // Reset state when mode changes (and store progress)
  useEffect(() => {
    setIdx(0);
    setShowResult(false);
    setScore(0);
    setUserAnswers([]);
    // Don't reset mistakes here!
  }, [practiceMode]);

  function handleAnswer(isCorrect) {
    const qId = filteredQuestions[idx].id;
    if (!isCorrect) {
      setMistakes(m => ({ ...m, [qId]: (m[qId] || 0) + 1 }));
    }
    setUserAnswers([...userAnswers, isCorrect]);
    if (isCorrect) setScore(score + 1);
    if (idx < filteredQuestions.length - 1) setIdx(idx + 1);
    else setShowResult(true);
  }

  function restart() {
    setIdx(0);
    setScore(0);
    setShowResult(false);
    setUserAnswers([]);
    // idx will be stored in localStorage due to the effect
  }

  // For demo: clear progress (optional button)
  function clearProgress() {
    localStorage.clear();
    window.location.reload();
  }

  if (filteredQuestions.length === 0) {
    return (
      <div style={{ padding: 32 }}>
        <p>Keine Fragen in diesem Modus.</p>
        <button onClick={() => setPracticeMode("all")}>Zurück zu allen Fragen</button>
      </div>
    );
  }

  if (showResult) {
    return (
      <div style={{ padding: 32 }}>
        <h2>Fertig!</h2>
        <p>Richtige Antworten: {score} / {filteredQuestions.length}</p>
        <button onClick={restart}>Neu starten</button>
        <button onClick={clearProgress} style={{ marginLeft: 16 }}>Fortschritt löschen</button>
      </div>
    );
  }

  const progress = Math.round(((idx) / filteredQuestions.length) * 100);

  return (
    <div className="container">
      <header className="header">
        <div className="brand">
          <span className="logo">⚓️</span>
          <h1>SBF Binnen Trainer</h1>
        </div>
        <p className="subtitle">Sportbootführerschein Binnen – Üben & Verstehen</p>
      </header>
      <div className="controls">
        <button onClick={() => setPracticeMode("all")}>Alle Fragen</button>
        <button onClick={() => setPracticeMode("wrong")}>Nur falsche (mind. 1x)</button>
        <button onClick={() => setPracticeMode("wrong-twice")}>Nur falsche (mind. 2x)</button>
        <button className="secondary-button" onClick={clearProgress} style={{ marginLeft: "auto" }}>
          Fortschritt löschen
        </button>
      </div>
      <div className="progress">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
        <div className="ship-marker" style={{ left: `calc(${progress}% - 12px)` }}>⛵</div>
      </div>
      <div className="card">
        <Question
          data={filteredQuestions[idx]}
          onAnswer={handleAnswer}
          qNum={idx + 1}
          total={filteredQuestions.length}
        />
      </div>
    </div>
  );
}

export default App;
