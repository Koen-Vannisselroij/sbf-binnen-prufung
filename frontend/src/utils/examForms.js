import rawExamForms from "../data/examForms.json";
import rawQuestionPools from "../data/questionPools.json";
import rawExamModes from "../data/examModes.json";

const EXPECTED_FORM_LENGTH = Object.freeze({
  motor: 30,
  sail: 25,
  sailSupplements: 7
});

function expandRange(range) {
  if (!Array.isArray(range) || range.length !== 2) return [];
  const [start, end] = range.map(Number);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return [];
  const result = [];
  for (let i = start; i <= end; i += 1) {
    result.push(i);
  }
  return result;
}

const questionPools = Object.entries(rawQuestionPools).reduce((acc, [key, meta]) => {
  const questionIds = meta.questionIds
    ? meta.questionIds.map(Number)
    : expandRange(meta.range);
  acc[key] = Object.freeze({
    ...meta,
    questionIds: Object.freeze(questionIds)
  });
  return acc;
}, {});

export const QUESTION_POOLS = Object.freeze(questionPools);

const examModes = Object.entries(rawExamModes).reduce((acc, [key, meta]) => {
  acc[key] = Object.freeze(meta);
  return acc;
}, {});

export const EXAM_MODES = Object.freeze(examModes);

function normalizeGroup(rawGroup = {}) {
  const normalized = {};
  for (const [key, values] of Object.entries(rawGroup)) {
    normalized[key] = Object.freeze(values.map(Number));
  }
  return Object.freeze(normalized);
}

export const motorExamForms = normalizeGroup(rawExamForms.motor);
export const sailExamForms = normalizeGroup(rawExamForms.sail);
export const sailSupplementExamForms = normalizeGroup(
  rawExamForms.sailSupplements
);

export const FORM_GROUPS = Object.freeze({
  motor: motorExamForms,
  sail: sailExamForms,
  sailSupplements: sailSupplementExamForms
});

// Backwards compatibility for existing imports (motor forms)
export const examForms = motorExamForms;

export const DEFAULT_CATEGORY = "motor";

export function getQuestionPoolKeys() {
  return Object.keys(QUESTION_POOLS);
}

export function getQuestionPoolMeta(key) {
  return QUESTION_POOLS[key] ?? null;
}

export function getExamModeKeys() {
  return Object.keys(EXAM_MODES);
}

export function getExamModeMeta(key) {
  return EXAM_MODES[key] ?? null;
}

export function getExamModeFormCategories(key) {
  const meta = getExamModeMeta(key);
  if (!meta) return [];
  if (meta.composite) {
    const { primaryCategory, supplementCategory } = meta.composite;
    return [primaryCategory, supplementCategory].filter(Boolean);
  }
  return meta.formCategory ? [meta.formCategory] : [];
}

export function getExamCategories() {
  return Object.keys(FORM_GROUPS);
}

function getGroup(category = DEFAULT_CATEGORY) {
  return FORM_GROUPS[category] ?? FORM_GROUPS[DEFAULT_CATEGORY];
}

function normalizeReturnKey(key) {
  return /^\d+$/.test(key) ? Number(key) : key;
}

function sortFormKeys(keys) {
  return [...keys].sort((a, b) => {
    const [, prefixA = "", numA = ""] = String(a).match(/^(\D*)(\d+)$/) || [];
    const [, prefixB = "", numB = ""] = String(b).match(/^(\D*)(\d+)$/) || [];
    if (prefixA === prefixB) {
      return Number(numA) - Number(numB);
    }
    return prefixA.localeCompare(prefixB);
  });
}

function resolveFormKey(formKey, category = DEFAULT_CATEGORY) {
  const group = getGroup(category);
  if (!formKey && formKey !== 0) return null;
  const directKey = String(formKey);
  if (group[directKey]) return directKey;

  if (/^\d+$/.test(directKey)) {
    const number = Number(directKey);
    if (!Number.isNaN(number)) {
      const fallbackKey = category === "sail"
        ? `S${number}`
        : category === "sailSupplements"
          ? `E${number}`
          : String(number);
      if (group[fallbackKey]) return fallbackKey;
    }
  }

  return null;
}

