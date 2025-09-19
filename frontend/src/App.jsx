import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";
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
import hintBadge from "./assets/icons/hint_badge_lighthouse.svg";
import progressBoat from "./assets/animations/boat_only_loading_0d9ad9.svg";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import ProgressStrip from "./components/ProgressStrip.jsx";
import SessionControls from "./components/SessionControls.jsx";
import ExamSelectorOverlay from "./components/ExamSelectorOverlay.jsx";
import HeaderBar from "./components/HeaderBar.jsx";
import ConfirmExitDialog from "./components/ConfirmExitDialog.jsx";
import MenuPopover from "./components/MenuPopover.jsx";

const MISTAKES_KEY = "sbf-mistakes";
const PRACTICE_MODE_KEY = "sbf-mode";
const MODE_KEY = "sbf-session-mode";
const MODE_CATEGORY_KEY = "sbf-mode-category";
const FORM_KEY = "sbf-selected-form";
const EXAM_MODE_KEY = "sbf-exam-mode";
const SUPPLEMENT_FORM_KEY = "sbf-selected-supplement";
const EXAM_STATS_KEY = "sbf-exam-stats";
const PRACTICE_IDX_KEY = "sbf-practice-idx";
const PRACTICE_PROGRESS_KEY = "sbf-practice-progress";
const EXAM_PROGRESS_KEY = "sbf-exam-progress";

