import React, { useState, useEffect } from "react";
import questions from "./questions_with_tips_and_explanations.json";
import Question from "./Question.jsx";
import {
  validateExamForms,
  getExamFormNumbers,
  getExamFormQuestions,
  DEFAULT_CATEGORY,
  createQuestionIndex,
  getExamModeKeys,
  getExamModeMeta,
  getExamModeFormCategories
} from "./utils/examForms.js";
import "./App.css";

const MISTAKES_KEY = "sbf-mistakes";
const PRACTICE_MODE_KEY = "sbf-mode";
const PROGRESS_IDX_KEY = "sbf-idx";
const MODE_KEY = "sbf-session-mode";
const MODE_CATEGORY_KEY = "sbf-mode-category";
const FORM_KEY = "sbf-selected-form";
const EXAM_MODE_KEY = "sbf-exam-mode";
const SUPPLEMENT_FORM_KEY = "sbf-selected-supplement";

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
  const [sessionMode, setSessionMode] = useState(() => {
    return localStorage.getItem(MODE_KEY) || null;
  });
  const [examCategory, setExamCategory] = useState(() => {
    return localStorage.getItem(MODE_CATEGORY_KEY) || DEFAULT_CATEGORY;
  });
  const [selectedForm, setSelectedForm] = useState(() => {
    return localStorage.getItem(FORM_KEY) || "";
  });
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [examMode, setExamMode] = useState(() => {
    return localStorage.getItem(EXAM_MODE_KEY) || "AM";
  });
  const [selectedSupplement, setSelectedSupplement] = useState(() => {
    return localStorage.getItem(SUPPLEMENT_FORM_KEY) || "";
  });

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
  useEffect(() => {
    if (sessionMode) {
      localStorage.setItem(MODE_KEY, sessionMode);
    }
  }, [sessionMode]);
  useEffect(() => {
    if (examCategory) {
      localStorage.setItem(MODE_CATEGORY_KEY, examCategory);
    }
  }, [examCategory]);
  useEffect(() => {
    if (selectedForm) {
      localStorage.setItem(FORM_KEY, selectedForm);
    } else {
      localStorage.removeItem(FORM_KEY);
    }
  }, [selectedForm]);
  useEffect(() => {
    if (examMode) {
      localStorage.setItem(EXAM_MODE_KEY, examMode);
    }
  }, [examMode]);
  useEffect(() => {
    if (selectedSupplement) {
      localStorage.setItem(SUPPLEMENT_FORM_KEY, selectedSupplement);
    } else {
      localStorage.removeItem(SUPPLEMENT_FORM_KEY);
    }
  }, [selectedSupplement]);

  useEffect(() => {
    if (sessionMode === "exam") {
      const [primaryCategory] = getExamModeFormCategories(examMode);
      if (primaryCategory && examCategory !== primaryCategory) {
        setExamCategory(primaryCategory);
      }
    }
  }, [sessionMode, examMode, examCategory]);

  useEffect(() => {
    setSelectedForm("");
    setSelectedSupplement("");
    setIdx(0);
    setShowResult(false);
  }, [examMode]);

  useEffect(() => {
    if (import.meta.env?.DEV) {
      const validation = validateExamForms(questions);
      if (!validation.ok) {
        console.warn("Exam form catalogue validation issues detected:");
        validation.issues.forEach(issue => console.warn(issue.message));
      }
    }
  }, []);

  const questionIndex = createQuestionIndex(questions);

  // Filter for practice modes
  let filteredQuestions = questions;
  if (sessionMode === "exam") {
    if (examMode === "AMS") {
      if (selectedForm && selectedSupplement) {
        try {
          const motorQuestions = getExamFormQuestions(selectedForm, questionIndex, "motor");
          const supplementQuestions = getExamFormQuestions(selectedSupplement, questionIndex, "sailSupplements");
          filteredQuestions = [...motorQuestions, ...supplementQuestions];
        } catch (error) {
          console.error(error);
          filteredQuestions = [];
        }
      } else {
        filteredQuestions = [];
      }
    } else if (examMode === "Supplement") {
      if (selectedForm) {
        try {
          filteredQuestions = getExamFormQuestions(selectedForm, questionIndex, "sailSupplements");
        } catch (error) {
          console.error(error);
          filteredQuestions = [];
        }
      } else {
        filteredQuestions = [];
      }
    } else {
      if (selectedForm) {
        try {
          const category = examMode === "S" ? "sail" : "motor";
          filteredQuestions = getExamFormQuestions(selectedForm, questionIndex, category);
        } catch (error) {
          console.error(error);
          filteredQuestions = [];
        }
      } else {
        filteredQuestions = [];
      }
    }
  } else {
    if (practiceMode === "wrong") {
      filteredQuestions = questions.filter(q => mistakes[q.id] >= 1);
    } else if (practiceMode === "wrong-twice") {
      filteredQuestions = questions.filter(q => mistakes[q.id] >= 2);
    }
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

  const totalQuestions = filteredQuestions.length;
  const progressPercent = totalQuestions > 0
    ? Math.round((idx / totalQuestions) * 100)
    : 0;
  const questionCounterDisplay = Math.min(idx + 1, Math.max(totalQuestions, 1));

  const examModeKeys = getExamModeKeys();
  const examModeMeta = getExamModeMeta(examMode);
  const primaryCategory = examModeMeta?.composite?.primaryCategory
    ?? examModeMeta?.formCategory
    ?? DEFAULT_CATEGORY;
  const supplementCategory = examModeMeta?.composite?.supplementCategory ?? null;

  const formOptions = sessionMode === "exam"
    ? getExamFormNumbers(primaryCategory)
    : [];
  const supplementOptions = supplementCategory
    ? getExamFormNumbers(supplementCategory)
    : [];
  const isExamSession = sessionMode === "exam";
  const examNeedsSelection = isExamSession && (
    (examMode === "AMS" ? !(selectedForm && selectedSupplement) : !selectedForm)
  );

  return (
    <div className="container">
      {(!sessionMode || sessionMode === "welcome") && (
        <div className="welcome-overlay">
          <div className="welcome-card">
            <div className="welcome-header">
              <span className="logo badge-logo">⚓️</span>
              <h2>Willkommen an Bord!</h2>
              <p>Wie möchtest du trainieren?</p>
            </div>
            <div className="welcome-actions">
              <button
                className="mode-card"
                onClick={() => {
                  setSessionMode("practice");
                }}
              >
                <span className="mode-icon">📘</span>
                <h3>Übungsmodus</h3>
                <p>Alle Fragen oder gezielt falsch beantwortete wiederholen.</p>
              </button>
              <button
                className="mode-card"
                onClick={() => {
                  setSessionMode("exam");
                }}
              >
                <span className="mode-icon">🧭</span>
                <h3>Fragebogen</h3>
                <p>Original Prüfungsbögen (Motor &amp; Segeln) simulieren.</p>
              </button>
            </div>
            <div className="welcome-footer">
              <button className="link-button" onClick={() => setIsAboutOpen(true)}>
                Über die App
              </button>
            </div>
          </div>
          {isAboutOpen && (
            <AboutOverlay onClose={() => setIsAboutOpen(false)} />
          )}
        </div>
      )}
      {isExamSession && (
        <div className="exam-toolbar">
          <div className="toolbar-group">
            <label>Version</label>
            <select
              value={examMode}
              onChange={event => {
                const value = event.target.value;
                setExamMode(value);
              }}
            >
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
          {formOptions.length > 0 && (
            <div className="toolbar-group">
              <label>
                {examMode === "S"
                  ? "Segel-Fragebogen"
                  : examMode === "Supplement"
                    ? "Segel-Zusatzbogen"
                    : "Motor-Fragebogen"}
              </label>
              <select
                value={selectedForm}
                onChange={event => {
                  const value = event.target.value;
                  setSelectedForm(value);
                  setIdx(0);
                  setShowResult(false);
                  if (examMode === "AMS") {
                    const fallbackSupplement = value ? `E${value}` : "";
                    if (fallbackSupplement && !selectedSupplement) {
                      setSelectedSupplement(fallbackSupplement);
                    }
                  }
                }}
              >
                <option value="">Bitte wählen</option>
                {formOptions.map(option => (
                  <option key={String(option)} value={String(option)}>
                    {String(option)}
                  </option>
                ))}
              </select>
            </div>
          )}
          {examMode === "AMS" && supplementOptions.length > 0 && (
            <div className="toolbar-group">
              <label>Segel-Zusatzbogen</label>
              <select
                value={selectedSupplement}
                onChange={event => {
                  setSelectedSupplement(event.target.value);
                  setIdx(0);
                  setShowResult(false);
                }}
              >
                <option value="">Bitte wählen</option>
                {supplementOptions.map(option => (
                  <option key={String(option)} value={String(option)}>
                    {String(option)}
                  </option>
                ))}
              </select>
            </div>
          )}
          {examModeMeta && (
            <div className="exam-meta">
              <span>
                {examModeMeta.questionCount} Fragen · {examModeMeta.timeMinutes} Min
                {examModeMeta.maxWrong != null && ` · max. ${examModeMeta.maxWrong} Fehler`}
              </span>
            </div>
          )}
          <button
            className="link-button"
            onClick={() => setSessionMode("welcome")}
          >
            Zurück
          </button>
        </div>
      )}
      <header className="header">
        <div className="brand">
          <span className="logo">⚓️</span>
          <h1>SBF Binnen Trainer</h1>
        </div>
        <p className="subtitle">Sportbootführerschein Binnen – Üben & Verstehen</p>
      </header>
      {totalQuestions === 0 ? (
        <div className="card empty-card">
          <h2 className="empty-title">
            {examNeedsSelection ? "Wähle einen Fragebogen" : "Noch keine Fragen hier"}
          </h2>
          <p className="empty-text">
            {examNeedsSelection
              ? "Bitte wähle die passende Prüfungsvariante und den Fragebogen, um zu starten."
              : "In diesem Modus gibt es aktuell keine Fragen. Wechsle zurück zu allen Fragen oder beantworte erst Fragen, damit sie hier erscheinen."}
          </p>
          {!examNeedsSelection && (
            <div className="empty-actions">
              <button className="primary-button" onClick={() => setPracticeMode("all")}>
                Zurück zu allen Fragen
              </button>
            </div>
          )}
        </div>
      ) : showResult ? (
        <div className="card result-card">
          <h2 className="result-title">Fertig!</h2>
          <p className="result-score">
            Richtige Antworten: <strong>{score}</strong> / {totalQuestions}
          </p>
          <div className="result-actions">
            <button className="primary-button" onClick={restart}>Neu starten</button>
            <button className="secondary-button" onClick={clearProgress}>Fortschritt löschen</button>
          </div>
        </div>
      ) : (
        <>
          <div className="controls">
            {isExamSession ? (
              <span className="controls-hint">
                {examModeMeta?.label ?? "Fragebogen"}
                {": "}
                {selectedForm || "–"}
                {examMode === "AMS" && ` + ${selectedSupplement || "–"}`}
              </span>
            ) : (
              <>
                <button
                  onClick={() => setPracticeMode("all")}
                  data-active={practiceMode === "all" ? "true" : undefined}
                >
                  Alle Fragen
                </button>
                <button
                  onClick={() => setPracticeMode("wrong")}
                  data-active={practiceMode === "wrong" ? "true" : undefined}
                >
                  Nur falsche (mind. 1x)
                </button>
                <button
                  onClick={() => setPracticeMode("wrong-twice")}
                  data-active={practiceMode === "wrong-twice" ? "true" : undefined}
                >
                  Nur falsche (mind. 2x)
                </button>
              </>
            )}
            <button className="secondary-button" onClick={clearProgress}>
              Fortschritt löschen
            </button>
            <button className="link-button" onClick={() => setIsAboutOpen(true)}>
              Über die App
            </button>
          </div>
          <div className="progress-meta">
            <span>Fortschritt</span>
            <span>
              {progressPercent}% · Frage {questionCounterDisplay} / {totalQuestions}
            </span>
          </div>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
            <div className="ship-marker" style={{ left: `calc(${progressPercent}% - 12px)` }}>⛵</div>
          </div>
          <div className="card">
            <Question
              data={filteredQuestions[idx]}
              onAnswer={handleAnswer}
              qNum={idx + 1}
              total={filteredQuestions.length}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;

function AboutOverlay({ onClose }) {
  return (
    <div className="about-overlay" role="dialog" aria-modal="true">
      <div className="about-card">
        <div className="about-header">
          <h2>Über diese App</h2>
          <button className="link-button" onClick={onClose}>Schließen</button>
        </div>
        <div className="about-content">
          <p>
            <strong>SBF Binnen Trainer</strong> hilft dir, den amtlichen Sportbootführerschein Binnen zu bestehen.
            Du kannst frei üben oder original Fragebogen simulieren. Tipps und Erklärungen kommen direkt vom Entwickler, damit du auch ohne Netz dein Wissen festigen kannst.
          </p>
          <p>
            <strong>Entwickler:</strong> Koen Vannisselroij – Freizeit Skipper und Software-Engineer. Diese App ist ein Community-Projekt und
            steht in keiner Verbindung zum BMDV oder ELWIS.
          </p>
          <p>
            <strong>Zweck:</strong> Offline lernen, Fortschritt lokal speichern und jederzeit wissen, welche Fragen noch sitzen müssen.
            Feedback und Ideen sind willkommen: <a href="mailto:koen.nissel@gmail.com">koen.nissel@gmail.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
