export interface Best { score: number; categoryCount: number }
type ScoreStorage = Pick<Storage,'getItem'|'setItem'>;
export const configurationKey = (ids: string[]) => `country-rank:best:v1:${[...ids].sort().join(',')}`;
export function readBest(ids: string[], storage?: Pick<Storage,'getItem'>): Best | null {
  try { const b=JSON.parse((storage??localStorage).getItem(configurationKey(ids)) || 'null'); return b && b.categoryCount===ids.length && Number.isInteger(b.score) && b.score>=ids.length && b.score<=ids.length*100 ? b : null; } catch { return null; }
}
export function saveBest(ids: string[], score: number, storage?: ScoreStorage) {
  const old=readBest(ids,storage), best=old && old.score<=score ? old : {score,categoryCount:ids.length};
  try { (storage??localStorage).setItem(configurationKey(ids),JSON.stringify(best)); } catch { /* Gameplay remains available when storage is blocked. */ }
  return best;
}
