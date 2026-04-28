import { SensacionTermicaPipe } from './sensacion-termica-pipe';

describe('SensacionTermicaPipe', () => {
  let pipe: SensacionTermicaPipe;

  beforeEach(() => {
    pipe = new SensacionTermicaPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform 410 to Muy frío', () => {
    expect(pipe.transform('410')).toBe('Muy frío');
  });

  it('should transform 420 to Frío', () => {
    expect(pipe.transform('420')).toBe('Frío');
  });

  it('should transform 430 to Muy fresco', () => {
    expect(pipe.transform('430')).toBe('Muy fresco');
  });

  it('should transform 440 to Fresco', () => {
    expect(pipe.transform('440')).toBe('Fresco');
  });

  it('should transform 450 to Suave', () => {
    expect(pipe.transform('450')).toBe('Suave');
  });

  it('should transform 460 to Calor agradable', () => {
    expect(pipe.transform('460')).toBe('Calor agradable');
  });

  it('should transform 470 to Calor moderado', () => {
    expect(pipe.transform('470')).toBe('Calor moderado');
  });

  it('should transform 480 to Calor fuerte', () => {
    expect(pipe.transform('480')).toBe('Calor fuerte');
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
