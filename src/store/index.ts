// store.ts
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers'; // Assuming you have your reducers defined in a separate file



// export const store = configureStore({
//   reducer: rootReducer,
//   // Add middleware or other store configurations if needed
// });

;


export const store = () => {
  const preloadedState = loadState();

  const _store = configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState,
  });

  _store.subscribe(() => {
    saveState(_store.getState());
  });

  return _store;
};

const loadState = () => {
  if (typeof window !== 'undefined') {
    try {
      const serializedState = localStorage.getItem('user');
      if (serializedState === null) {
        return undefined;
      }
      return JSON.parse(serializedState);
    } catch (err) {
      return undefined;
    }
  }
  return undefined;
};

const saveState = (state) => {
  if (typeof window !== 'undefined') {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem('user', serializedState);
    } catch {
      // Ignore write errors
    }
  }
};



