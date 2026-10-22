import { createSlice } from '@reduxjs/toolkit';
import { Recipe } from '../data/mockData';
import { CATALOGUE } from '../data/catalogue';

/**
 * The 58 free drinks, shared by Home, Surprise and My Bar (via selectors). They are bundled
 * (data/catalogue), so the list is in place from the first frame and never loads or fails.
 */
export interface CatalogueState {
  recipes: Recipe[];
}

const initialState: CatalogueState = { recipes: CATALOGUE };

const catalogueSlice = createSlice({
  name: 'catalogue',
  initialState,
  reducers: {},
});

export default catalogueSlice.reducer;
