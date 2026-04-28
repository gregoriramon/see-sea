import { UvMaxPipe } from './uv-max-pipe';

describe('UvMaxPipe', () => {
  let pipe: UvMaxPipe;

  beforeEach(() => {
    pipe = new UvMaxPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format UV index', () => {
    expect(pipe.transform(7)).toBe('7');
  });

  it('should handle zero UV index', () => {
    expect(pipe.transform(0)).toBe('0');
  });

  it('should handle decimal UV index', () => {
    expect(pipe.transform(5.5)).toBe('5.5');
  });

  it('should return empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });
});
