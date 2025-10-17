import { buildLineChartPath } from '../../utils/chart';

describe('buildLineChartPath', () => {
  test('returns empty string for undefined, null, or empty array', () => {
    expect(buildLineChartPath()).toBe('');
    expect(buildLineChartPath(null)).toBe('');
    expect(buildLineChartPath([])).toBe('');
  });

  test('generates path for single value (degenerate line)', () => {
    const path = buildLineChartPath([10]);
    // With one point, stepX uses divisor (len-1)=0 -> clamped to 1 to avoid division by zero
    // Path should only have move command (no L segments)
    expect(path.startsWith('M ')).toBe(true);
    expect(path.includes(' L ')).toBe(false);
  });

  test('generates path scaled to max value', () => {
    const values = [0, 50, 100];
    const path = buildLineChartPath(values);
    // Expect it to include three coordinates (M first, then L second and third)
    const coords = path.replace(/^M\s+/, '').split(/\s+L\s+/);
    expect(coords.length).toBe(2); // after removing 'M', we have one L with two points joined by space
    expect(path).toContain('0,180'); // first point: x=0, y=height-(0/max)*height = 180
    expect(path).toContain('300,90'); // middle point roughly: x=300, y=90
    expect(path).toContain('600,0'); // last point: x=600, y=0
  });

  test('handles constant non-zero values gracefully', () => {
    const values = [5, 5, 5, 5];
    const path = buildLineChartPath(values);
    expect(path).toContain('0,0');
    expect(path).toContain('200,0');
    expect(path).toContain('400,0');
    expect(path).toContain('600,0');
  });

  test('handles zeros with non-zero max', () => {
    const values = [0, 10, 0, 10];
    const path = buildLineChartPath(values);
    expect(path).toContain('0,180');
    expect(path).toContain('200,0');
    expect(path).toContain('400,180');
    expect(path).toContain('600,0');
  });
});


