import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeProvider } from './ThemeContext';
import { useTheme } from './ThemeContexts';

function ThemeHarness() {
  const { theme, toggleTheme } = useTheme();
  return <button type="button" onClick={toggleTheme}>{theme}</button>;
}

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

describe('ThemeProvider', () => {
  it('chuyển giao diện và ghi nhớ lựa chọn', () => {
    render(<ThemeProvider><ThemeHarness /></ThemeProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'light' }));

    expect(screen.getByRole('button', { name: 'dark' })).toBeInTheDocument();
    expect(localStorage.getItem('workout-theme')).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('khôi phục giao diện tối đã lưu', () => {
    localStorage.setItem('workout-theme', 'dark');
    render(<ThemeProvider><ThemeHarness /></ThemeProvider>);
    expect(screen.getByRole('button', { name: 'dark' })).toBeInTheDocument();
  });
});
