// A tiny global store for tracking in-flight API requests.
// No React imports here so it can be used from Axios interceptors.

let pendingCount = 0;
const listeners = new Set();

const emit = () => {
  for (const listener of listeners) listener();
};

export const loadingStore = {
  getSnapshot() {
    return pendingCount;
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  increment() {
    pendingCount += 1;
    emit();
  },

  decrement() {
    pendingCount = Math.max(0, pendingCount - 1);
    emit();
  },

  reset() {
    pendingCount = 0;
    emit();
  },
};
