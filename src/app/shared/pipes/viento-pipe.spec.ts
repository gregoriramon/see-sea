import { VientoPipe } from './viento-pipe';

describe('VientoPipe', () => {
  let pipe: VientoPipe;

  beforeEach(() => {
    pipe = new VientoPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform 210 to Flojo', () => {
    expect(pipe.transform('210')).toBe('Flojo');
  });

  it('should transform 220 to Moderado', () => {
    expect(pipe.transform('220')).toBe('Moderado');
  });

  it('should transform 230 to Fuerte', () => {
    expect(pipe.transform('230')).toBe('Fuerte');
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
