import { TemperaturaPipe } from './temperatura-pipe';

describe('TemperaturaPipe', () => {
  let pipe: TemperaturaPipe;

  beforeEach(() => {
    pipe = new TemperaturaPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format temperature with °C', () => {
    expect(pipe.transform(25)).toBe('25°C');
  });

  it('should handle zero temperature', () => {
    expect(pipe.transform(0)).toBe('0°C');
  });

  it('should handle negative temperature', () => {
    expect(pipe.transform(-5)).toBe('-5°C');
  });

  it('should handle decimal temperature', () => {
    expect(pipe.transform(23.5)).toBe('23.5°C');
  });

  it('should return empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });
});
