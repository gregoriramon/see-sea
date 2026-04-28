import { EstadoCieloPipe } from './estado-cielo-pipe';

describe('EstadoCieloPipe', () => {
  let pipe: EstadoCieloPipe;

  beforeEach(() => {
    pipe = new EstadoCieloPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform 100 to Despejado', () => {
    expect(pipe.transform('100')).toBe('Despejado');
  });

  it('should transform 110 to Nuboso', () => {
    expect(pipe.transform('110')).toBe('Nuboso');
  });

  it('should transform 120 to Muy nuboso', () => {
    expect(pipe.transform('120')).toBe('Muy nuboso');
  });

  it('should transform 130 to Chubascos', () => {
    expect(pipe.transform('130')).toBe('Chubascos');
  });

  it('should transform 140 to Muy nuboso con lluvia', () => {
    expect(pipe.transform('140')).toBe('Muy nuboso con lluvia');
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
