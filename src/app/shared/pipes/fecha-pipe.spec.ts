import { FechaPipe } from './fecha-pipe';

describe('FechaPipe', () => {
  it('create an instance', () => {
    const pipe = new FechaPipe();
    expect(pipe).toBeTruthy();
  });

  it('formatea fecha ISO a dd/MM/yyyy', () => {
    const pipe = new FechaPipe();
    expect(pipe.transform('2026-06-26')).toBe('26/06/2026');
  });

  it('devuelve cadena vacia para null', () => {
    const pipe = new FechaPipe();
    expect(pipe.transform(null)).toBe('');
  });
});
