import type { Language } from '../i18n';
import { BiPart, partName, scaledAmount } from './recipeParts';

/**
 * Shopping list (README → Shopping list; prototype `addShop`). An item is one
 * ingredient, keyed by its English name; adding the same ingredient again appends
 * its amount ("100 ml + 60 ml") and un-ticks it. Names and amounts are kept in both
 * languages, so the list follows the language switch.
 */
export interface ShoppingAmount {
  text: [string, string | null];
  /** Servings multiplier at the time it was added (servings ÷ written servings). */
  factor: number;
  /** False for a 1.1 line whose measure is inside the name. */
  split: boolean;
}

export interface ShoppingItem {
  key: string;
  name: [string, string | null];
  amounts: ShoppingAmount[];
  ticked: boolean;
}

/** Ice and water are skipped: nobody shops for them. */
const SKIPPED_KEYS = ['ice', 'water'];

/** Adds a recipe's ingredients at the current servings. Returns the new list and how many were added. */
export function addToShoppingList(
  items: readonly ShoppingItem[],
  parts: readonly BiPart[],
  factor: number
): { items: ShoppingItem[]; added: number } {
  const next = items.map(item => ({ ...item, amounts: [...item.amounts] }));
  let added = 0;
  for (const part of parts) {
    if (part.key && SKIPPED_KEYS.includes(part.key)) continue;
    const key = part.name[0].trim().toLowerCase();
    const amount: ShoppingAmount = { text: part.amount, factor, split: part.split };
    const existing = next.find(item => item.key === key);
    if (existing) {
      existing.amounts.push(amount);
      existing.ticked = false;
    } else {
      next.push({ key, name: part.name, amounts: [amount], ticked: false });
    }
    added++;
  }
  return { items: next, added };
}

export function itemName(item: ShoppingItem, lang: Language): string {
  return partName({ name: item.name, amount: ['', null], key: null, split: true }, lang);
}

/** "100 ml + 60 ml" in the current language; empty when nothing was measured. */
export function itemAmount(item: ShoppingItem, lang: Language): string {
  return item.amounts
    .filter(a => a.split)
    .map(a => scaledAmount(a.text, a.factor, lang))
    .filter(Boolean)
    .join(' + ');
}

/** Plain text for the share sheet: "• Lime juice — 100 ml + 60 ml". */
export function shoppingListText(items: readonly ShoppingItem[], lang: Language): string {
  return items
    .map(item => {
      const amount = itemAmount(item, lang);
      return `• ${itemName(item, lang)}${amount ? ` — ${amount}` : ''}`;
    })
    .join('\n');
}
