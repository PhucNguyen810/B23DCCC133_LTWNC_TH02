import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDebounce } from './useDebounce';

afterEach(() => {
  vi.useRealTimers();
});

describe('useDebounce', () => {
  it('updates only after the delay has elapsed', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }: { value: string }) => useDebounce(value, 300), {
      initialProps: { value: '' },
    });

    rerender({ value: 'đẩy' });
    expect(result.current).toBe('');

    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe('');

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('đẩy');
  });

  it('cancels the prior value when the user keeps typing', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }: { value: string }) => useDebounce(value, 300), {
      initialProps: { value: 'đ' },
    });

    act(() => vi.advanceTimersByTime(200));
    rerender({ value: 'đẩ' });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('đ');

    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('đẩ');
  });
});
