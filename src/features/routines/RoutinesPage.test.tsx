import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { RoutineProvider } from './RoutineContext';
import RoutinesPage from './RoutinesPage';

function renderWithProviders(ui: React.ReactNode) {
  return render(
    <MemoryRouter>
      <RoutineProvider>{ui}</RoutineProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('RoutinesPage', () => {
  it('báo lỗi khi tạo giáo án với tên trống', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RoutinesPage />);

    await user.click(screen.getByRole('button', { name: 'Tạo' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Tên giáo án không được để trống');
  });

  it('tạo giáo án khi nhập tên hợp lệ', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RoutinesPage />);

    await user.type(screen.getByLabelText('Tên giáo án'), 'Ngày ngực');
    await user.click(screen.getByRole('button', { name: 'Tạo' }));
    expect(screen.getByText('Ngày ngực')).toBeInTheDocument();
  });

  it('không cho phép tạo giáo án trùng tên không phân biệt hoa thường', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RoutinesPage />);

    await user.type(screen.getByLabelText('Tên giáo án'), 'Ngày ngực');
    await user.click(screen.getByRole('button', { name: 'Tạo' }));
    await user.type(screen.getByLabelText('Tên giáo án'), 'ngày NGỰC');
    await user.click(screen.getByRole('button', { name: 'Tạo' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Tên giáo án đã tồn tại');
    expect(screen.getAllByText('Ngày ngực')).toHaveLength(1);
  });
});
