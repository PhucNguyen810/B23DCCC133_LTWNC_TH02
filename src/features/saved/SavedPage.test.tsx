import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import SavedPage from './SavedPage';
import { useSavedStore } from './useSavedStore';
import { useSessionStore } from '../session/useSessionStore';

beforeEach(() => {
  localStorage.clear();
  useSavedStore.setState({ ids: [] });
  useSavedStore.persist.clearStorage();
  useSessionStore.setState({ queue: [], currentIndex: -1, isRunning: false, elapsed: 0 });
});

describe('SavedPage', () => {
  it('hiển thị hướng dẫn khi danh sách trống', () => {
    render(<MemoryRouter><SavedPage /></MemoryRouter>);
    expect(screen.getByText('Bạn chưa lưu bài tập nào.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '▶ Tập tất cả' })).not.toBeInTheDocument();
  });

  it('tập tất cả bài đã lưu theo thứ tự danh sách', () => {
    useSavedStore.setState({ ids: ['e1', 'e3'] });
    render(<MemoryRouter><SavedPage /></MemoryRouter>);

    expect(screen.getByText('Đẩy tạ đơn 1')).toBeInTheDocument();
    expect(screen.getByText('Gập tạ đơn 1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '▶ Tập tất cả' }));

    expect(useSessionStore.getState()).toMatchObject({
      queue: expect.arrayContaining([expect.objectContaining({ id: 'e1' }), expect.objectContaining({ id: 'e3' })]),
      currentIndex: 0,
      isRunning: true,
    });
  });
});
