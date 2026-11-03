import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EXERCISES } from '../../data/exercises';
import SessionBar from './SessionBar';
import { useSessionStore } from './useSessionStore';

beforeEach(() => {
  vi.useFakeTimers();
  useSessionStore.setState({ queue: [], currentIndex: -1, isRunning: false, elapsed: 0 });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('SessionBar', () => {
  it('cập nhật đếm ngược mỗi giây và dừng khi tạm dừng', () => {
    useSessionStore.getState().startSession(EXERCISES.slice(0, 2), 0);
    render(<SessionBar />);

    expect(screen.getByText('Còn lại:')).toBeInTheDocument();
    expect(screen.getByText('0:30')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('0:29')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ⅱ Tạm dừng' }));
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByText('0:29')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '▶ Bắt đầu' }));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('0:28')).toBeInTheDocument();
  });

  it('dọn interval khi component được gỡ khỏi màn hình', () => {
    useSessionStore.getState().startSession(EXERCISES.slice(0, 1), 0);
    const { unmount } = render(<SessionBar />);
    unmount();

    act(() => vi.advanceTimersByTime(1000));
    expect(useSessionStore.getState().elapsed).toBe(0);
  });
});
