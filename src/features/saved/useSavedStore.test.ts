import { beforeEach, describe, expect, it } from 'vitest';
import { useSavedStore } from './useSavedStore';

beforeEach(() => {
  useSavedStore.setState({ ids: [] });
  useSavedStore.persist.clearStorage();
});

describe('useSavedStore', () => {
  it('bật tắt bài đã lưu và ghi nhớ với khóa workout-saved', () => {
    useSavedStore.getState().toggle('e1');
    useSavedStore.getState().toggle('e3');

    expect(useSavedStore.getState().ids).toEqual(['e1', 'e3']);
    const savedStorage = localStorage.getItem('workout-saved');
    expect(savedStorage).not.toBeNull();
    expect(JSON.parse(savedStorage ?? '{}').state.ids).toEqual(['e1', 'e3']);

    useSavedStore.getState().toggle('e1');
    expect(useSavedStore.getState().ids).toEqual(['e3']);
  });
});
