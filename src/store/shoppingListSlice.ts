import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ShoppingItem } from '../utils/shoppingList';

/** Shopping list (Pro), persisted in `@mocktail-finder/shopping-list` (see store.ts). */
export interface ShoppingListState {
  items: ShoppingItem[];
  hydrated: boolean;
}

const shoppingListSlice = createSlice({
  name: 'shoppingList',
  initialState: { items: [], hydrated: false } as ShoppingListState,
  reducers: {
    hydrateShoppingList: (state, action: PayloadAction<ShoppingItem[]>) => {
      state.items = action.payload;
      state.hydrated = true;
    },
    setShoppingList: (state, action: PayloadAction<ShoppingItem[]>) => {
      state.items = action.payload;
    },
    toggleItem: (state, action: PayloadAction<string>) => {
      const item = state.items.find(i => i.key === action.payload);
      if (item) item.ticked = !item.ticked;
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(i => i.key !== action.payload);
    },
    clearTicked: state => {
      state.items = state.items.filter(i => !i.ticked);
    },
  },
});

export const { hydrateShoppingList, setShoppingList, toggleItem, removeItem, clearTicked } = shoppingListSlice.actions;
export default shoppingListSlice.reducer;
