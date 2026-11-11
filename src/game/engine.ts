import type { Category, Country } from '../data/adapter';
export interface Assignment { countryId: string; categoryId: string }
export interface Game { drawnCountryIds: string[]; categoryIds: string[]; assignments: Assignment[]; status: 'playing' | 'complete' }
export function startGame(countries: Country[], categories: Pick<Category, 'id'>[], random = Math.random): Game {
  if (!categories.length || categories.length > countries.length || new Set(categories.map(c=>c.id)).size !== categories.length || new Set(countries.map(c=>c.id)).size !== countries.length) throw new Error('Invalid game configuration');
  const ids = countries.map(c=>c.id);
  for (let i=ids.length-1;i>0;i--) { const j = Math.floor(random()*(i+1)); [ids[i],ids[j]]=[ids[j],ids[i]]; }
  return { drawnCountryIds:ids.slice(0,categories.length), categoryIds:categories.map(c=>c.id), assignments:[], status:'playing' };
}
export function assign(game: Game, categoryId: string): Game {
  if (game.status !== 'playing' || !game.categoryIds.includes(categoryId) || game.assignments.some(a=>a.categoryId === categoryId)) throw new Error('Category cannot be assigned');
  const assignments = [...game.assignments,{countryId:game.drawnCountryIds[game.assignments.length],categoryId}];
  return {...game, assignments, status:assignments.length === game.categoryIds.length ? 'complete' : 'playing'};
}
export function results(game: Game, categories: Category[]) {
  if (game.status !== 'complete') throw new Error('Results remain hidden until the game ends');
  return game.assignments.map(a=> { const category=categories.find(c=>c.id===a.categoryId)!; const record=category.records.get(a.countryId)!; return {...a,category,record}; });
}
export function totalScore(game: Game, categories: Category[]) { return results(game,categories).reduce((sum,r)=>sum+r.record.points,0); }
