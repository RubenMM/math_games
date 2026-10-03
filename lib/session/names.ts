import {
  DataSet,
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
  pattern,
} from 'obscenity';

// English comes from `obscenity`; this adds common Spanish words. `|word|` only matches whole
// words, so innocent names/words (e.g. "Penélope", "cono" in maths) are not caught.
const SPANISH = [
  'puta', 'puto', 'putas', 'putos', 'mierda', 'cabron', 'cabrona', 'pendejo', 'pendeja', 'joder',
  'verga', 'pinga', 'chinga', 'chingar', 'culo', 'culos', 'pene', 'vagina', 'marica', 'maricon',
  'zorra', 'gilipollas', 'hijueputa', 'hijoputa', 'culiao', 'culiado', 'mamaguevo', 'pajero', 'coño',
];

const dataset = new DataSet<{ originalWord: string }>().addAll(englishDataset);
for (const word of SPANISH) {
  dataset.addPhrase(phrase => phrase.setMetadata({ originalWord: word }).addPattern(pattern`|${word}|`));
}

const matcher = new RegExpMatcher({ ...dataset.build(), ...englishRecommendedTransformers });

// Also check the name with spaces/punctuation removed, so "f u c k" or "p.u.t.o" do not slip through.
const compact = (name: string) => name.replace(/[^\p{L}\p{N}]/gu, '');

export const isAllowedName = (name: string) => !matcher.hasMatch(name) && !matcher.hasMatch(compact(name));
