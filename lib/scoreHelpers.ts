export function pow2(e: number) {
  return Math.pow(2, Math.max(0, Math.floor(e || 0)));
}

export function computeFinalScores(
  baseScores: Record<string, number>,
  doubles: Record<string, number>
) {
  const out: Record<string, number> = {};
  for (const name of Object.keys(baseScores)) {
    out[name] = (baseScores[name] ?? 0) * pow2(doubles[name] ?? 0);
  }
  return out;
}
