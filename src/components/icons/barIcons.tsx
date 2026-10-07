import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconProps } from './index';

/** Outline icons from the 1.2 prototype (24 × 24, stroke 2, round caps). */
const outline = (paths: string[]) =>
  ({ size = 20, color = '#99A1AF', strokeWidth = 2, ...props }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {paths.map(d => (
        <Path key={d} d={d} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </Svg>
  );

/** The My Bar tab and the paywall's "What can I make": a stemmed glass. */
export const GlassIcon = outline(['M8 22h8M12 11v11M19 3l-7 8-7-8Z', 'M7.5 6h9']);
export const ChevronDownIcon = outline(['m6 9 6 6 6-6']);
/** Empty shopping list. */
export const BagIcon = outline(['M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z', 'M3 6h18', 'M16 10a4 4 0 0 1-8 0']);

/** Add ingredients sheet: "Most used" and the nine groups. */
export const GROUP_ICONS = {
  popular: outline(['M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z']),
  gFruit: outline([
    'M21.66 17.67a1.08 1.08 0 0 1-.04 1.6A12 12 0 0 1 4.73 2.38a1.1 1.1 0 0 1 1.61-.04z',
    'M19.65 15.66A8 8 0 0 1 8.35 4.34',
    'm14 10-5.5 5.5',
    'M14 17.85V10H6.15',
  ]),
  gDairy: outline([
    'M8 2h8',
    'M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.789a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2',
    'M7 15a6.472 6.472 0 0 1 5 0 6.47 6.47 0 0 0 5 0',
  ]),
  gSweet: outline([
    'm9.5 7.5-2 2a4.95 4.95 0 1 0 7 7l2-2a4.95 4.95 0 1 0-7-7Z',
    'M14 6.5v10',
    'M10 7.5v10',
    'm16 7 1-5 1.37.68A3 3 0 0 0 19.7 3H21v1.3c0 .46.1.92.32 1.33L22 7l-5 1',
    'm8 17-1 5-1.37-.68A3 3 0 0 0 4.3 21H3v-1.3a3 3 0 0 0-.32-1.33L2 17l5-1',
  ]),
  gSyrups: outline(['M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z']),
  gBases: outline(['M8 22h8', 'M7 10h10', 'M12 15v7', 'M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z']),
  gSoda: outline([
    'm6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8',
    'M5 8h14',
    'M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0',
    'm12 8 1-6h2',
  ]),
  gCoffee: outline([
    'M10 2v2',
    'M14 2v2',
    'M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1',
    'M6 2v2',
  ]),
  gHerbs: outline([
    'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z',
    'M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12',
  ]),
  gPantry: outline([
    'M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z',
    'M12 22V12',
    'm3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7',
    'm7.5 4.27 9 5.15',
  ]),
};
