import { describe, expect, it } from 'vitest';
import { isAllowedName } from './names';

describe('isAllowedName', () => {
  it('blocks English and Spanish profanity, including simple obfuscation', () => {
    for (const bad of ['fuck', 'F u c k', 'sh1t', 'puta', 'PUTA', 'pendejo', 'mierda', 'cabrón', 'hijueputa', 'p.u.t.o']) {
      expect(isAllowedName(bad), bad).toBe(false);
    }
  });

  it('allows ordinary names and look-alike words', () => {
    for (const ok of ['Ana', 'Sofía', 'Penélope', 'Concha', 'Classic', 'Scunthorpe', 'Cono', 'Mateo 7B', 'Valentina', 'Ana María', 'Juan Pablo']) {
      expect(isAllowedName(ok), ok).toBe(true);
    }
  });
});
