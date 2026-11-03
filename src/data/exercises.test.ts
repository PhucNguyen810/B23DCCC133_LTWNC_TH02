import { describe, expect, it } from 'vitest';
import { EXERCISES, generateExercises } from './exercises';

describe('generateExercises', () => {
  it('creates stable exercise records with the requested size', () => {
    expect(generateExercises(2)).toEqual([
      { id: 'e1', name: 'Đẩy tạ đơn 1', trainer: 'Minh Khang', group: 'Ngực', duration: 30 },
      { id: 'e2', name: 'Kéo tạ đơn 1', trainer: 'Phương Anh', group: 'Chân', duration: 67 },
    ]);
  });

  it('generates the 10,000-item catalog once', () => {
    expect(EXERCISES).toHaveLength(10000);
    expect(EXERCISES[2]).toEqual({
      id: 'e3', name: 'Gập tạ đơn 1', trainer: 'Đức Anh', group: 'Tay', duration: 104,
    });
  });
});
