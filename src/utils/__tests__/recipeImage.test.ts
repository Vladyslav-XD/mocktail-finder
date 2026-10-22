import { RECIPE_PLACEHOLDER, recipeImageSource } from '../recipeImage';
import { drinkPhoto } from '../../data/drinkPhotos';

jest.mock('expo-file-system/legacy', () => ({ documentDirectory: 'file:///docs/' }));

describe('recipeImageSource', () => {
  it('catalogue drinks get their bundled photo, whatever address they were saved with', () => {
    expect(recipeImageSource('12560', '')).toBe(drinkPhoto('12560'));
    expect(recipeImageSource('12560', 'https://old.example/thumb.jpg')).toBe(drinkPhoto('12560'));
  });

  it("an own recipe shows the user's photo from the phone", () => {
    expect(recipeImageSource('1700000000000', 'recipe-photo:1700000000000.jpg')).toEqual({
      uri: 'file:///docs/recipe-photos/1700000000000.jpg',
    });
  });

  it('an own recipe without a photo gets the placeholder, also when 1.0 / 1.1 saved a web address', () => {
    expect(recipeImageSource('1700000000000', '')).toBe(RECIPE_PLACEHOLDER);
    expect(recipeImageSource('1700000000000', 'https://images.example/stock.jpg')).toBe(RECIPE_PLACEHOLDER);
  });
});
