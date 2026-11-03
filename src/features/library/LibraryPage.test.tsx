import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { EXERCISES } from '../../data/exercises';
import { RoutineProvider } from '../routines/RoutineContext';
import LibraryPage from './LibraryPage';
import { useSessionStore } from '../session/useSessionStore';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('workout-routines', JSON.stringify([
    { id: 'r1', name: 'Ngày ngực', exerciseIds: [] },
  ]));
  useSessionStore.setState({ queue: [], currentIndex: -1, isRunning: false, elapsed: 0 });
});

describe('LibraryPage', () => {
  it('ảo hóa kho bài tập và bắt đầu đúng bài theo vị trí đã chọn', () => {
    render(<MemoryRouter><RoutineProvider><LibraryPage /></RoutineProvider></MemoryRouter>);

    expect(document.querySelector('.results-line')).toHaveTextContent('Tìm thấy 10000 bài tập');
    expect(document.querySelectorAll('.exercise-row').length).toBeLessThan(20);
    fireEvent.click(screen.getAllByRole('button', { name: '▶ Bắt đầu' })[1]!);
    expect(useSessionStore.getState()).toMatchObject({
      queue: EXERCISES,
      currentIndex: 1,
      isRunning: true,
    });
  });

  it('thêm bài tập đã chọn vào giáo án đang chọn mà không thêm trùng', () => {
    render(<MemoryRouter><RoutineProvider><LibraryPage /></RoutineProvider></MemoryRouter>);
    const addButton = screen.getByRole('button', { name: 'Thêm Đẩy tạ đơn 1 vào giáo án' });
    expect(addButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Giáo án đang chọn'), { target: { value: 'r1' } });
    fireEvent.click(addButton);
    fireEvent.click(addButton);
    expect(JSON.parse(localStorage.getItem('workout-routines') ?? '[]')[0].exerciseIds).toEqual(['e1']);
  });

  it('lọc và sắp xếp danh sách khi thay đổi các điều khiển', () => {
    render(<MemoryRouter><RoutineProvider><LibraryPage /></RoutineProvider></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Nhóm cơ'), { target: { value: 'Vai' } });
    expect(document.querySelector('.results-line')).toHaveTextContent('Tìm thấy 2000 bài tập');

    fireEvent.change(screen.getByLabelText('Sắp xếp'), { target: { value: 'name' } });
    fireEvent.change(screen.getByLabelText('Nhóm cơ'), { target: { value: 'Tất cả' } });
    expect(screen.getAllByText('Bật chậm 1').length).toBeGreaterThan(0);
  });
});
