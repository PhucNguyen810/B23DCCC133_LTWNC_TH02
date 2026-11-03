import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { RoutineProvider } from './RoutineContext';
import RoutineDetailPage from './RoutineDetailPage';
import { useSessionStore } from '../session/useSessionStore';

const routine = { id: 'r1', name: 'Ngày ngực', exerciseIds: ['e1', 'e2'] };

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('workout-routines', JSON.stringify([routine]));
  useSessionStore.setState({ queue: [], currentIndex: -1, isRunning: false, elapsed: 0 });
});

describe('RoutineDetailPage', () => {
  it('hiển thị tổng thời lượng, bỏ bài và bắt đầu buổi tập', () => {
    render(
      <MemoryRouter initialEntries={['/routines/r1']}>
        <RoutineProvider>
          <Routes><Route path="/routines/:id" element={<RoutineDetailPage />} /></Routes>
        </RoutineProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Tổng thời gian: 1 phút 37 giây')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Bỏ' })[0]!);
    expect(screen.queryByText('Đẩy tạ đơn 1')).not.toBeInTheDocument();
    expect(screen.getByText('Tổng thời gian: 1 phút 7 giây')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '▶ Tập tất cả' }));
    expect(useSessionStore.getState()).toMatchObject({
      queue: [expect.objectContaining({ id: 'e2' })],
      currentIndex: 0,
      isRunning: true,
    });
  });

  it('báo không tìm thấy giáo án với mã không tồn tại', () => {
    render(
      <MemoryRouter initialEntries={['/routines/missing']}>
        <RoutineProvider>
          <Routes><Route path="/routines/:id" element={<RoutineDetailPage />} /></Routes>
        </RoutineProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Không tìm thấy giáo án')).toBeInTheDocument();
  });
});
