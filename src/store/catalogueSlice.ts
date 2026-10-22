import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Recipe } from '../data/mockData';
import { CATALOGUE } from '../data/catalogue';

/**
 * The 58 free drinks, shared by Home, Surprise and My Bar. They are bundled
 * (data/catalogue), so the list is in place from the first frame, with or without a network.
 */
export interface CatalogueState {
  recipes: Recipe[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  fillingIn: boolean;
}

const initialState: CatalogueState = { recipes: CATALOGUE, status: 'ready', fillingIn: false };

const catalogueSlice = createSlice({
  name: 'catalogue',
  initialState,
  reducers: {
    loadStarted: state => {
      state.status = 'loading';
    },
    loadFailed: state => {
      state.status = 'error';
    },
    /** The list, or the list re-merged after a batch of details arrived. */
    recipesLoaded: (state, action: PayloadAction<Recipe[]>) => {
      state.recipes = action.payload;
      state.status = 'ready';
    },
    setFillingIn: (state, action: PayloadAction<boolean>) => {
      state.fillingIn = action.payload;
    },
  },
});

export const { loadStarted, loadFailed, recipesLoaded, setFillingIn } = catalogueSlice.actions;
export default catalogueSlice.reducer;

type Dispatch = (action: ReturnType<(typeof catalogueSlice.actions)[keyof typeof catalogueSlice.actions]>) => void;

/** Puts the bundled list in place. Nothing to wait for and nothing to fetch. */
export const loadCatalogue = () => (dispatch: Dispatch) => {
  dispatch(recipesLoaded(CATALOGUE));
};
