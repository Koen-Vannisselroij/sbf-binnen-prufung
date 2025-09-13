// Shuffle options and return new array and updated correct index
export default function shuffleOptions(options, correctIdx) {
  const indexed = options.map((opt, i) => ({ opt, i }));
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }
  const newCorrectIdx = indexed.findIndex(item => item.i === correctIdx);
  return {
    shuffled: indexed.map(item => item.opt),
    newCorrectIdx
  };
}

