import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Recipe } from '../data/mockData';
import { fetchMocktails, fillInDetails } from '../api/recipes';

/**
 * The 58 TheCocktailDB drinks (API + details cache), shared by Home, Surprise and
 * My Bar. Loaded once; `fillingIn` is true while details arrive for drinks that had
 * none cached.
 */
export interface CatalogueState {
  recipes: Recipe[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  fillingIn: boolean;
}

const initialState: CatalogueState = { recipes: [], status: 'idle', fillingIn: false };

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
type GetState = () => { catalogue: CatalogueState };

/** Loads the list, then fills in missing details in the background. Safe to call again to retry. */
export const loadCatalogue = () => async (dispatch: Dispatch, getState: GetState) => {
  const { status } = getState().catalogue;
  if (status === 'loading') return;
  dispatch(loadStarted());
  let list: Recipe[];
  try {
    list = await fetchMocktails();
  } catch {
    dispatch(loadFailed());
    return;
  }
  dispatch(recipesLoaded(list));
  // The list endpoint has no ingredients or tags. Fetch them once (cached on the
  // device afterwards) and let cards fill in as batches arrive.
  if (list.some(r => !r.tags)) {
    dispatch(setFillingIn(true));
    try {
      await fillInDetails(list, update => dispatch(recipesLoaded(update(getState().catalogue.recipes))));
    } finally {
      dispatch(setFillingIn(false));
    }
  }
};
