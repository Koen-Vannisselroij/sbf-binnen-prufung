const imageModules = import.meta.glob("../assets/question-images/**/*.{png,jpg,jpeg,webp,gif,svg}", {
  eager: true,
  import: "default"
});

const EXTENSIONS = Object.freeze([".webp", ".png", ".jpg", ".jpeg", ".svg", ".gif"]);

const directLookup = {};
const questionStacks = new Map();

Object.entries(imageModules).forEach(([path, src]) => {
  const segments = path.split("/");
  const fileName = segments[segments.length - 1];
  if (!fileName) return null;
  const baseName = fileName.replace(/\.[^.]+$/, "");

  if (!directLookup[fileName]) directLookup[fileName] = src;
  if (!directLookup[baseName]) directLookup[baseName] = src;

  const stackMatch = baseName.match(/^(\d+)(?:[_.\-](\d+))?$/);
  if (stackMatch) {
    const questionKey = String(Number(stackMatch[1]));
    const orderRaw = stackMatch[2] ? Number(stackMatch[2]) : 1;
    const order = Number.isNaN(orderRaw) ? 1 : orderRaw;
    const stack = questionStacks.get(questionKey) ?? [];
    stack.push({ order, src, fileName });
    questionStacks.set(questionKey, stack);
  }

});

const QUESTION_IMAGE_STACK = Object.freeze(Object.fromEntries(
  Array.from(questionStacks.entries()).map(([questionId, entries]) => {
    const sorted = entries
      .slice()
      .sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.fileName.localeCompare(b.fileName);
      })
      .map(entry => entry.src);
    return [questionId, Object.freeze(sorted)];
  })
));

const DIRECT_LOOKUP = Object.freeze({ ...directLookup });

function collectFromLookup(key) {
  if (!key) return null;
  if (DIRECT_LOOKUP[key]) return DIRECT_LOOKUP[key];
  const stripped = key.split(/[\\/]/).pop();
  if (stripped && DIRECT_LOOKUP[stripped]) return DIRECT_LOOKUP[stripped];
  if (!key.includes(".")) {
    for (const ext of EXTENSIONS) {
      const withExt = `${key}${ext}`;
      if (DIRECT_LOOKUP[withExt]) return DIRECT_LOOKUP[withExt];
      if (stripped && DIRECT_LOOKUP[`${stripped}${ext}`]) {
        return DIRECT_LOOKUP[`${stripped}${ext}`];
      }
    }
  }
  return null;
}

function collectStackByKey(key) {
  if (!key) return null;
  const match = key.match(/^(\d+)/);
  if (!match) return null;
  const questionKey = String(Number(match[1]));
  return QUESTION_IMAGE_STACK[questionKey] ?? null;
}

export function resolveQuestionImages(question) {
  if (!question) return [];
  const results = [];
  const seen = new Set();

  const pushSrc = src => {
    if (!src || seen.has(src)) return;
    seen.add(src);
    results.push(src);
  };

  const addFromKey = key => {
    if (!key) return;
    const trimmed = String(key).trim();
    if (!trimmed) return;
    const direct = collectFromLookup(trimmed);
    if (direct) pushSrc(direct);
    const stack = collectStackByKey(trimmed);
    if (stack) stack.forEach(pushSrc);
  };

  if (Array.isArray(question.images)) {
    question.images.forEach(addFromKey);
  }

  if (typeof question.image === "string" || typeof question.image === "number") {
    addFromKey(question.image);
  }

  if (typeof question.imageId === "string" || typeof question.imageId === "number") {
    addFromKey(question.imageId);
  }

  if (typeof question.id === "number") {
    addFromKey(question.id);
  }

  return results;
}

export function getAvailableQuestionImages() {
  return Object.freeze({ ...DIRECT_LOOKUP });
}

export default resolveQuestionImages;
