import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Exercise } from '../../types';
import { ExerciseRow } from './ExerciseRow';

const exercise: Exercise = {
  id: 'e1',
  name: 'Đẩy tạ đơn 1',
  trainer: 'Minh Khang',
  group: 'Ngực',
  duration: 30,
};

describe('ExerciseRow', () => {
  it('displays the exercise and calls its actions', () => {
    const onStart = vi.fn();
    const onToggleSaved = vi.fn();
    const onQueue = vi.fn();

    render(
      <ExerciseRow
        index={0}
        exercise={exercise}
        isSaved={false}
        isQueued={false}
        onStart={onStart}
        onToggleSaved={onToggleSaved}
        onQueue={onQueue}
      />,
    );

    expect(screen.getByText('Đẩy tạ đơn 1')).toBeInTheDocument();
    expect(screen.getByText('Minh Khang')).toBeInTheDocument();
    expect(screen.getByText('0:30')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '▶ Bắt đầu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Lưu bài tập' }));
    fireEvent.click(screen.getByRole('button', { name: 'Thêm Đẩy tạ đơn 1 vào buổi tập' }));

    expect(onStart).toHaveBeenCalledWith(exercise, 0);
    expect(onToggleSaved).toHaveBeenCalledWith('e1');
    expect(onQueue).toHaveBeenCalledWith('e1');
  });

  it('marks saved and queued exercises accessibly', () => {
    render(
      <ExerciseRow
        index={1}
        exercise={exercise}
        isSaved
        isQueued
        onStart={vi.fn()}
        onToggleSaved={vi.fn()}
        onQueue={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Bỏ lưu bài tập' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Đẩy tạ đơn 1 đã ở trong buổi tập' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('02')).toBeInTheDocument();
  });
});
