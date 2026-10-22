/**
 * Bundled photos for the TheCocktailDB non-alcoholic drinks (900×900 JPEG, ~50 KB each).
 * Generated on 2026-09-17 from the images in `assets/drinks/` — keys are TheCocktailDB drink ids.
 * Use `drinkPhoto(id)`. All 58 catalogue drinks have one; the app loads no photo from the web.
 */
import type { ImageSourcePropType } from 'react-native';

const DRINK_PHOTOS: Record<string, ImageSourcePropType> = {
  '12560': require('../../assets/drinks/12560.jpg'), // Afterglow
  '12562': require('../../assets/drinks/12562.jpg'), // Alice Cocktail
  '12564': require('../../assets/drinks/12564.jpg'), // Apple Karate
  '12572': require('../../assets/drinks/12572.jpg'), // Bora Bora
  '12618': require('../../assets/drinks/12618.jpg'), // Orangeade
  '12630': require('../../assets/drinks/12630.jpg'), // Rail Splitter
  '12654': require('../../assets/drinks/12654.jpg'), // Banana Milk Shake
  '12656': require('../../assets/drinks/12656.jpg'), // Banana Strawberry Shake
  '12658': require('../../assets/drinks/12658.jpg'), // Banana Strawberry Shake Daiquiri
  '12668': require('../../assets/drinks/12668.jpg'), // Egg Cream
  '12670': require('../../assets/drinks/12670.jpg'), // Fruit Cooler
  '12672': require('../../assets/drinks/12672.jpg'), // Fruit Flip-Flop
  '12674': require('../../assets/drinks/12674.jpg'), // Fruit Shake
  '12688': require('../../assets/drinks/12688.jpg'), // Just a Moonmint
  '12690': require('../../assets/drinks/12690.jpg'), // Lassi - A South Indian Drink
  '12692': require('../../assets/drinks/12692.jpg'), // Lassi Khara
  '12694': require('../../assets/drinks/12694.jpg'), // Lassi Raita
  '12696': require('../../assets/drinks/12696.jpg'), // Lassi - Sweet
  '12698': require('../../assets/drinks/12698.jpg'), // Lassi - Mango
  '12702': require('../../assets/drinks/12702.jpg'), // Lemouroudji
  '12704': require('../../assets/drinks/12704.jpg'), // Limeade
  '12708': require('../../assets/drinks/12708.jpg'), // Banana Cantaloupe Smoothie
  '12710': require('../../assets/drinks/12710.jpg'), // Apple Berry Smoothie
  '12712': require('../../assets/drinks/12712.jpg'), // Grape lemon pineapple Smoothie
  '12714': require('../../assets/drinks/12714.jpg'), // Kiwi Papaya Smoothie
  '12716': require('../../assets/drinks/12716.jpg'), // Mango Orange Smoothie
  '12718': require('../../assets/drinks/12718.jpg'), // Pineapple Gingerale Smoothie
  '12720': require('../../assets/drinks/12720.jpg'), // Kill the cold Smoothie
  '12722': require('../../assets/drinks/12722.jpg'), // Strawberry Shivers
  '12724': require('../../assets/drinks/12724.jpg'), // Sweet Bananas
  '12726': require('../../assets/drinks/12726.jpg'), // Tomato Tang
  '12728': require('../../assets/drinks/12728.jpg'), // Yoghurt Cooler
  '12730': require('../../assets/drinks/12730.jpg'), // Castillian Hot Chocolate
  '12732': require('../../assets/drinks/12732.jpg'), // Chocolate Beverage
  '12734': require('../../assets/drinks/12734.jpg'), // Chocolate Drink
  '12736': require('../../assets/drinks/12736.jpg'), // Drinking Chocolate
  '12738': require('../../assets/drinks/12738.jpg'), // Hot Chocolate to Die for
  '12744': require('../../assets/drinks/12744.jpg'), // Microwave Hot Cocoa
  '12746': require('../../assets/drinks/12746.jpg'), // Nuked Hot Chocolate
  '12748': require('../../assets/drinks/12748.jpg'), // Orange Scented Hot Chocolate
  '12750': require('../../assets/drinks/12750.jpg'), // Spanish chocolate
  '12768': require('../../assets/drinks/12768.jpg'), // Frappé
  '12770': require('../../assets/drinks/12770.jpg'), // Iced Coffee
  '12774': require('../../assets/drinks/12774.jpg'), // Masala Chai
  '12776': require('../../assets/drinks/12776.jpg'), // Melya
  '12780': require('../../assets/drinks/12780.jpg'), // Spiking coffee
  '12782': require('../../assets/drinks/12782.jpg'), // Thai Coffee
  '12784': require('../../assets/drinks/12784.jpg'), // Thai Iced Coffee
  '12786': require('../../assets/drinks/12786.jpg'), // Thai Iced Tea
  '12862': require('../../assets/drinks/12862.jpg'), // Aloha Fruit punch
  '12890': require('../../assets/drinks/12890.jpg'), // Cranberry Punch
  '12954': require('../../assets/drinks/12954.jpg'), // Holloween Punch
  '13032': require('../../assets/drinks/13032.jpg'), // Spiced Peach Punch
  '13036': require('../../assets/drinks/13036.jpg'), // Strawberry Lemonade
  '15092': require('../../assets/drinks/15092.jpg'), // Pysch Vitamin Light
  '15106': require('../../assets/drinks/15106.jpg'), // Apello
  '17108': require('../../assets/drinks/17108.jpg'), // Coke and Drops
  '17176': require('../../assets/drinks/17176.jpg'), // Ipamena
};

/** Local photo for a TheCocktailDB drink id, or undefined if we have none. */
export function drinkPhoto(id: string | number | undefined | null): ImageSourcePropType | undefined {
  if (id === undefined || id === null) return undefined;
  return DRINK_PHOTOS[String(id)];
}

export const DRINK_PHOTO_COUNT = Object.keys(DRINK_PHOTOS).length;
