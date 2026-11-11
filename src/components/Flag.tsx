import type { Country } from '../data/adapter';
import { flags } from '../data';
export function Flag({country, large=false}: {country: Country; large?: boolean}) { return <img className={large?'flag flag-large':'flag'} src={flags[country.flagCode]} alt={`${country.name} flag`} />; }
