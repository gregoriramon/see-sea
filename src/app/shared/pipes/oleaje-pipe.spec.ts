import { OleajePipe } from './oleaje-pipe';

describe('OlajePipe', () => {
  let pipe: OleajePipe;

  beforeEach(() => {
    pipe = new OleajePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform 310 to Débil', () => {
    expect(pipe.transform('310')).toBe('Débil');
  });

  it('should transform 320 to Moderado', () => {
    expect(pipe.transform('320')).toBe('Moderado');
  });

  it('should transform 330 to Fuerte', () => {
    expect(pipe.transform('330')).toBe('Fuerte');
  });

  it('should return empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should return original value for unknown code', () => {
    expect(pipe.transform('999')).toBe('999');
  });
});
