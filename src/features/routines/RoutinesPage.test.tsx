import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { RoutineProvider } from './RoutineContext';
import RoutinesPage from './RoutinesPage';

beforeEach(() => {
  localStorage.clear();
});

describe('RoutinesPage', () => {
  it('validates empty and case-insensitive duplicate routine names', () => {
    render(
      <MemoryRouter>
        <RoutineProvider><RoutinesPage /></RoutineProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Tạo' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Tên giáo án không được để trống');

    fireEvent.change(screen.getByLabelText('Tên giáo án'), { target: { value: 'Ngày ngực' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tạo' }));
    expect(screen.getByText('Ngày ngực')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Tên giáo án'), { target: { value: 'ngày NGỰC' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tạo' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Tên giáo án đã tồn tại');
    expect(screen.getAllByText('Ngày ngực')).toHaveLength(1);
  });
});
