import { describe, expect, it } from 'vitest';
import { formatDuration } from './format';

describe('formatDuration', () => {
  it.each([
    [67, '1:07'],
    [30, '0:30'],
    [0, '0:00'],
    [120, '2:00'],
  ])('định dạng %i giây thành %s', (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });
});
