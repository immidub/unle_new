import csv from '../../data/countries-master-list.csv?raw';
import { loadData } from './adapter';
const modules = import.meta.glob('../../data/processed/*.json', { eager: true, import: 'default' });
const flagModules = import.meta.glob('../../data/flags_4x3/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
export const flags = Object.fromEntries(Object.entries(flagModules).map(([path,url]) => [path.split('/').pop()!.replace('.svg',''), url]));
export function getData() { return loadData(csv, Object.fromEntries(Object.entries(modules).map(([path,data]) => [path.split('/').pop()!.replace('.json',''),data])), new Set(Object.keys(flags))); }
