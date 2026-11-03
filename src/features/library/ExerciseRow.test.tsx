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
  it('hiển thị tên và thời lượng, gọi hàm bắt đầu với đúng bài tập', () => {
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
    expect(screen.getByText('0:30')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '▶ Bắt đầu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Lưu bài tập' }));
    fireEvent.click(screen.getByRole('button', { name: 'Thêm Đẩy tạ đơn 1 vào buổi tập' }));

    expect(onStart).toHaveBeenCalledWith(exercise, 0);
    expect(onToggleSaved).toHaveBeenCalledWith('e1');
    expect(onQueue).toHaveBeenCalledWith('e1');
  });

  it('hiển thị trạng thái đã lưu và đã thêm vào buổi tập', () => {
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

  it('khóa nút thêm giáo án nếu chưa chọn giáo án', () => {
    render(
      <ExerciseRow
        index={0}
        exercise={exercise}
        isSaved={false}
        isQueued={false}
        canAddToRoutine={false}
        onStart={vi.fn()}
        onToggleSaved={vi.fn()}
        onQueue={vi.fn()}
        onAddToRoutine={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Thêm Đẩy tạ đơn 1 vào giáo án' })).toBeDisabled();
  });
});
