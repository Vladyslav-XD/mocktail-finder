import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/** My Bar ticks (ingredient keys), persisted in `@mocktail-finder/pantry` (see store.ts). */
export interface PantryState {
  ticked: string[];
  hydrated: boolean;
}

const pantrySlice = createSlice({
  name: 'pantry',
  initialState: { ticked: [], hydrated: false } as PantryState,
  reducers: {
    hydratePantry: (state, action: PayloadAction<string[]>) => {
      state.ticked = action.payload;
      state.hydrated = true;
    },
    toggleKey: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      state.ticked = state.ticked.includes(key) ? state.ticked.filter(k => k !== key) : [...state.ticked, key];
    },
    /** Ticks a set at once (the tour's "What's at home?" step). */
    addKeys: (state, action: PayloadAction<string[]>) => {
      state.ticked = [...new Set([...state.ticked, ...action.payload])];
    },
    clearPantry: state => {
      state.ticked = [];
    },
  },
});

export const { hydratePantry, toggleKey, addKeys, clearPantry } = pantrySlice.actions;
export default pantrySlice.reducer;