export function getExamFormNumbers(category = DEFAULT_CATEGORY) {
  const group = getGroup(category);
  const keys = sortFormKeys(Object.keys(group));
  return keys.map(normalizeReturnKey);
}

export function getExamFormQuestionIds(formKey, category = DEFAULT_CATEGORY) {
  const group = getGroup(category);
  const resolvedKey = resolveFormKey(formKey, category);
  return resolvedKey ? group[resolvedKey] : null;
}

export function createQuestionIndex(questions) {
  const index = new Map();
  for (const question of questions) {
    if (!question || typeof question.id !== "number") continue;
    if (index.has(question.id)) {
      throw new Error(
        `Duplicate question id detected in catalogue: ${question.id}`
      );
    }
    index.set(question.id, question);
  }
  return index;
}

export function getExamFormQuestions(formKey, questions, category = DEFAULT_CATEGORY) {
  const ids = getExamFormQuestionIds(formKey, category);
  if (!ids) {
    throw new Error(`Unknown exam form (${category}): ${formKey}`);
  }
  const index = Array.isArray(questions)
    ? createQuestionIndex(questions)
    : questions;

  return ids.map(id => {
    const question = index.get ? index.get(id) : index[id];
    if (!question) {
      throw new Error(
        `Exam form ${String(formKey)} (${category}) references unknown question id ${id}`
      );
    }
    return question;
  });
}

export function expandQuestionIdsFromPools(poolKeys = []) {
  const ids = new Set();
  poolKeys.forEach(key => {
    const meta = getQuestionPoolMeta(key);
    if (meta) {
      meta.questionIds.forEach(id => ids.add(id));
    }
  });
  return Array.from(ids).sort((a, b) => a - b);
}

export function validateExamForms(
  questions,
  categories = getExamCategories()
) {
  const index = createQuestionIndex(questions);
  const catalogueIds = Array.from(index.keys()).sort((a, b) => a - b);

  const combinedUsed = new Set();
  const issues = [];
  const categoryStats = {};

  for (const category of categories) {
    const group = getGroup(category);
    const expectedLength = EXPECTED_FORM_LENGTH[category] ?? null;
    const usedQuestionIds = new Set();

    for (const [formKey, ids] of Object.entries(group)) {
      if (expectedLength !== null && ids.length !== expectedLength) {
        issues.push({
          category,
          form: formKey,
          type: "length",
          message: `Form ${formKey} (${category}) contains ${ids.length} questions (expected ${expectedLength}).`
        });
      }

      const duplicates = findDuplicates(ids);
      if (duplicates.length > 0) {
        issues.push({
          category,
          form: formKey,
          type: "duplicates",
          message: `Form ${formKey} (${category}) contains duplicate question ids: ${duplicates.join(", ")}.`
        });
      }

      const missing = ids.filter(id => !index.has(id));
      if (missing.length > 0) {
        issues.push({
          category,
          form: formKey,
          type: "missing",
          message: `Form ${formKey} (${category}) references unknown question ids: ${missing.join(", ")}.`
        });
      }

      ids.forEach(id => {
        usedQuestionIds.add(id);
        combinedUsed.add(id);
      });
    }

    categoryStats[category] = {
      totalForms: Object.keys(group).length,
      expectedQuestionsPerForm: expectedLength,
      coveredQuestionIds: Array.from(usedQuestionIds).sort((a, b) => a - b),
      uncoveredQuestionIds: catalogueIds.filter(id => !usedQuestionIds.has(id))
    };
  }

  const uncoveredCombined = catalogueIds.filter(id => !combinedUsed.has(id));

  return {
    ok: issues.length === 0,
    issues,
    stats: {
      byCategory: categoryStats,
      combined: {
        totalForms: categories.reduce(
          (total, category) => total + Object.keys(getGroup(category)).length,
          0
        ),
        questionsInCatalogue: catalogueIds.length,
        coveredQuestionIds: Array.from(combinedUsed).sort((a, b) => a - b),
        uncoveredQuestionIds: uncoveredCombined
      }
    }
  };
}

function findDuplicates(ids) {
  const seen = new Set();
  const duplicates = new Set();
  ids.forEach(id => {
    if (seen.has(id)) {
      duplicates.add(id);
    }
    seen.add(id);
  });
  return Array.from(duplicates).sort((a, b) => a - b);
}
