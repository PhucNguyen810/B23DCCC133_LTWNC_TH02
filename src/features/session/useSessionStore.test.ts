import { beforeEach, describe, expect, it } from 'vitest';
import { EXERCISES } from '../../data/exercises';
import { useSessionStore } from './useSessionStore';

beforeEach(() => {
  useSessionStore.setState({
    queue: [],
    currentIndex: -1,
    isRunning: false,
    elapsed: 0,
  });
});

describe('useSessionStore', () => {
  it('starts a new session at the selected exercise', () => {
    useSessionStore.getState().startSession(EXERCISES.slice(0, 3), 1);
    expect(useSessionStore.getState()).toMatchObject({
      queue: EXERCISES.slice(0, 3),
      currentIndex: 1,
      isRunning: true,
      elapsed: 0,
    });
  });

  it('adds exercises once and starts the first queued exercise when toggled', () => {
    const { addToSession, toggleRun } = useSessionStore.getState();
    addToSession(EXERCISES[0]!);
    addToSession(EXERCISES[0]!);

    expect(useSessionStore.getState().queue).toHaveLength(1);
    toggleRun();
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: 0, isRunning: true });
    useSessionStore.getState().toggleRun();
    expect(useSessionStore.getState().isRunning).toBe(false);
    useSessionStore.getState().toggleRun();
    expect(useSessionStore.getState().isRunning).toBe(true);
  });

  it('resets the current exercise after more than three seconds, otherwise goes back', () => {
    useSessionStore.getState().startSession(EXERCISES.slice(0, 3), 2);
    useSessionStore.setState({ elapsed: 4 });
    useSessionStore.getState().prev();
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: 2, elapsed: 0 });

    useSessionStore.setState({ elapsed: 3 });
    useSessionStore.getState().prev();
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: 1, elapsed: 0 });
  });

  it('stops at the last exercise and automatically advances when time expires', () => {
    useSessionStore.getState().startSession(EXERCISES.slice(0, 2), 0);
    useSessionStore.setState({ elapsed: 29 });
    useSessionStore.getState().tick();
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: 1, elapsed: 0, isRunning: true });

    useSessionStore.setState({ elapsed: EXERCISES[1]!.duration });
    useSessionStore.getState().next();
    expect(useSessionStore.getState().isRunning).toBe(false);
  });

  it('ticks once per second and advances when the current duration ends', () => {
    useSessionStore.getState().startSession(EXERCISES.slice(0, 2), 0);
    useSessionStore.setState({ elapsed: 29 });
    useSessionStore.getState().tick();
    expect(useSessionStore.getState()).toMatchObject({ currentIndex: 1, elapsed: 0, isRunning: true });
  });
});