function App() {
  // Load from localStorage or fallback to default
  const [mistakes, setMistakes] = useState(() => {
    const val = localStorage.getItem(MISTAKES_KEY);
    return val ? JSON.parse(val) : {};
  });
  const [practiceMode, setPracticeMode] = useState(() => {
    return localStorage.getItem(PRACTICE_MODE_KEY) || "all";
  });
  const [practiceIdx, setPracticeIdx] = useState(() => {
    const val = localStorage.getItem(PRACTICE_IDX_KEY);
    return val ? parseInt(val, 10) : 0;
  });
  const [practiceProgress, setPracticeProgress] = useState(() => {
    try {
      const raw = localStorage.getItem(PRACTICE_PROGRESS_KEY);
      return raw ? JSON.parse(raw) : { all: 0, wrong: 0, "wrong-twice": 0 };
    } catch (error) {
      console.warn("Practice progress could not be read", error);
      return { all: 0, wrong: 0, "wrong-twice": 0 };
    }
  });
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [sessionMode, setSessionMode] = useState(() => {
    return localStorage.getItem(MODE_KEY) || null;
  });
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [menuView, setMenuView] = useState("mode");
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
  const [examStats, setExamStats] = useState(() => {
    try {
      const raw = localStorage.getItem(EXAM_STATS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      console.warn("Exam stats could not be read", error);
      return {};
    }
  });
  const [examProgress, setExamProgress] = useState(() => {
    try {
      const raw = localStorage.getItem(EXAM_PROGRESS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      console.warn("Exam progress could not be read", error);
      return {};
    }
  });
  const [isExamSelectorOpen, setIsExamSelectorOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const webPopHandlerRef = useRef(null);

  // Save to localStorage whenever these states change
  useEffect(() => {
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(mistakes));
  }, [mistakes]);
  useEffect(() => {
    localStorage.setItem(PRACTICE_MODE_KEY, practiceMode);
  }, [practiceMode]);
  useEffect(() => {
    localStorage.setItem(PRACTICE_IDX_KEY, String(practiceIdx));
  }, [practiceIdx]);
  useEffect(() => {
    try {
      localStorage.setItem(PRACTICE_PROGRESS_KEY, JSON.stringify(practiceProgress));
    } catch (error) {
      console.warn("Could not persist practice progress", error);
    }
  }, [practiceProgress]);
  useEffect(() => {
    if (sessionMode) {
      localStorage.setItem(MODE_KEY, sessionMode);
    } else {
      localStorage.removeItem(MODE_KEY);
    }
  }, [sessionMode]);
  useEffect(() => {
    if (examCategory) {
      localStorage.setItem(MODE_CATEGORY_KEY, examCategory);
    } else {
      localStorage.removeItem(MODE_CATEGORY_KEY);
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
    if (sessionMode !== "practice") {
      setShowResult(false);
      setScore(0);
      setUserAnswers([]);
    }
  }, [examMode]);

  useEffect(() => {
    if (examMode === "AMS") {
      const expectedSupplement = selectedForm ? `E${selectedForm}` : "";
      if (selectedSupplement !== expectedSupplement) {
        setSelectedSupplement(expectedSupplement);
      }
    }
  }, [examMode, selectedForm, selectedSupplement]);

  useEffect(() => {
    if (sessionMode === "exam") {
      setIsExamSelectorOpen(!selectedForm);
    } else {
      setIsExamSelectorOpen(false);
    }
  }, [sessionMode, selectedForm]);

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
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  const updateHeaderMetrics = useCallback(() => {
    if (!headerRef.current) {
      return;
    }
    const rect = headerRef.current.getBoundingClientRect();
    setHeaderHeight(rect.height);
  }, []);

  useLayoutEffect(() => {
    updateHeaderMetrics();
    window.addEventListener("resize", updateHeaderMetrics);
    return () => window.removeEventListener("resize", updateHeaderMetrics);
  }, [updateHeaderMetrics]);

  useEffect(() => {
    const isNative = Capacitor.isNativePlatform && Capacitor.isNativePlatform();
    if (isNative) {
      const remove = CapacitorApp.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          setShowExitConfirm(true);
        }
      });
      return () => {
        remove?.remove();
      };
    }

    const handler = (event) => {
      event.preventDefault();
      setShowExitConfirm(true);
      window.history.pushState(null, "", window.location.href);
    };
    webPopHandlerRef.current = handler;
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handler);
    return () => {
      window.removeEventListener("popstate", handler);
    };
  }, []);

  function recordExamResult(modeKey, formKey, correct, total) {
    if (!modeKey || !formKey || !Number.isFinite(total) || total <= 0) {
      return;
    }
    const normalizedFormKey = String(formKey);
    setExamStats(prev => {
      const next = { ...prev };
      const modeMap = { ...(next[modeKey] || {}) };
      const existing = modeMap[normalizedFormKey];
      const attempts = (existing?.attempts || 0) + 1;
      const now = new Date().toISOString();
      const currentPercent = total > 0 ? Math.max(Math.min(correct / total, 1), 0) : 0;
      const previousBest = typeof existing?.bestPercent === "number" ? existing.bestPercent : -1;
      let bestPercent = previousBest;
      let bestCorrect = existing?.bestCorrect ?? 0;
      let bestTotal = existing?.bestTotal ?? total;
      let bestTimestamp = existing?.bestTimestamp ?? null;

      if (currentPercent >= previousBest) {
        bestPercent = currentPercent;
        bestCorrect = correct;
        bestTotal = total;
        bestTimestamp = now;
      }

      const record = {
        attempts,
        lastCorrect: correct,
        lastTotal: total,
        lastTimestamp: now,
        bestCorrect,
        bestTotal,
        bestPercent,
        bestTimestamp
      };

      modeMap[normalizedFormKey] = record;
      next[modeKey] = modeMap;
      try {
        localStorage.setItem(EXAM_STATS_KEY, JSON.stringify(next));
      } catch (error) {
        console.warn("Could not persist exam stats", error);
      }
      return next;
    });
  }

  function updateExamProgress(modeKey, formKey, value) {
    if (!modeKey || !formKey || !Number.isFinite(value)) {
      return;
    }
    const normalizedFormKey = String(formKey);
    setExamProgress(prev => {
      const next = { ...prev };
      const modeMap = { ...(next[modeKey] || {}) };
      modeMap[normalizedFormKey] = value;
      next[modeKey] = modeMap;
      try {
        localStorage.setItem(EXAM_PROGRESS_KEY, JSON.stringify(next));
      } catch (error) {
        console.warn("Could not persist exam progress", error);
      }
      return next;
    });
  }

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

  const isExamSession = sessionMode === "exam";
  const totalQuestions = filteredQuestions.length;
  const examModeKeys = getExamModeKeys();
  const examModeMeta = getExamModeMeta(examMode);
  const primaryCategory = examModeMeta?.composite?.primaryCategory
    ?? examModeMeta?.formCategory
    ?? DEFAULT_CATEGORY;
  const primaryFormOptions = getExamFormNumbers(primaryCategory);
  const formOptions = isExamSession ? primaryFormOptions : [];
  const examModeMap = examProgress[examMode] || {};
  const storedExamIdx = isExamSession && selectedForm
    ? examModeMap[String(selectedForm)] || 0
    : 0;
  const activeIdxRaw = isExamSession ? storedExamIdx : practiceIdx;
  const clampedIdx = totalQuestions > 0
    ? Math.min(Math.max(activeIdxRaw, 0), totalQuestions - 1)
    : 0;
  const progressPercent = totalQuestions > 0
    ? Math.round((clampedIdx / totalQuestions) * 100)
    : 0;
  const questionCounterDisplay = totalQuestions > 0 ? clampedIdx + 1 : 0;
  const examNeedsSelection = isExamSession && !selectedForm;
  const isExamSelectorVisible = isExamSession && isExamSelectorOpen && !isMenuOpen;
  const progressSectionClass = isExamSelectorVisible ? "progress-section overlay-open" : "progress-section";
  const isNativeApp = Capacitor.isNativePlatform && Capacitor.isNativePlatform();

  function confirmExit() {
    if (isNativeApp) {
      CapacitorApp.exitApp();
      return;
    }
    if (webPopHandlerRef.current) {
      window.removeEventListener("popstate", webPopHandlerRef.current);
    }
    window.history.go(-1);
  }

  function cancelExit() {
    setShowExitConfirm(false);
    if (!isNativeApp) {
      window.history.pushState(null, "", window.location.href);
    }
  }
  const containerStyle = headerHeight
    ? { '--header-height': `${headerHeight}px` }
    : undefined;

  function toggleMenu(view = "mode") {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    } else {
      setMenuView(view);
      updateMenuAnchor();
      setIsMenuOpen(true);
    }
  }

  // no-op: menu scroll reset removed after popover extraction

  // Reset state when mode changes (and store progress)
  useEffect(() => {
    const nextIdx = practiceProgress[practiceMode] || 0;
    setPracticeIdx(nextIdx);
    setShowResult(false);
    setScore(0);
    setUserAnswers([]);
  }, [practiceMode, practiceProgress]);

  useEffect(() => {
    if (totalQuestions <= 0) {
      return;
    }
    if (!isExamSession) {
      if (practiceIdx >= totalQuestions) {
        setPracticeIdx(Math.max(totalQuestions - 1, 0));
      }
    } else if (selectedForm) {
      if (storedExamIdx >= totalQuestions) {
        updateExamProgress(examMode, selectedForm, Math.max(totalQuestions - 1, 0));
      }
    }
  }, [isExamSession, practiceIdx, storedExamIdx, totalQuestions, examMode, selectedForm]);

  function handleAnswer(isCorrect) {
    const currentSet = filteredQuestions;
    if (!currentSet.length) return;

    const modeMap = examProgress[examMode] || {};
    const storedExamIdx = selectedForm ? modeMap[String(selectedForm)] : 0;
    const activeIdx = isExamSession ? storedExamIdx || 0 : practiceIdx;
    const clampedIdx = currentSet.length > 0
      ? Math.min(Math.max(activeIdx, 0), currentSet.length - 1)
      : 0;

    const currentQuestion = currentSet[clampedIdx];
    if (!currentQuestion) return;

    const qId = currentQuestion.id;
    if (!isCorrect) {
      setMistakes(m => ({ ...m, [qId]: (m[qId] || 0) + 1 }));
    }
    setUserAnswers(prev => [...prev, isCorrect]);

    const updatedScore = isCorrect ? score + 1 : score;
    setScore(updatedScore);

    const isLastQuestion = clampedIdx >= currentSet.length - 1;

    if (isLastQuestion) {
      if (sessionMode === "exam" && selectedForm) {
        recordExamResult(examMode, selectedForm, updatedScore, currentSet.length);
        updateExamProgress(examMode, selectedForm, 0);
      } else {
        setPracticeIdx(0);
        setPracticeProgress(prev => ({ ...prev, [practiceMode]: 0 }));
      }
      setShowResult(true);
    } else {
      const nextIdx = clampedIdx + 1;
      if (sessionMode === "exam" && selectedForm) {
        updateExamProgress(examMode, selectedForm, nextIdx);
      } else {
        setPracticeIdx(nextIdx);
        setPracticeProgress(prev => ({ ...prev, [practiceMode]: nextIdx }));
      }
    }
  }

  function restart() {
    if (sessionMode === "exam" && selectedForm) {
      updateExamProgress(examMode, selectedForm, 0);
    } else {
      setPracticeIdx(0);
      setPracticeProgress(prev => ({ ...prev, [practiceMode]: 0 }));
    }
    setScore(0);
    setShowResult(false);
    setUserAnswers([]);
  }

  // For demo: clear progress (optional button)
  function clearProgress() {
    if (!window.confirm("Fortschritt wirklich komplett löschen?")) return;

    localStorage.clear();

    if (isExamSession && selectedForm) {
      updateExamProgress(examMode, selectedForm, 0);
      setScore(0);
      setShowResult(false);
      setUserAnswers([]);
      setIsMenuOpen(false);
    } else {
      setPracticeIdx(0);
      setPracticeProgress({ all: 0, wrong: 0, "wrong-twice": 0 });
      setScore(0);
      setShowResult(false);
      setUserAnswers([]);
    }
  }

  return (
    <div className="container" style={containerStyle}>
      {isMenuOpen && <div className="menu-backdrop" onClick={() => setIsMenuOpen(false)} />}
      <MenuPopover
        isOpen={isMenuOpen}
        view={menuView}
        onClose={() => setIsMenuOpen(false)}
        onChangeView={setMenuView}
        sessionMode={sessionMode}
        totalQuestions={totalQuestions}
        questionCounterDisplay={questionCounterDisplay}
        examModeMeta={examModeMeta}
        selectedForm={selectedForm}
        examMode={examMode}
        examStats={examStats}
        examModeKeys={getExamModeKeys()}
        onStartPractice={() => { setSessionMode('practice'); setIsMenuOpen(false); }}
        onStartExam={() => { setSessionMode('exam'); setIsMenuOpen(false); }}
        onOpenAbout={() => { setIsAboutOpen(true); setMenuView('mode'); }}
        onStartSpecificMode={(modeKey, firstForm) => {
          setSessionMode('exam');
          setSelectedForm(firstForm);
          setExamMode(modeKey);
          setMenuView('mode');
          setIsMenuOpen(false);
        }}
      />
      {isAboutOpen && (
        <AboutOverlay onClose={() => setIsAboutOpen(false)} />
      )}
      <HeaderBar ref={headerRef} onToggleMenu={() => toggleMenu("mode")} />
      <main className="page-body">
        {isExamSelectorVisible && (
          <ExamSelectorOverlay
            examMode={examMode}
            examModeKeys={examModeKeys}
            formOptions={formOptions}
            selectedForm={selectedForm}
            examModeMeta={examModeMeta}
            onModeChange={value => {
              setExamMode(value);
              setSelectedForm("");
              setSelectedSupplement("");
            }}
            onFormChange={value => {
              setSelectedForm(value);
              setShowResult(false);
              setScore(0);
              setUserAnswers([]);
              if (examMode === "AMS") {
                setSelectedSupplement(value ? `E${value}` : "");
              }
              if (value) {
                setIsExamSelectorOpen(false);
              }
            }}
            onReset={() => {
              if (!selectedForm) return;
              const label = formatFormLabel(examMode, selectedForm);
              if (window.confirm(`${label}: Fortschritt wirklich zurücksetzen?`)) {
                updateExamProgress(examMode, selectedForm, 0);
                setScore(0);
                setShowResult(false);
                setUserAnswers([]);
              }
            }}
            canClose={Boolean(selectedForm)}
            onClose={() => {
              if (selectedForm) {
                setIsExamSelectorOpen(false);
              }
            }}
          />
        )}
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
          <div className="session-content">
            <ProgressStrip
              className={progressSectionClass}
              progressPercent={progressPercent}
              questionCounterDisplay={questionCounterDisplay}
              totalQuestions={totalQuestions}
              progressBoat={progressBoat}
            />
            <div className="question-section">
              <div className="card">
                <Question
                  data={filteredQuestions[clampedIdx]}
                  onAnswer={handleAnswer}
                  qNum={clampedIdx + 1}
                  total={filteredQuestions.length}
                />
              </div>
            </div>
            <SessionControls
              isExamSession={isExamSession}
              examModeMeta={examModeMeta}
              selectedForm={selectedForm}
              selectedSupplement={selectedSupplement}
              isExamSelectorVisible={isExamSelectorVisible}
              onOpenExamSelector={() => setIsExamSelectorOpen(true)}
              practiceMode={practiceMode}
              onSetPracticeMode={setPracticeMode}
              onClearProgress={clearProgress}
              canClear={!(clampedIdx === 0 && !showResult)}
              onOpenAbout={() => setIsAboutOpen(true)}
              showResult={showResult}
            />
          </div>
        )}
      </main>
      {showExitConfirm && (
        <ConfirmExitDialog onConfirm={confirmExit} onCancel={cancelExit} />
      )}
    </div>
  );
}

export default App;

// ExamSelectorOverlay and ExamStatsPanel are imported from components

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
