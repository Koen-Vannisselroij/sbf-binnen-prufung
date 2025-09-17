#!/usr/bin/env node
import examForms from "../src/data/examForms.json" with { type: "json" };
import questions from "../src/questions_with_tips_and_explanations.json" with { type: "json" };

const EXPECTED_LENGTH = {
  motor: 30,
  sail: 25,
  sailSupplements: 7
};

function createQuestionIndex(items) {
  const index = new Map();
  for (const entry of items) {
    if (!entry || typeof entry.id !== "number") continue;
    if (index.has(entry.id)) {
      throw new Error(`Duplicate question id detected in catalogue: ${entry.id}`);
    }
    index.set(entry.id, entry);
  }
  return index;
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

function validateCategory(index, forms, category) {
  const issues = [];
  const used = new Set();
  const expectedLength = EXPECTED_LENGTH[category] ?? null;

  for (const [formKey, idList] of Object.entries(forms)) {
    const ids = idList.map(Number);

    if (expectedLength !== null && ids.length !== expectedLength) {
      issues.push(
        `Form ${formKey} (${category}) contains ${ids.length} entries (expected ${expectedLength}).`
      );
    }

    const duplicates = findDuplicates(ids);
    if (duplicates.length > 0) {
      issues.push(
        `Form ${formKey} (${category}) has duplicate ids: ${duplicates.join(", ")}.`
      );
    }

    const missing = ids.filter(id => !index.has(id));
    if (missing.length > 0) {
      issues.push(
        `Form ${formKey} (${category}) references unknown ids: ${missing.join(", ")}.`
      );
    }

    ids.forEach(id => used.add(id));
  }

  return {
    issues,
    used
  };
}

try {
  const index = createQuestionIndex(questions);
  const catalogueIds = Array.from(index.keys()).sort((a, b) => a - b);
  const combinedUsed = new Set();
  let hasErrors = false;

  for (const [category, forms] of Object.entries(examForms)) {
    const { issues, used } = validateCategory(index, forms, category);
    if (issues.length > 0) {
      hasErrors = true;
      console.error(`\n❌ Issues found in ${category} exam forms:`);
      issues.forEach(issue => console.error(`   - ${issue}`));
    } else {
      console.log(`\n✅ ${category} exam forms: ${Object.keys(forms).length} sets valid.`);
    }

    used.forEach(id => combinedUsed.add(id));
    const uncovered = catalogueIds.filter(id => !used.has(id));
    if (uncovered.length > 0) {
      console.log(
        `   Note: ${uncovered.length} catalogue questions not covered in ${category} forms (ids: ${uncovered.join(", ")}).`
      );
    }
  }

  if (hasErrors) {
    process.exitCode = 1;
  } else {
    const uncoveredCombined = catalogueIds.filter(id => !combinedUsed.has(id));
    if (uncoveredCombined.length === 0) {
      console.log("\n🎯 Combined coverage: all catalogue questions referenced by at least one form group.");
    } else {
      console.log(
        `\n⚠️ Combined coverage warning: ${uncoveredCombined.length} catalogue questions are still unused (ids: ${uncoveredCombined.join(", ")}).`
      );
    }
  }
} catch (error) {
  console.error("Validation encountered an error:", error);
  process.exitCode = 1;
}
