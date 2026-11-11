export interface Country { id: string; name: string; flagCode: string; flagPath: string }
export interface RecordData { id: string; value: number | null; year: number | null; rank: number | null; points: number; missing: boolean }
export interface Dataset { category: string; unit: string; source: { organization: string; dataset: string }; reference: Record<string, unknown>; countries: RecordData[]; methodology?: { caveats?: string[] } }
export const registry = [
  { id: 'co2', name: 'Highest CO₂ emissions', short: 'CO₂ emissions', icon: '◌', detail: 'Think industrial giants.' },
  { id: 'olympics', name: 'Most Olympic medals', short: 'Olympic medals', icon: '♜', detail: 'A history of podium finishes.' },
  { id: 'life-expectancy', name: 'Highest life expectancy', short: 'Life expectancy', icon: '♡', detail: 'Where life goes a little longer.' },
  { id: 'area', name: 'Largest area', short: 'Surface area', icon: '▱', detail: 'Room to roam.' },
  { id: 'gdp', name: 'Highest GDP', short: 'GDP', icon: '↗', detail: 'The biggest economies.' },
  { id: 'press-freedom', name: 'Most press freedom', short: 'Press freedom', icon: '✎', detail: 'Freedom to tell the story.' },
  { id: 'tourism', name: 'Most international tourists', short: 'Tourism', icon: '✈', detail: 'The world’s favourite destinations.' },
  { id: 'unesco', name: 'Most UNESCO World Heritage sites', short: 'UNESCO sites', icon: '⌂', detail: 'Extraordinary places, protected.' },
] as const;
export type Category = typeof registry[number] & { data: Dataset; records: Map<string, RecordData> };
export function parseMaster(csv: string): Country[] {
  // Master CSV currently has unquoted fields; support standard quoted CSV as well.
  const rows: string[][] = []; let row: string[] = [], field = '', quoted = false;
  for (let i = 0; i < csv.length; i++) { const c = csv[i]; if (c === '"') { if (quoted && csv[i+1] === '"') { field += '"'; i++; } else quoted = !quoted; } else if (c === ',' && !quoted) { row.push(field); field = ''; } else if (c === '\n' && !quoted) { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; } else field += c; }
  if (field || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
  if (quoted || rows.shift()?.join(',') !== 'id,name,flagCode,flagPath') throw new Error('Invalid master CSV schema');
  return rows.filter(r => r.some(Boolean)).map(r => { if (r.length !== 4) throw new Error('Invalid master country row'); return { id:r[0], name:r[1], flagCode:r[2], flagPath:r[3] }; });
}
export const pointsForRank = (rank: number | null) => rank === null ? 100 : Math.min(rank, 100);
export function validateMaster(countries: Country[], flags: Set<string>) {
  if (countries.length !== 197 || new Set(countries.map(c => c.id)).size !== 197) throw new Error('Master list must contain exactly 197 unique countries.');
  for (const c of countries) if (!/^[A-Z]{3}$/.test(c.id) || !c.name || c.flagPath !== `/flags/${c.flagCode}.svg` || !flags.has(c.flagCode)) throw new Error(`Invalid country or missing local flag: ${c.id}`);
}
export function validateDataset(raw: unknown, id: string, countries: Country[]): Dataset {
  const d = raw as Dataset;
  if (!d || d.category !== id || !d.unit || !d.source?.organization || !d.source?.dataset || !d.reference || !Object.keys(d.reference).length || !Array.isArray(d.countries) || d.countries.length !== countries.length) throw new Error(`${id}: invalid schema, source metadata, or record count`);
  const ids = new Set(countries.map(c => c.id)), seen = new Set<string>();
  for (const r of d.countries) {
    if (!ids.has(r.id) || seen.has(r.id) || (r.rank !== null && (!Number.isInteger(r.rank) || r.rank < 1 || r.rank > countries.length)) || !Number.isInteger(r.points) || r.points !== pointsForRank(r.rank) || typeof r.missing !== 'boolean' || r.missing !== (r.rank === null) || (r.value !== null && (typeof r.value !== 'number' || !Number.isFinite(r.value))) || (r.year !== null && (!Number.isInteger(r.year) || r.year < 1))) throw new Error(`${id}: inconsistent record ${r.id}`);
    seen.add(r.id);
  }
  return d;
}
export function loadData(csv: string, raw: Record<string, unknown>, flags: Set<string>) {
  const countries = parseMaster(csv); validateMaster(countries, flags);
  const warnings: string[] = [], categories: Category[] = [];
  for (const definition of registry) {
    const value = raw[definition.id];
    if (!value) { if (!['press-freedom', 'tourism'].includes(definition.id)) warnings.push(`${definition.name}: dataset absent; category disabled.`); continue; }
    try { const data = validateDataset(value, definition.id, countries); categories.push({ ...definition, data, records: new Map(data.countries.map(r => [r.id, r])) }); } catch (e) { warnings.push(`${String(e)}; category disabled.`); }
  }
  return { countries, categories, warnings };
}
