import { describe, expect, it } from 'vitest';
import { EXERCISES, generateExercises } from './exercises';

describe('generateExercises', () => {
  it('tạo đúng dữ liệu bài tập cho số lượng yêu cầu', () => {
    expect(generateExercises(2)).toEqual([
      { id: 'e1', name: 'Đẩy tạ đơn 1', trainer: 'Minh Khang', group: 'Ngực', duration: 30 },
      { id: 'e2', name: 'Kéo tạ đơn 1', trainer: 'Phương Anh', group: 'Chân', duration: 67 },
    ]);
  });

  it('tạo đủ 10.000 bài tập, id không trùng và thời lượng hợp lệ', () => {
    const ids = EXERCISES.map((exercise) => exercise.id);
    expect(EXERCISES).toHaveLength(10000);
    expect(new Set(ids).size).toBe(10000);
    expect(EXERCISES.every((exercise) => exercise.duration >= 30 && exercise.duration <= 120)).toBe(true);
    expect(EXERCISES[2]).toEqual({
      id: 'e3', name: 'Gập tạ đơn 1', trainer: 'Đức Anh', group: 'Tay', duration: 104,
    });
  });
});
